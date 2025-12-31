from __future__ import annotations

import logging
import time
from typing import Optional

import numpy as np
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .db import (
    ROLE_ADMIN,
    ROLE_AFFILIATE,
    ROLE_USER,
    add_credits,
    create_user,
    get_user_by_api_key,
    get_user_by_id,
    get_user_by_username,
    init_db,
)
from .models import (
    CardResponse,
    CombinationResponse,
    CreditRequest,
    CreditResponse,
    CreateUserRequest,
    GenerateRequest,
    GenerateResponse,
    LoginRequest,
    LoginResponse,
    UserResponse,
)
from .security import verify_password
from .services.data import HistoryCache, get_last_concurso
from .services.generator import generate_cards
from .services.rate_limit import RateLimiter
from .services.scoring import compute_number_scores

logging.basicConfig(
    level=settings.log_level,
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
)
logger = logging.getLogger("mega_facil")

app = FastAPI(title="MEGA FACIL API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

history_cache = HistoryCache(settings.csv_path)
rate_limiter = RateLimiter(settings.rate_limit_max_requests, settings.rate_limit_window_seconds)


@app.on_event("startup")
def startup() -> None:
    init_db(settings.db_path)
    if settings.admin_username and settings.admin_password:
        existing = get_user_by_username(settings.db_path, settings.admin_username)
        if not existing:
            admin = create_user(
                settings.db_path,
                settings.admin_username,
                settings.admin_password,
                ROLE_ADMIN,
            )
            logger.info(
                "admin_created username=%s id=%s api_key=%s",
                admin.username,
                admin.id,
                admin.api_key,
            )


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "timestamp": int(time.time())}


@app.post("/auth/login", response_model=LoginResponse)
def login(req: LoginRequest) -> LoginResponse:
    user = get_user_by_username(settings.db_path, req.username)
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="Credenciais inválidas.")
    if not verify_password(req.password, user.password_salt, user.password_hash):
        raise HTTPException(status_code=401, detail="Credenciais inválidas.")

    return LoginResponse(
        id=user.id,
        username=user.username,
        role=user.role,
        credits=user.credits,
        api_key=user.api_key,
    )


@app.post("/admin/users", response_model=UserResponse)
def admin_create_user(req: CreateUserRequest, request: Request) -> UserResponse:
    admin = _require_admin(request)
    role = req.role.lower()
    if role not in {ROLE_USER, ROLE_AFFILIATE, ROLE_ADMIN}:
        raise HTTPException(status_code=400, detail="Role inválida.")

    user = create_user(
        settings.db_path,
        req.username,
        req.password,
        role,
        credits=req.credits,
    )

    logger.info(
        "admin_create_user admin_id=%s user_id=%s role=%s credits=%s",
        admin.id,
        user.id,
        user.role,
        user.credits,
    )

    return UserResponse(
        id=user.id,
        username=user.username,
        role=user.role,
        credits=user.credits,
        api_key=user.api_key,
    )


@app.post("/admin/credits", response_model=CreditResponse)
def admin_adjust_credits(req: CreditRequest, request: Request) -> CreditResponse:
    admin = _require_admin(request)

    if req.user_id:
        user = get_user_by_id(settings.db_path, req.user_id)
    else:
        user = get_user_by_username(settings.db_path, req.username or "")

    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")

    try:
        new_total = add_credits(
            settings.db_path,
            user.id,
            req.delta,
            req.reason,
            admin.id,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    logger.info(
        "admin_adjust_credits admin_id=%s user_id=%s delta=%s new_total=%s",
        admin.id,
        user.id,
        req.delta,
        new_total,
    )

    return CreditResponse(user_id=user.id, credits=new_total)


@app.post("/generate", response_model=GenerateResponse)
def generate(req: GenerateRequest, request: Request) -> GenerateResponse:
    client_ip = _get_client_ip(request)

    allowed, retry_after = rate_limiter.allow(client_ip)
    if not allowed:
        raise HTTPException(
            status_code=429,
            detail="Rate limit excedido. Tente novamente mais tarde.",
            headers={"Retry-After": str(retry_after)},
        )

    if not req.pagamento_confirmado:
        raise HTTPException(status_code=403, detail="Pagamento não confirmado.")

    user = get_user_by_id(settings.db_path, req.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Usuário inativo.")

    api_key = request.headers.get("x-api-key")
    if settings.require_api_key:
        if not api_key:
            raise HTTPException(status_code=401, detail="API key ausente.")
        if api_key != user.api_key:
            raise HTTPException(status_code=401, detail="API key inválida.")
    elif api_key and api_key != user.api_key:
        raise HTTPException(status_code=401, detail="API key inválida.")

    cost = req.cartoes * settings.credits_per_card
    if user.credits < cost:
        raise HTTPException(status_code=402, detail="Créditos insuficientes.")

    try:
        history_df = history_cache.get()
    except (FileNotFoundError, ValueError) as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    if history_df.empty:
        raise HTTPException(status_code=500, detail="CSV sem dados válidos.")

    window_size = req.window_size or settings.window_size
    score_result = compute_number_scores(history_df, window_size)

    rng = np.random.default_rng(_resolve_seed(req))

    try:
        cards = generate_cards(
            score_result.scores,
            score_result.groups,
            rng,
            req.cartoes,
            settings.combinations_per_card,
        )
    except ValueError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    try:
        new_total = add_credits(
            settings.db_path,
            user.id,
            -cost,
            "geracao_cartoes",
            user.id,
        )
    except ValueError as exc:
        raise HTTPException(status_code=402, detail=str(exc)) from exc

    last_concurso = get_last_concurso(history_df)
    logger.info(
        "generation ip=%s user_id=%s cards=%s combos_per_card=%s window=%s last_concurso=%s credits=%s",
        client_ip,
        req.user_id,
        req.cartoes,
        settings.combinations_per_card,
        window_size,
        last_concurso,
        new_total,
    )

    response_cards = []
    for card in cards:
        combinations = [
            CombinationResponse(
                numeros=combo.numbers,
                score=combo.score,
                explicacao=combo.explanation,
            )
            for combo in card.combinations
        ]
        response_cards.append(CardResponse(id=card.card_id, combinacoes=combinations))

    return GenerateResponse(cartoes=response_cards)


def _resolve_seed(req: GenerateRequest) -> Optional[int]:
    if req.seed is not None:
        return req.seed
    if settings.seed is not None:
        return settings.seed
    return None


def _get_client_ip(request: Request) -> str:
    if settings.trust_proxy_headers:
        forwarded_for = request.headers.get("x-forwarded-for")
        if forwarded_for:
            return forwarded_for.split(",")[0].strip()
    if request.client:
        return request.client.host
    return "unknown"


def _require_admin(request: Request):
    api_key = request.headers.get("x-api-key")
    if not api_key:
        raise HTTPException(status_code=401, detail="API key ausente.")
    user = get_user_by_api_key(settings.db_path, api_key)
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="API key inválida.")
    if user.role != ROLE_ADMIN:
        raise HTTPException(status_code=403, detail="Acesso restrito ao admin.")
    return user
