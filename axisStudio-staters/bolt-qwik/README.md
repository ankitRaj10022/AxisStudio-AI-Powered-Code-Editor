# Qwik Starter For axisStudio

- [Qwik Docs](https://qwik.dev/)
- [Discord](https://qwik.dev/chat)
- [Qwik GitHub](https://github.com/QwikDev/qwik)
- [@QwikDev](https://twitter.com/QwikDev)
- [Vite](https://vitejs.dev/)

---

## Project Structure

This project uses Qwik with [QwikCity](https://qwik.dev/qwikcity/overview/). QwikCity adds routing, layouts, and server features on top of the base Qwik app.

Inside your project, you'll see the following directory structure:

```text
public/
src/
  components/
  routes/
```

- `src/routes`: Directory-based routing, layouts, pages, and endpoints. See the [routing docs](https://qwik.dev/qwikcity/routing/overview/).
- `src/components`: Recommended directory for UI components.
- `public`: Static assets such as images and icons. See the [Vite public directory guide](https://vitejs.dev/guide/assets.html#the-public-directory).

## Add Integrations And Deployment

Use `pnpm qwik add` to install additional integrations such as Cloudflare, Netlify, Express, or SSG support.

```shell
pnpm qwik add
```

## Development

Development mode uses [Vite's dev server](https://vitejs.dev/).

```shell
npm start
```

## Preview

The preview command creates a production build and serves it locally.

```shell
pnpm preview
```

## Production

The production build generates both client and server output and runs a type check.

```shell
pnpm build
```

## Static Site Generator

```shell
npm run build.server
```
