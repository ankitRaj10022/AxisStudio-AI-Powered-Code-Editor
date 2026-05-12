# AxisStudio - AI-Powered Web IDE

![axisStudio Thumbnail](public/axisstudio/readme/AxisStudio-Thumbnail.png)

AxisStudio is a browser IDE built with Next.js App Router, WebContainers, Monaco Editor, Auth.js, Neon Postgres, Drizzle ORM, and Ollama-compatible AI endpoints. It gives you playground creation, a live preview runtime, file management, AI chat, and inline code suggestions in one workspace.

Live Project URL: [https://axisstudio-codeeditor.vercel.app/](https://axisstudio-codeeditor.vercel.app/)

## Features

- OAuth login with Google and GitHub via Auth.js
- Neon Postgres persistence through Drizzle ORM
- Browser-based editor, file explorer, terminal, and live preview
- AI chat and inline AI suggestions powered by Ollama-compatible endpoints
- Template-based playground creation for React, Next.js, Express, Hono, Vue, and Angular
- Responsive UI with motion graphics and an editor-first workspace shell

## Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 15 (App Router) |
| Styling | Tailwind CSS, shadcn/ui |
| Language | TypeScript |
| Auth | Auth.js |
| Editor | Monaco Editor |
| Runtime | WebContainers |
| Terminal | xterm.js |
| Database | Neon Postgres + Drizzle ORM |
| AI | Ollama-compatible models |

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/ankitRaj10022/AxisStudio-AI-Powered-Code-Editor.git
cd AxisStudio-AI-Powered-Code-Editor
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create the local env file

```powershell
Copy-Item .env.example .env.local
```

Fill in the values:

```env
AUTH_SECRET=your_auth_secret
AUTH_GOOGLE_ID=your_google_client_id
AUTH_GOOGLE_SECRET=your_google_client_secret
AUTH_GITHUB_ID=your_github_client_id
AUTH_GITHUB_SECRET=your_github_client_secret
NEXTAUTH_URL=http://localhost:3000
POSTGRES_URL=postgresql://user:password@host:5432/axisstudio?sslmode=require
OLLAMA_BASE_URL=https://ollama.com/api
OLLAMA_MODEL=qwen3-coder-next
OLLAMA_API_KEY=your_ollama_cloud_api_key
```

`axisStudio` also accepts a PostgreSQL `DATABASE_URL`, but `POSTGRES_URL` is preferred so an old MongoDB env var does not get reused accidentally.

### 4. Push the Drizzle schema

After `POSTGRES_URL` points at your Neon database:

```bash
npm run db:push
```

### 5. Configure AI access

The supported default is Ollama Cloud. Keep `OLLAMA_BASE_URL=https://ollama.com/api`,
choose a cloud model such as `qwen3-coder-next`, and provide `OLLAMA_API_KEY`.

The playground AI controls read `/api/health`, so they show whether the configured
Ollama endpoint is reachable and whether the selected model is available before
chat and inline suggestions are used.

### 6. Run the app

```bash
npm run dev
```

Open `http://localhost:3000`.

## Optional Local Ollama Setup

If you want local AI instead of Ollama Cloud, switch these env vars:

```env
OLLAMA_BASE_URL=http://localhost:11434/api
OLLAMA_MODEL=codellama:latest
```

Then start Ollama locally:

```bash
ollama run codellama
```

If your Ollama model store lives outside the default location, start the daemon
with `OLLAMA_MODELS` pointed at that folder before opening the app. For this
repository's current local setup:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\start-ollama.ps1
```

Or run the equivalent manually:

```powershell
$env:OLLAMA_MODELS="X:\Ollama"
ollama serve
```

Then confirm the model is visible:

```powershell
ollama list
```

## Database Commands

```bash
npm run db:generate
npm run db:push
npm run db:studio
```

## Vercel Deployment

The supported production path is direct Git-based deployment through Vercel.

Current production deployment:
`https://axisstudio-codeeditor.vercel.app/`

1. Import the GitHub repository into Vercel.
2. Create a Neon Postgres database from the Vercel Marketplace, or provide your existing production `POSTGRES_URL`.
3. Add these production environment variables in Vercel:
   `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`, `NEXTAUTH_URL`, `POSTGRES_URL`, `OLLAMA_BASE_URL`, `OLLAMA_MODEL`, `OLLAMA_API_KEY`
4. Use Ollama Cloud values for hosted AI:
   `OLLAMA_BASE_URL=https://ollama.com/api`
   `OLLAMA_MODEL=qwen3-coder-next`
5. Update the GitHub and Google OAuth callback URLs:
   `https://axisstudio-codeeditor.vercel.app/api/auth/callback/github`
   `https://axisstudio-codeeditor.vercel.app/api/auth/callback/google`
6. Run `npm run db:push` against the production database before the first production sign-in.
7. Push to `main` and let Vercel deploy directly from Git.

If you later attach a custom domain, update `NEXTAUTH_URL` in Vercel to that domain and mirror the same domain in the OAuth provider settings.

## WSL Docker Workflow

For local container work on Windows, use Docker Desktop with the WSL 2 backend and run Docker from your Linux shell.

```bash
wsl
cd /mnt/c/Users/danny/Desktop/AxisStudio/axisStudio
docker build -t axisstudio:local .
docker run --rm -p 3000:3000 --env-file .env axisstudio:local
```

If you use VS Code, open the project inside WSL and run Docker commands there for a cleaner Linux-native workflow.

## Project Structure

```text
.
├── app/                     # App Router pages and API routes
├── components/              # Shared UI primitives
├── features/                # Auth, dashboard, playground, AI, webcontainer modules
├── lib/                     # Database, auth, utilities, brand assets
├── public/                  # Static assets and README thumbnail
├── axisStudio-staters/      # Playground starter templates
├── k8s/                     # Optional self-hosting manifests
├── drizzle.config.ts        # Drizzle Kit configuration
├── .env.example             # Environment template
└── README.md
```

## Keyboard Shortcuts

- `Ctrl + Space` or `Double Enter`: trigger AI suggestions
- `Tab`: accept AI suggestion
- `Ctrl + S`: save the active file in the playground

## License

This project is licensed under the [MIT License](LICENSE).

## Acknowledgements

- [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- [Ollama](https://ollama.com/)
- [WebContainers](https://webcontainers.io/)
- [xterm.js](https://xtermjs.org/)
- [Auth.js](https://authjs.dev/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Neon](https://neon.tech/)
