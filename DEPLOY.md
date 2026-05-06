# Deploy

This project is ready for Vercel as a static app.

## Recommended Auto Deploy

1. Push this repo to GitHub.
2. Open Vercel and import the GitHub repository.
3. Keep the default static project settings.
4. Every push to `main` will deploy automatically.

## GitHub Actions Fallback

The workflow at `.github/workflows/vercel.yml` can deploy on push when these repository secrets are added:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

The Vercel Git integration is simpler if you can use it.
