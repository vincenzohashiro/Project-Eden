# VPS setup — Pterodactyl (Panel + Wings)

Replaces the earlier bare-systemd approach (`vps-setup/`, removed). Pterodactyl's
Wings daemon now owns the Minecraft server's lifecycle, running it inside a
Docker container instead of a raw systemd unit. `panel-server` (see
`../panel-server/README.md`) is a thin proxy in front of Pterodactyl's Client
API — it does not talk to systemd/RCON-for-commands/`/proc` anymore.

## 1. Install Panel + Wings

Don't hand-roll this — it's a large, well-solved problem (PHP/Laravel + MySQL
or MariaDB + Redis + nginx + Certbot for the Panel; a Go daemon + Docker for
Wings). Use the community installer:

```
bash <(curl -s https://raw.githubusercontent.com/pterodactyl-installer/pterodactyl-installer/master/install.sh)
```

Run it once for the **Panel**, then again for **Wings** (it'll prompt for
which). Follow its prompts for domain/SSL (e.g. `ptero.projecteden.net`).

## 2. Manual admin-UI steps (no scriptable shortcut for a first setup)

Log into the Panel as the admin account the installer created, then:

1. **Locations** → create one (e.g. `default`).
2. **Nodes** → create a node pointing at this same VPS (Wings' FQDN/port,
   matching what the Wings install step configured), then add an
   **Allocation** (an IP:port for the game, e.g. `<vps-ip>:25565`, plus a
   second allocation for RCON if the egg needs one exposed, e.g. `:25575`).
3. **Nests/Eggs** → import or use the built-in "Minecraft: Paper" egg.
4. **Servers** → create the server: assign it to the node, the egg from
   step 3, the allocation(s) from step 2, and resource limits (memory/disk/
   CPU — these become the "total" figures the EdenEngine stat cards show).
   Note the server's **short identifier** (shown in its URL,
   `/server/<identifier>`) — that's `PTERODACTYL_SERVER_ID`.
5. In the server's **Startup** tab, confirm RCON is enabled (`enable-rcon`,
   `rcon.password`) if the egg doesn't do it by default — needed for the
   player-list feature (`panel-server`'s `MC_RCON_*` env).
6. Create a dedicated Pterodactyl **user** for the panel bot (doesn't need
   admin — just needs access to this one server), sign in as it, and under
   **Account → API Credentials** generate a **Client API key**. This is
   `PTERODACTYL_API_KEY` — server-side secret, same discipline as
   `SUPABASE_SERVICE_ROLE_KEY`, never exposed to the browser.

## 3. Wire it into panel-server

In `panel-server/.env`:
```
PTERODACTYL_PANEL_URL=https://ptero.projecteden.net
PTERODACTYL_API_KEY=<the Client API key from step 2.6>
PTERODACTYL_SERVER_ID=<the short identifier from step 2.4>
MC_RCON_HOST=127.0.0.1
MC_RCON_PORT=<the RCON allocation's port from step 2.2/2.5>
MC_RCON_PASSWORD=<matches the egg's rcon.password>
```

Then follow `../panel-server/README.md` to deploy the proxy itself.
