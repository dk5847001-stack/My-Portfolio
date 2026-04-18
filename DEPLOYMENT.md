# Deployment Guide

## Target architecture

- `client` deploy to Vercel
- `admin` deploy to Vercel
- `server` deploy to Render
- `database` connect to MongoDB Atlas

## Vercel frontend deployment

Create one Vercel project for `client` and another for `admin`.

- Root Directory: `client` or `admin`
- Build Command: already defined in each app's `vercel.json`
- Output Directory: `dist`
- Environment variable:
  - `VITE_API_URL=https://your-backend-service.onrender.com/api`

## Render backend deployment

This repo includes [render.yaml](E:\PORTFOLIO\portfolio1\portfolio\render.yaml) for the API service.

- Service name: `portfolio-api`
- Health check: `/api/health`
- Build command: `npm install`
- Start command: `npm run start:server`
- Auto deploy: only after CI checks pass

Set these secret environment variables in Render:

- `MONGODB_URI`
- `CLIENT_ORIGINS`
- `JWT_SECRET`
- `GITHUB_USERNAME`
- `GITHUB_TOKEN`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`
- `NOTIFICATION_EMAIL`

## MongoDB Atlas

Create an Atlas cluster and copy the SRV connection string into `MONGODB_URI`.

Example format:

```text
mongodb+srv://<username>:<password>@<cluster>.mongodb.net/portfolio?retryWrites=true&w=majority
```

Also allow Render's backend to connect by configuring Atlas network access appropriately.

## CI/CD pipeline dashboard

The workflow lives at [ci-cd.yml](E:\PORTFOLIO\portfolio1\portfolio\.github\workflows\ci-cd.yml).

It currently:

- runs on pushes and pull requests to `main`
- installs dependencies
- builds `client`
- builds `admin`
- runs a server import smoke check

After you push the repo to GitHub, the pipeline dashboard will be visible under:

- GitHub repository `Actions` tab
- Vercel project deployment dashboard
- Render service deploy dashboard

## Notes

- Frontend API URLs are now environment-based through `VITE_API_URL`.
- Use [.env.example](E:\PORTFOLIO\portfolio1\portfolio\.env.example) as the deployment variable checklist.
