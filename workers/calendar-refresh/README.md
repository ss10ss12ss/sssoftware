# sssoftware Calendar Refresh Worker

This Worker triggers a Cloudflare Pages Deploy Hook on a monthly schedule. The Pages build runs `npm run build`, which fetches the Cabinet Office Japan holidays CSV and generates the static site in `dist/`.

The calendar page should load the generated holiday data before running its calendar script:

```html
<script src="holidays.generated.js"></script>
```

## Cloudflare Pages settings

Set the Pages project build settings to:

- Build command: `npm run build`
- Build output directory: `dist`

## Worker setup

Create a Cloudflare Pages Deploy Hook in the Pages project settings, then store it as a Worker secret:

```sh
cd workers/calendar-refresh
wrangler secret put PAGES_DEPLOY_HOOK_URL
```

Optionally require a token for manual refresh requests:

```sh
wrangler secret put MANUAL_REFRESH_TOKEN
```

Deploy the Worker:

```sh
wrangler deploy
```

Manual refresh, if `MANUAL_REFRESH_TOKEN` is set:

```sh
curl -X POST "https://sssoftware-calendar-refresh.<your-subdomain>.workers.dev/refresh" \
  -H "Authorization: Bearer <MANUAL_REFRESH_TOKEN>"
```
