# prepeardness-web

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
yarn
```

### Compile and Hot-Reload for Development

```sh
yarn dev
```

### Type-Check, Compile and Minify for Production

```sh
yarn build
```

### Lint with [ESLint](https://eslint.org/)

```sh
yarn lint
```

## Deploy to GitHub Pages

The workflow in `.github/workflows/deploy.yml` builds and deploys the app whenever
changes are pushed to `main`. The site is published at:

`https://kjetiltorvund.github.io/prepeardness-web/`

Before deploying, configure the public HTTPS URL of the backend API:

1. Open the repository on GitHub and go to **Settings > Secrets and variables > Actions**.
2. Select **Variables**, add a repository variable named `VITE_BASE_URL`, and set it to
   the backend API URL.
3. Go to **Settings > Pages** and select **GitHub Actions** as the source.

GitHub Pages hosts only the compiled frontend. The backend must be hosted separately
and configured to allow requests from the GitHub Pages origin.
