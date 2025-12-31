from __future__ import annotations

from pydantic import BaseModel, Field, model_validator


class LoginRequest(BaseModel):
    username: str = Field(..., min_length=1)
    password: str = Field(..., min_length=1)


class LoginResponse(BaseModel):
    id: str
    username: str
    role: str
    credits: int
    api_key: str


class GenerateRequest(BaseModel):
    cartoes: int = Field(..., ge=1, le=50)
    user_id: str = Field(..., min_length=1)
    pagamento_confirmado: bool
    window_size: int | None = Field(default=None, ge=1, le=500)
    seed: int | None = None

    model_config = {"extra": "forbid"}


class CombinationResponse(BaseModel):
    numeros: list[int]
    score: float
    explicacao: str


class CardResponse(BaseModel):
    id: str
    combinacoes: list[CombinationResponse]


class GenerateResponse(BaseModel):
    cartoes: list[CardResponse]


class CreateUserRequest(BaseModel):
    username: str = Field(..., min_length=1)
    password: str = Field(..., min_length=6)
    role: str = Field(..., min_length=1)
    credits: int = Field(default=0, ge=0)


class UserResponse(BaseModel):
    id: str
    username: str
    role: str
    credits: int
    api_key: str


class CreditRequest(BaseModel):
    user_id: str | None = None
    username: str | None = None
    delta: int
    reason: str | None = None

    @model_validator(mode="after")
    def validate_target(self) -> "CreditRequest":
        if not self.user_id and not self.username:
            raise ValueError("user_id or username is required")
        return self


class CreditResponse(BaseModel):
    user_id: str
    credits: int
