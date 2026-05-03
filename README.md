# axisStudio - AI-Powered Web IDE

![axisStudio Thumbnail](public/axisstudio/readme/thumbnail.svg)

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
