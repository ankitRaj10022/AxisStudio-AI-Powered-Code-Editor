# Optional Kubernetes Manifests

This directory contains optional self-hosting manifests for `axisStudio`.
The primary production deployment path for this repo is Vercel, not Kubernetes.

## Layout

- `base/`
  - Namespace, Deployment, and Service
- `overlays/production/`
  - Generic production ingress-based overlay

## Required Kubernetes Secret

The Deployment expects a secret named `axisstudio-env` in the `axisstudio` namespace.

Required keys:

- `AUTH_SECRET`
- `AUTH_GOOGLE_ID`
- `AUTH_GOOGLE_SECRET`
- `AUTH_GITHUB_ID`
- `AUTH_GITHUB_SECRET`
- `NEXTAUTH_URL`
- `POSTGRES_URL`
- `OLLAMA_BASE_URL`
- `OLLAMA_MODEL`

Optional key:

- `OLLAMA_API_KEY`

## Local Apply

```bash
kubectl apply -k k8s/overlays/production
```

Update `k8s/overlays/production/ingress.yaml` with your real host before applying manually.
