# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

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
