# AxisStudio - AI-Powered Web IDE

![axisStudio Thumbnail](public\axisstudio\readme\AxisStudio-Thumbnail.png)

`axisStudio` is a browser IDE built with Next.js App Router, WebContainers, Monaco Editor, Auth.js, Neon Postgres, Drizzle ORM, and Ollama-compatible AI endpoints. It gives you playground creation, a live preview runtime, file management, AI chat, and inline code suggestions in one workspace.

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
OLLAMA_BASE_URL=http://localhost:11434/api
OLLAMA_MODEL=codellama:latest
```

`axisStudio` also accepts a PostgreSQL `DATABASE_URL`, but `POSTGRES_URL` is preferred so an old MongoDB env var does not get reused accidentally.

### 4. Push the Drizzle schema

After `POSTGRES_URL` points at your Neon database:

```bash
npm run db:push
```

### 5. Start Ollama

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

The playground AI controls now read `/api/health`, so they show whether Ollama
is reachable and whether `codellama:latest` is available before chat and inline
suggestions are used.

Or set `OLLAMA_BASE_URL` and `OLLAMA_MODEL` to a remote compatible endpoint.

### 6. Run the app

```bash
npm run dev
```

Open `http://localhost:3000`.

## Database Commands

```bash
npm run db:generate
npm run db:push
npm run db:studio
```

## Vercel Deployment

1. Create a Neon Postgres database from the Vercel Marketplace.
2. Add `POSTGRES_URL` to the project, or use the injected integration variable.
3. Add `AUTH_SECRET`, OAuth provider credentials, `NEXTAUTH_URL`, and the Ollama env vars.
4. Update the GitHub and Google OAuth callback URLs:
   `https://your-domain/api/auth/callback/github`
   `https://your-domain/api/auth/callback/google`
5. Run `npm run db:push` against the production Neon database before the first production sign-in.

## Docker, GitHub Actions, and AWS EKS Deployment

This repo now includes:

- `Dockerfile` for a production Next.js standalone image
- `.github/workflows/docker-k8s-deploy.yml` for GitHub Actions based GitHub Container Registry build and Amazon EKS deploy
- `k8s/base` and `k8s/overlays/production` manifests for Kubernetes rollout
- `k8s/overlays/aws-eks` for AWS EKS rollout through an AWS Network Load Balancer

### GitHub Secrets Required

- `AWS_REGION`
- `EKS_CLUSTER_NAME`
- `AUTH_SECRET`
- `AUTH_GOOGLE_ID`
- `AUTH_GOOGLE_SECRET`
- `AUTH_GITHUB_ID`
- `AUTH_GITHUB_SECRET`
- `NEXTAUTH_URL`
- `POSTGRES_URL`
- `OLLAMA_BASE_URL`
- `OLLAMA_MODEL`

Optional:

- `OLLAMA_API_KEY`
- `AWS_ROLE_TO_ASSUME`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `EKS_KUBECTL_ROLE_ARN`
- `GHCR_PULL_USERNAME`
- `GHCR_PULL_TOKEN`

### What the workflow does

1. Builds the app into a Docker image
2. Pushes the image to GitHub Container Registry as `ghcr.io/<owner>/axisstudio`
3. Creates or updates the `axisstudio-env` Kubernetes secret
4. Updates kubeconfig for Amazon EKS
5. Applies the AWS EKS manifests
6. Attaches a GHCR `imagePullSecret` when GHCR pull credentials are configured
7. Waits for the deployment rollout to finish

### Notes

- Prefer `AWS_ROLE_TO_ASSUME` for GitHub OIDC-based AWS auth. If you do not use OIDC, provide `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` instead.
- `EKS_CLUSTER_NAME` is the target cluster name for `aws eks update-kubeconfig`.
- `EKS_KUBECTL_ROLE_ARN` is only needed when kubectl must assume a different role than the one used to authenticate GitHub Actions.
- If the GHCR package is private, add `GHCR_PULL_USERNAME` and `GHCR_PULL_TOKEN` so the workflow can create `ghcr-pull-secret` in the cluster.
- If the GHCR package is public, the GHCR pull secrets are not required.
- The app health probe is exposed at `/api/health`.

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
