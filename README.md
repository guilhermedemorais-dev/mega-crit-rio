# MEGA FÁCIL

Backend e frontend do MEGA FÁCIL, um web app que gera combinações da Mega-Sena
com base em análise estatística do histórico de sorteios. O sistema não prevê
resultados futuros, não garante prêmio e atua apenas como ferramenta auxiliar.

**Domínio oficial**: https://magaacil.online  
**Desenvolvido por**: GMP Tecnologia

## Aviso legal

Este projeto é de uso restrito. O uso comercial é proibido sem autorização
expressa do autor. Cópias e clones não autorizados poderão resultar em medidas
legais.

## Como posso editar este código? (PT-BR)

Há várias formas de editar a aplicação.

**Usar sua IDE**

Você pode clonar este repositório, editar localmente e fazer push.

Pré-requisito: Node.js & npm instalados (recomendado usar nvm).

```sh
# Passo 1: Clonar o repositório
git clone <YOUR_GIT_URL>

# Passo 2: Entrar na pasta do projeto
cd <YOUR_PROJECT_NAME>

# Passo 3: Instalar dependências
npm i

# Passo 4: Rodar o servidor de desenvolvimento
npm run dev
```

**Editar direto no GitHub**

- Abra o arquivo desejado.
- Clique em “Edit” (ícone de lápis).
- Faça as alterações e salve o commit.

**Usar GitHub Codespaces**

- Abra a página do repositório.
- Clique em “Code” → “Codespaces” → “New codespace”.
- Edite, faça commit e push.

## Quais tecnologias são usadas? (PT-BR)

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Como faço o deploy? (PT-BR)

Para frontend estático: execute `npm run build` e publique a pasta `dist/`.
Para backend Node: execute `node server/index.js` com as variáveis de ambiente.

## Posso conectar um domínio personalizado? (PT-BR)

Sim. Aponte o DNS do domínio para o servidor/provedor onde o app está hospedado.

## Backend (FastAPI)

O backend está em `backend/` e usa um CSV com colunas: `concurso,n1,n2,n3,n4,n5,n6`.

### Executar localmente

```sh
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
export MEGA_FACIL_CSV_PATH=./data/mega_sena.csv
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Variáveis de ambiente úteis

- `MEGA_FACIL_CSV_PATH` caminho do CSV histórico
- `MEGA_FACIL_WINDOW_SIZE` tamanho da janela recente (padrão 50)
- `MEGA_FACIL_SEED` define seed fixa para reprodutibilidade
- `MEGA_FACIL_RATE_LIMIT_MAX` requisições por janela (padrão 20)
- `MEGA_FACIL_RATE_LIMIT_WINDOW` janela em segundos (padrão 60)
- `MEGA_FACIL_ALLOWED_ORIGINS` CORS, separado por vírgulas (padrão `*`)
- `MEGA_FACIL_DB_PATH` caminho do SQLite (padrão `backend/data/mega_facil.db`)
- `MEGA_FACIL_ADMIN_USERNAME` cria admin automaticamente no startup
- `MEGA_FACIL_ADMIN_PASSWORD` senha do admin criado no startup
- `MEGA_FACIL_CREDITS_PER_CARD` custo em créditos por cartão
- `MEGA_FACIL_REQUIRE_API_KEY` exige API key para geração (padrão `false`)

### Frontend -> Backend

Defina no frontend:

```sh
VITE_API_BASE_URL=http://localhost:8000
VITE_DEFAULT_USER_ID=<user_id_do_admin>
VITE_API_KEY=<api_key_do_admin>
```

### Login e acesso

- O app exige login via `/auth/login` (salva `user_id` e `api_key` no navegador).
- `/app` exige login; `/admin` exige role `admin`.
- `/generate` só responde com `X-Api-Key` válida e créditos disponíveis.
- Usuários podem se cadastrar via `/auth/register` (role `user`, créditos 0).

## Backend (Node.js + MySQL) - recomendado para Hostinger

O backend Node roda no mesmo projeto e serve o `dist/` do frontend quando existir.

### Variáveis de ambiente (Node)

- `MEGA_FACIL_DB_HOST`
- `MEGA_FACIL_DB_PORT`
- `MEGA_FACIL_DB_USER`
- `MEGA_FACIL_DB_PASSWORD`
- `MEGA_FACIL_DB_NAME`
- `MEGA_FACIL_CSV_PATH` (padrão `backend/data/mega_sena.csv`)
- `MEGA_FACIL_ALLOWED_ORIGINS` (padrão `*`)
- `MEGA_FACIL_REQUIRE_API_KEY` (padrão `true`)

### Executar localmente (Node)

```sh
npm install
npm run build
MEGA_FACIL_DB_HOST=localhost \
MEGA_FACIL_DB_USER=root \
MEGA_FACIL_DB_PASSWORD= \
MEGA_FACIL_DB_NAME=mega_facil \
node server/index.js
```

Obs: o banco `MEGA_FACIL_DB_NAME` deve existir no MySQL antes de iniciar.

### Criar usuário admin (Node)

```sh
node server/scripts/createUser.js --username admin@mega.com --password "SuaSenha" --role admin --credits 10
```

### Ajustar créditos (Node)

```sh
node server/scripts/addCredits.js --username admin@mega.com --delta 3 --reason ajuste_admin
```

### Criar usuários pelo terminal

```sh
cd backend
python scripts/create_user.py --username admin --password "SuaSenhaForte" --role admin --credits 10
python scripts/create_user.py --username afiliado01 --password "SenhaAfiliado" --role affiliate --credits 5
```

### Ajustar créditos pelo terminal

```sh
cd backend
python scripts/add_credits.py --username admin --delta 3 --reason ajuste_admin
```
