This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Git Remotes

| Remote | Repo | SSH/URL | Purpose |
|--------|------|---------|---------|
| origin | kevinjane71/dine-frontend | `git@github-kevin:kevinjane71/dine-frontend.git` | Primary repo (Kevin). Uses SSH host alias `github-kevin` configured in `~/.ssh/config`. Tags are pushed here. |
| origin2 | vivek7189/dine-fe2 | `https://github.com/vivek7189/dine-fe2.git` | Vivek's backup repo. |
| origin3 | savorisai-sudo/dine-frontend | `https://github.com/savorisai-sudo/dine-frontend.git` | GitHub Actions repo for building Electron desktop `.exe` via `build-desktop.yml`. Requires PAT with `repo` + `workflow` scopes. |

### Push to all remotes

```bash
git push origin main && git push origin2 main && git push origin3 main
```

### Tag and push (origin + origin3)

```bash
git tag -a v1.x.x -m "Release v1.x.x — description"
git push origin v1.x.x
git push origin3 v1.x.x
```
