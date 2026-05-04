# Kubernetes Deployment

This directory contains deployment paths for `axisStudio`.

## Layout

- `base/`
  - Namespace, Deployment, and Service
- `overlays/production/`
  - Generic production ingress-based overlay
- `overlays/aws-eks/`
  - AWS EKS overlay using an internet-facing Network Load Balancer service

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

Optional image pull keys:

- `GHCR_PULL_USERNAME`
- `GHCR_PULL_TOKEN`

## Local Apply

```bash
kubectl apply -k k8s/overlays/production
```

Update `k8s/overlays/production/ingress.yaml` with your real host before applying manually.

## AWS EKS Apply

```bash
kubectl apply -k k8s/overlays/aws-eks
```

The AWS EKS overlay exposes the app through a `LoadBalancer` service with AWS NLB annotations. Point your domain to the resulting load balancer hostname and make sure `NEXTAUTH_URL` matches the public URL you intend to use.

If the container image in GitHub Container Registry is private, create a `ghcr-pull-secret` in the namespace or let the GitHub Actions workflow create it from `GHCR_PULL_USERNAME` and `GHCR_PULL_TOKEN`.
