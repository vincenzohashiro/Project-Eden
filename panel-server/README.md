# panel-server

Thin admin-gated proxy in front of a self-hosted Pterodactyl instance, sitting
between the Project Eden website and the actual Minecraft server (which runs
inside a Docker container managed by Pterodactyl's Wings daemon). Runs as its
own systemd service (`mc-panel-api`), sits behind nginx, and is called
directly by the Project Eden website using the visitor's existing Supabase
session — no separate login, and no direct browser access to Pterodactyl.

Assumes Pterodactyl (Panel + Wings) is already installed and a server exists
— see `../pterodactyl-setup/README.md` for that, including where to get the
`PTERODACTYL_*` values below.

## Local development

```
cp .env.example .env    # fill in SUPABASE_*, PTERODACTYL_*, MC_RCON_*
npm install
npm run dev
```

### No VPS/Pterodactyl yet? Use the mock

`npm run mock:pterodactyl` starts a tiny stand-in Panel+Wings on
`127.0.0.1:8080`/`:8081` (REST resources/power/server-details/websocket-
credentials, plus a Wings-shaped console websocket with fake log lines).
Point `.env` at it —
```
PTERODACTYL_PANEL_URL=http://127.0.0.1:8080
PTERODACTYL_API_KEY=mock-ptero-key
PTERODACTYL_SERVER_ID=mock-server-id
```
— and keep real `SUPABASE_*` values (it only fakes Pterodactyl, not auth).
Run it alongside `npm run dev` in a second terminal, then point the frontend's
`VITE_MC_PANEL_URL` at `http://127.0.0.1:<PANEL_PORT>` to see the full
`/EdenEngine` dashboard — status, stats, power buttons, live console — working
end-to-end with realistic fake data before the real infrastructure exists.

`/api/status`, `/api/stats`, and power routes all call the real Pterodactyl
Panel API, so they need a real `PTERODACTYL_PANEL_URL`/`PTERODACTYL_API_KEY`/
`PTERODACTYL_SERVER_ID` to do anything — against a placeholder `.env` they'll
fail with a clear "pterodactyl API ... -> 4xx/5xx" error, same as any other
misconfigured upstream. `getPlayerList()` (used by `/api/stats`) is the one
piece that talks to RCON directly rather than through Pterodactyl, and works
against any reachable RCON endpoint, local or not.

## VPS deployment (first time)

1. Create a dedicated unprivileged `panel` system user:
   ```
   sudo useradd --system --create-home --home-dir /opt/mc-panel --shell /usr/sbin/nologin panel
   ```
2. Check out the repo (or just this folder) to `/opt/mc-panel/panel-server`,
   owned by `panel`.
3. `cp .env.example .env` and fill in real values (`SUPABASE_JWT_SECRET`,
   `SUPABASE_SERVICE_ROLE_KEY` from the Supabase dashboard → Project Settings
   → API; `PTERODACTYL_*` and `MC_RCON_*` from
   `../pterodactyl-setup/README.md`; never commit `.env`).
4. `npm ci && npm run build`
5. Install the systemd unit:
   ```
   sudo cp systemd/mc-panel-api.service /etc/systemd/system/
   sudo systemctl daemon-reload
   sudo systemctl enable --now mc-panel-api
   ```
6. Put nginx in front of it (new subdomain, e.g. `panel.projecteden.net`),
   proxying to `127.0.0.1:$PANEL_PORT`, with TLS via
   `certbot --nginx -d panel.projecteden.net`. The console needs WebSocket
   upgrade headers forwarded:
   ```
   proxy_http_version 1.1;
   proxy_set_header Upgrade $http_upgrade;
   proxy_set_header Connection "upgrade";
   ```
7. `ufw`: do not open the panel's Node port directly — only nginx (80/443)
   should be internet-facing for this service. (Pterodactyl's own Panel/Wings
   ports are a separate concern, covered in `../pterodactyl-setup/README.md`.)

No sudoers rules or systemd-journal group membership needed — unlike the
earlier bare-systemd design, this process never shells out to `systemctl` or
`journalctl`; Wings owns the container lifecycle and log stream entirely,
reached over HTTP/WebSocket with an API key.

Subsequent deploys: `scripts/deploy.sh` (git pull, reinstall, rebuild,
restart the service).

## API surface

- `GET /healthz` — no auth.
- `GET /api/status` — requires a valid Supabase access token (any signed-in
  user). Backed by Pterodactyl's `GET /api/client/servers/{id}/resources`.
- `GET /api/stats` — requireAdmin. CPU/memory/disk from the same Pterodactyl
  resources call (memory/disk totals from a separately cached server-details
  call), network rate derived from the delta between polls (Pterodactyl only
  reports cumulative bytes), players from RCON `list`.
- `POST /api/power/start` / `/stop` / `/restart` / `/kill` — requireAdmin.
  All four map directly onto Pterodactyl's `POST /api/client/servers/{id}/power`
  `signal` values.
- `POST /api/console/ticket` — requireAdmin. Issues a single-use, 15s-TTL
  ticket (browsers can't set an `Authorization` header on a WS upgrade).
- `GET /api/console/ws?ticket=…` — WebSocket. Validates+consumes the ticket
  before completing the upgrade, then streams `{type:'log', line}` (backed by
  a single shared connection to Wings' own console websocket, broadcast to
  all connected admins — see `services/pterodactylConsole.ts` for the
  auth/reconnect/token-refresh handling) and accepts `{type:'command',
  command}`. Wings' console is a raw stdin/stdout pipe, not RCON — there's no
  structured reply to a command, its output just appears as ordinary log
  lines shortly after.

All admin routes require the caller's `profiles.role` to be `admin` (see
`../supabase/migrations/` for the column, and manually flip a row to `admin`
for the first operator).
