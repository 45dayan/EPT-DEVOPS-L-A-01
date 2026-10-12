# Dayan Desk — intern assignment

Hello. This repository is a finished web application. Your job is **not** to redesign it. Your job is to take this exact app from a Git clone to a live site:

**https://dayan.azanabbaswani.online**

You will containerise it, publish a Docker image to Docker Hub, deploy that image onto an EC2 instance, and put nginx in front of it so the domain above serves the app.

The Dockerfile, Compose file, GitHub Actions workflow, and nginx config are **intentionally missing**. Creating them is the assignment. Reference copies are included later in this document so you are not guessing at syntax. Adapt them, do not commit secrets, and be ready to explain every file.

Estimated time: 6–10 hours if Docker and AWS are new.

---

## 1. What you are given

Dayan Desk is a small studio intake ledger.

- React UI, built with Next.js (App Router) and Tailwind CSS
- PostgreSQL, accessed with Drizzle ORM
- Pages and API routes in one app (there is no separate frontend repo)

People can file a brief, filter the ledger, change a row’s status, leave a studio note, and remove a row. Sample rows are inserted the first time the empty `inquiries` table is read, so a fresh database does not look blank.

Writes require a studio key, sent as the `x-studio-key` header. The local default is `dayan-studio`. Change it before the site is public.

### Routes worth knowing

| Path | What it does |
| --- | --- |
| `/` | The desk. Server-rendered, then the form talks to the API. |
| `GET /api/health` | Liveness check. Must return `{"ok":true}` when Postgres accepts a connection. Your pipeline should call this after deploy. |
| `GET /api/inquiries` | Ledger JSON. Optional `?status=new&q=northline`. Stats ignore the filter. |
| `POST /api/inquiries` | File a brief. Header `x-studio-key` required. |
| `PATCH /api/inquiries/:id` | Update `status` and/or `note`. Key required. |
| `DELETE /api/inquiries/:id` | Remove a row. Key required. |

### Project map

```text
src/app/page.tsx                 Home page
src/app/api/health/route.ts     Health check used by the platform and by you
src/app/api/inquiries/          JSON API
src/db/schema.ts                Drizzle table. Source of truth for columns.
src/db/index.ts                 Pool + Drizzle client. Reads DATABASE_URL.
db/init.sql                      Same table, for a first-boot Postgres container
public/images/                   Photographs shipped with the app
next.config.ts                   output: "standalone" — leave this on
```

`next.config.ts` already sets `output: "standalone"`. The production process inside Docker is `node server.js`, not `next start`. Do not remove that setting.

The app uses the Node.js runtime. Do not switch the API routes to the Edge runtime. The `pg` driver cannot run there.

---

## 2. What you must deliver

Submit a repository that contains, in addition to this app:

1. `Dockerfile` — multi-stage build of this Next.js app
2. `.dockerignore`
3. `docker-compose.yml` — app + Postgres, usable on your laptop and on EC2
4. `.github/workflows/deploy.yml` — on push to `main`:
   - build a Docker image
   - push it to Docker Hub
   - SSH to EC2, pull the new image, and recreate the web container
5. nginx site config for `dayan.azanabbaswani.online` (in the repo under `deploy/nginx/` **and** installed on the server)
6. A short `DEPLOYMENT.md` with the live URL, image name, Elastic IP, and a link to a green GitHub Actions run

The live site must:

- Load the Dayan Desk UI at `http://dayan.azanabbaswani.online` (HTTPS is a required bonus — see section 10)
- Return `{"ok":true}` from `https://dayan.azanabbaswani.online/api/health` once TLS is on, or from port 80 before that
- Persist a brief you file in the browser after a refresh (that proves Postgres, not just the React state)
- Come from the image in Docker Hub, not from `npm start` on the host
- Be reached by browsers through nginx, not by publishing port 3000 to the world

### Rules

- Do not commit Docker Hub tokens, AWS keys, `.pem` files, or the production database password.
- Do not open port `5432` to the internet.
- Do not use `postgres` / `postgres` as the production database password.
- Do not run `docker compose down -v` on the server unless you mean to delete the ledger.
- Do not store real client data in this demo. There is no user account system.
- Do not change the app into a different product. Small fixes caused by deployment are fine. Redesigns are not the assignment.

### Rubric

| Item | Marks |
| --- | --- |
| App runs locally with Docker Compose, including a persisted inquiry | 20 |
| Image is on Docker Hub and was built by GitHub Actions | 20 |
| Push to `main` deploys to EC2 without you SSHing by hand | 20 |
| nginx serves `dayan.azanabbaswani.online` and proxies to the container | 20 |
| Health check passes on the domain, and secrets are not in git | 20 |
| HTTPS via Let’s Encrypt | +10 |

### Questions to answer in the pull request

Write a few sentences each. Copy-paste of this README is not an answer.

1. Why does `DATABASE_URL` inside the web container use the hostname `db` instead of `127.0.0.1`?
2. Why is port 3000 bound to `127.0.0.1` on the EC2 host instead of `0.0.0.0`?
3. Why is nginx on the host, instead of the public internet talking to Node directly?
4. What does the Docker volume store, and which command would destroy it?
5. Is `STUDIO_KEY` read at image build time or at container start? Why does that matter?

---

## 3. Accounts and access you need

Before you write a Dockerfile, make sure you can log into:

- GitHub — you will push this repo and store Actions secrets
- Docker Hub — you will create a public repository, suggested name `dayan-desk`
- AWS — permission to launch one EC2 instance, allocate an Elastic IP, and edit a security group
- DNS for `azanabbaswani.online` — you or your mentor must create the `dayan` record

If you cannot create the DNS record yourself, send this once you have an Elastic IP:

```text
Please create an A record:
Host: dayan
Zone: azanabbaswani.online
Type: A
Value: <ELASTIC_IP>
TTL: 300
Do not add an AAAA record unless the instance has IPv6.
```

Local tools:

- Git
- Node.js 22
- Docker Desktop (or Docker Engine + the Compose plugin)
- An SSH client

---

## 4. Run it on your machine first

You should understand the app before you containerise it.

```bash
git clone <repo-url>
cd <repo>
cp .env.example .env
npm install
```

Start PostgreSQL locally, create the database, then push the schema.

```bash
# example only — any local Postgres is fine
# database: app_db   user: postgres   password: postgres   port: 5432
npx drizzle-kit push
npm run dev
```

Open http://localhost:3000.

Confirm the API:

```bash
curl -s http://localhost:3000/api/health

curl -s -X POST http://localhost:3000/api/inquiries \
  -H 'content-type: application/json' \
  -H 'x-studio-key: dayan-studio' \
  -d '{"name":"Dayan","email":"dayan@example.com","company":"Desk","projectType":"web","budget":"explore","message":"Checking that this row survives a refresh."}'
```

Refresh the browser. The row must still be there. If it is not, you are not looking at the database.

`GET /api/health` only checks that Postgres accepts `select 1`. It does **not** prove the `inquiries` table exists. Filing a brief does.

---

## 5. Part A — Dockerise the app

### 5.1 How the processes talk

```text
browser
  -> nginx on the EC2 host :80 / :443
    -> 127.0.0.1:3000
      -> web container (Next.js standalone, port 3000)
        -> db container (Postgres, port 5432, not published)
```

Two environments, two different database hosts:

| Where the app runs | `DATABASE_URL` host | Why |
| --- | --- | --- |
| `npm run dev` on your laptop | `127.0.0.1` | Postgres is on your machine |
| `web` container | `db` | `db` is the Compose service name. `127.0.0.1` inside the web container is the web container itself, not Postgres |

That mistake is the most common reason a containerised Next app returns 500 while `npm run dev` worked.

### 5.2 Dockerfile

Create `Dockerfile` in the repo root. Use a multi-stage build so the final image does not contain the compiler, the test toolchain, or `node_modules` from the build.

Why multi-stage: the build stage needs devDependencies to run `next build`. The running site only needs the standalone server, static assets, and `public/`. A smaller image pulls faster onto EC2 and has less to patch.

`HOSTNAME=0.0.0.0` is required. The standalone server otherwise listens on localhost **inside** the container, and Docker port publishing cannot reach it.

```dockerfile
FROM node:22-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
```

`npm ci` needs `package-lock.json`. If it is missing, generate it with `npm install` and commit it. Do not switch the Docker build to `npm install` just to avoid a lockfile.

Do **not** copy `.env` into the image. `DATABASE_URL` and `STUDIO_KEY` are runtime settings. If you bake the laptop URL into the image, every environment will try to reach `127.0.0.1`.

### 5.3 .dockerignore

```gitignore
node_modules
.next
.git
.gitignore
.env
.env.*
npm-debug.log
README.md
DEPLOYMENT.md
*.pem
*.md
```

Do not ignore `public/`, `package.json`, `package-lock.json`, or the source tree. The builder needs those.

### 5.4 docker-compose.yml

This file is what you run locally **and** what stays on the server at `/opt/dayan-desk/docker-compose.yml`.

```yaml
services:
  db:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./db/init.sql:/docker-entrypoint-initdb.d/init.sql:ro
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 5s
      timeout: 5s
      retries: 12
    # No ports: section. Postgres stays on the Compose network.

  web:
    image: ${DOCKERHUB_USERNAME}/dayan-desk:${IMAGE_TAG:-latest}
    build: .
    restart: unless-stopped
    depends_on:
      db:
        condition: service_healthy
    environment:
      DATABASE_URL: postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}
      STUDIO_KEY: ${STUDIO_KEY}
      NODE_ENV: production
    ports:
      - "127.0.0.1:3000:3000"

volumes:
  pgdata:
```

Notes:

- `build: .` lets you test on a laptop before an image exists on Docker Hub.
- On EC2, after the pipeline is pushing images, `docker compose pull web && docker compose up -d` uses the Hub image. Keep `build: .` so a manual rebuild is still possible.
- `127.0.0.1:3000:3000` means only processes on that machine (nginx) can reach Node. Your security group should still not need port 3000.
- `db/init.sql` runs **only when the `pgdata` volume is created for the first time**. If you started Postgres once without that mount, creating the file later does nothing. See troubleshooting.

Create a local `.env` for Compose (this can be the same file Next uses, with extra variables):

```bash
POSTGRES_USER=dayan
POSTGRES_PASSWORD=choose-a-long-local-password
POSTGRES_DB=dayan_desk
DOCKERHUB_USERNAME=your-dockerhub-username
IMAGE_TAG=latest
STUDIO_KEY=dayan-studio
DATABASE_URL=postgresql://dayan:choose-a-long-local-password@127.0.0.1:5432/dayan_desk
```

When you run the app with `npm run dev`, `DATABASE_URL` must point at `127.0.0.1`, so publish Postgres temporarily:

```yaml
ports:
  - "5432:5432"
```

Remove that publish before you put the file on EC2. On the server, the web container uses hostname `db` and does not need the host port.

Local proof:

```bash
docker compose up -d --build
curl -s http://127.0.0.1:3000/api/health
```

File a brief in the browser at http://127.0.0.1:3000. Then:

```bash
docker compose restart web
```

Refresh. The brief must remain. Then stop the stack without deleting data:

```bash
docker compose down
```

`down` keeps the named volume. `down -v` deletes it.

If the container logs `Cannot find module 'pg'`, the standalone trace missed the driver. Say so in your PR and add the package to the runner stage, or set `outputFileTracingIncludes` in `next.config.ts`. Do not “fix” it by committing `node_modules`.

---

## 6. Part B — CI/CD that builds and pushes to Docker Hub

### 6.1 Docker Hub

1. Create a Docker Hub account.
2. Create a **public** repository named `dayan-desk`. Public is enough for this assignment and avoids a login step on EC2. Private is allowed if you also `docker login` on the server.
3. Create an access token: Account Settings → Security → New Access Token → Read & Write.
4. The image you will publish is `yourname/dayan-desk`.

You should be able to push once by hand before you trust Actions:

```bash
docker login
docker build -t yourname/dayan-desk:manual .
docker push yourname/dayan-desk:manual
```

Delete that tag later if you want. The pipeline should publish `:latest` and `:<git sha>`.

### 6.2 GitHub secrets

Repo → Settings → Secrets and variables → Actions → New repository secret.

| Secret | Value |
| --- | --- |
| `DOCKERHUB_USERNAME` | Docker Hub username, not the email |
| `DOCKERHUB_TOKEN` | The access token, not your Docker Hub password |
| `EC2_HOST` | Elastic IP of the instance |
| `EC2_USER` | `ubuntu` if you launched Ubuntu |
| `EC2_SSH_KEY` | Full private key, including `BEGIN` and `END` lines |

Add `EC2_HOST` and `EC2_SSH_KEY` after the instance exists. You can land the build-and-push job first, then add the deploy job. A deploy job that runs before the server exists will fail, and that is expected.

Never echo these secrets into logs. `docker login --password-stdin` is the pattern below. Do not pass the token as `docker login -p`.

### 6.3 Workflow

Create `.github/workflows/deploy.yml`.

```yaml
name: Build, push, and deploy

on:
  push:
    branches: [main]
  workflow_dispatch:

env:
  IMAGE: ${{ secrets.DOCKERHUB_USERNAME }}/dayan-desk

jobs:
  publish:
    name: Build and push image
    runs-on: ubuntu-latest
    steps:
      - name: Check out the repository
        uses: actions/checkout@v4

      - name: Log in to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}

      - name: Set up Buildx
        uses: docker/setup-buildx-action@v3

      - name: Build and push
        uses: docker/build-push-action@v6
        with:
          context: .
          push: true
          tags: |
            ${{ env.IMAGE }}:latest
            ${{ env.IMAGE }}:${{ github.sha }}

  deploy:
    name: Deploy on EC2
    needs: publish
    runs-on: ubuntu-latest
    steps:
      - name: Pull image and restart the web container
        uses: appleboy/ssh-action@v1.2.5
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ${{ secrets.EC2_USER }}
          key: ${{ secrets.EC2_SSH_KEY }}
          script_stop: true
          script: |
            set -euo pipefail
            cd /opt/dayan-desk
            docker compose pull web
            docker compose up -d
            docker image prune -f
            curl -fsS http://127.0.0.1:3000/api/health
```

What this does, in order:

1. A push to `main` checks out the code on a GitHub-hosted runner.
2. The runner logs into Docker Hub with the token secret.
3. It builds the Dockerfile and pushes two tags. `:latest` is what Compose pulls. The SHA tag is how you roll back.
4. A second job SSHes to EC2 and recreates containers from the new image.
5. It curls health **on the server**, via `127.0.0.1`. That proves the container came up. It does not yet prove nginx or DNS.

`workflow_dispatch` lets you re-run the pipeline from the Actions tab without an empty commit.

If the image is private, add a login on the server before `docker compose pull`. Prefer a public repository for this exercise so the server does not store a token.

Commit suggestion, after it is green locally:

```text
ci: build image and deploy Dayan Desk to EC2
```

---

## 7. Part C — EC2

Launch one instance. You do not need a load balancer, RDS, or ECS for this assignment. Postgres runs in Compose on the same box. That is acceptable here because this is a single demo, not a production studio. Say that limitation in `DEPLOYMENT.md`.

### 7.1 Instance

- AMI: Ubuntu Server 24.04 LTS
- Type: `t3.micro` or `t2.micro` (free tier if your account is eligible)
- Storage: 20 GB gp3
- Key pair: create one and download the `.pem`. This file is a secret. Do not commit it. `.gitignore` already ignores `*.pem`.
- Auto-assign public IP: enable, then replace it with an Elastic IP so DNS does not break on stop/start

Security group, inbound:

| Port | Source | Why |
| --- | --- | --- |
| 22 | Your current IP only, if you can | SSH |
| 80 | `0.0.0.0/0` | HTTP, and the Let’s Encrypt challenge |
| 443 | `0.0.0.0/0` | HTTPS |

Do not add 3000 or 5432.

Allocate an Elastic IP (EC2 → Elastic IPs → Allocate → Associate with this instance). Use that IP as `EC2_HOST` and as the DNS A record. An Elastic IP is free while it is attached to a running instance. Releasing it, or leaving it unattached, can cost money. If you are not on the free tier, a running instance also costs money — stop it after review if your mentor says the site does not need to stay up. Stopping the instance keeps the Elastic IP association on most accounts, but check the AWS console so you are not billed for an idle address.

### 7.2 Install Docker and nginx

SSH in:

```bash
chmod 400 ~/Downloads/your-key.pem
ssh -i ~/Downloads/your-key.pem ubuntu@<ELASTIC_IP>
```

On the instance:

```bash
sudo apt update
sudo apt upgrade -y
sudo apt install -y ca-certificates curl gnupg nginx certbot python3-certbot-nginx

# Docker Engine + Compose v2 from Ubuntu's packages is enough for this assignment.
sudo apt install -y docker.io docker-compose-v2
sudo usermod -aG docker "$USER"
```

Log out and back in so the `docker` group applies. Check:

```bash
docker version
docker compose version
nginx -v
```

If `docker compose version` fails, install the plugin from Docker’s own apt repository and do not invent a `docker-compose` Python package.

### 7.3 Put the app on the box

The server needs the Compose file, `db/init.sql`, and a production `.env`. It does not need to build the image if Hub already has one.

```bash
sudo mkdir -p /opt/dayan-desk
sudo chown "$USER:$USER" /opt/dayan-desk
git clone <your-repo-url> /opt/dayan-desk
cd /opt/dayan-desk
```

Create `/opt/dayan-desk/.env` on the server only:

```bash
POSTGRES_USER=dayan
POSTGRES_PASSWORD=<long-random-password>
POSTGRES_DB=dayan_desk
DOCKERHUB_USERNAME=<your-dockerhub-username>
IMAGE_TAG=latest
STUDIO_KEY=<a-different-key-than-the-readme>
```

Generate a password with `openssl rand -base64 24`. Do not reuse `postgres` / `postgres`. Do not commit this file. Confirm `.env` is not tracked:

```bash
git status
```

If `.env` shows as untracked, that is fine. Do not `git add` it.

First boot:

```bash
docker compose pull web || true
docker compose up -d --build
docker compose ps
curl -fsS http://127.0.0.1:3000/api/health
```

`up -d --build` builds on the server if the Hub image is not there yet. After the pipeline works, deploys should pull rather than build on the small instance.

Open the site from the server:

```bash
curl -I http://127.0.0.1:3000
```

You should see `200` and the Dayan Desk HTML. The public internet still cannot see port 3000. That is correct. nginx is next.

---

## 8. Part D — nginx and the domain

nginx’s job on this box:

- Listen on port 80 and 443
- Know the name `dayan.azanabbaswani.online`
- Proxy every request to `http://127.0.0.1:3000`
- Forward the original host and protocol so the app knows it is behind a proxy

Create `/etc/nginx/sites-available/dayan.azanabbaswani.online`:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name dayan.azanabbaswani.online;

    client_max_body_size 10m;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 60s;
    }
}
```

Enable it and disable the default site, which would otherwise answer with Ubuntu’s welcome page:

```bash
sudo ln -s /etc/nginx/sites-available/dayan.azanabbaswani.online /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

Copy that file into the repo as `deploy/nginx/dayan.azanabbaswani.online.conf` so the next person can rebuild the server. The live file still has to be installed under `/etc/nginx`. Committing it does not enable it.

### DNS

Create the A record described in section 3. Wait until this matches the Elastic IP:

```bash
dig +short dayan.azanabbaswani.online
```

Then, from your laptop:

```bash
curl -I http://dayan.azanabbaswani.online
curl -s http://dayan.azanabbaswani.online/api/health
```

You want the Dayan Desk HTML and `{"ok":true}`. If you see the nginx welcome page, the default site is still enabled or `server_name` does not match.

Also commit the nginx file and mention in `DEPLOYMENT.md` that nginx is installed on the host, not inside the app image. A second nginx container is a valid stretch goal, not the required design.

---

## 9. HTTPS

Once HTTP on the domain works, ask Let’s Encrypt for a certificate. Port 80 must be open. DNS must already point at this instance.

```bash
sudo certbot --nginx -d dayan.azanabbaswani.online
```

Choose the redirect option so port 80 sends people to HTTPS.

Check renewal:

```bash
sudo certbot renew --dry-run
```

Ubuntu’s certbot package installs a timer. You do not need a custom cron unless `systemctl list-timers | grep certbot` shows nothing.

After this, the pipeline’s on-server health check can stay on `http://127.0.0.1:3000/api/health`. That bypasses nginx on purpose, so a bad certificate does not hide a crashed container. Also check the public URL by hand:

```bash
curl -fsS https://dayan.azanabbaswani.online/api/health
```

---

## 10. Prove the pipeline, not just the server

A hand-built server is only half the assignment. The next push must deploy itself.

1. Change something tiny and visible, such as a word in the footer in `src/components/studio-shell.tsx`.
2. Commit and push to `main`.
3. Watch the Actions tab. `publish` must push a new SHA tag. `deploy` must go green.
4. Hard-refresh https://dayan.azanabbaswani.online and confirm the word changed.
5. File a brief. Refresh. Confirm it is still there.
6. On the server, `docker ps` should show the web container started after the workflow, not from this morning’s manual run.

Rollback, if a push breaks the site:

```bash
cd /opt/dayan-desk
# IMAGE_TAG is the git SHA of the last good Actions run
IMAGE_TAG=<previous-sha> docker compose up -d web
```

You can also retag that SHA as `latest` in Docker Hub. Write down the SHA you rolled back to.

---

## 11. DEPLOYMENT.md template

Create this file in the repo when the site is live. Do not put passwords in it.

```markdown
# Deployment

- Live URL: https://dayan.azanabbaswani.online
- Health: https://dayan.azanabbaswani.online/api/health
- Docker Hub image: <username>/dayan-desk
- Example tag: <git sha>
- EC2 Elastic IP: <ip>
- Region / instance type: <region> / t3.micro
- GitHub Actions run: <url of a green run>
- nginx: host install, site file deploy/nginx/dayan.azanabbaswani.online.conf
- Data: Docker volume pgdata on the instance. Not RDS.
- Studio key: set only in /opt/dayan-desk/.env, not committed

## What I would not do with this setup later

One t3.micro running both Node and Postgres will lose the ledger if the volume is deleted.
It is the right size for this assignment and the wrong size for a real studio.
```

---

## 12. Troubleshooting

| Symptom | Likely cause | What to do |
| --- | --- | --- |
| `npm run dev` works, container returns 500 | `DATABASE_URL` uses `127.0.0.1` inside the container | Host must be `db` |
| Health is ok, page says the ledger cannot reach PostgreSQL | Table was never created | Volume was initialised before `init.sql` was mounted. Run the SQL by hand (below) or recreate the volume |
| `docker compose up` immediately exits web | App listening on container localhost | `ENV HOSTNAME=0.0.0.0` and `ENV PORT=3000` |
| Browser cannot open `:3000` from your laptop, curl on the server works | Port bound to `127.0.0.1`, or security group | That is correct on EC2. Use nginx. |
| Domain shows the nginx welcome page | Default site still enabled | Remove `sites-enabled/default`, check `server_name`, `nginx -t`, reload |
| Domain does not resolve | A record missing, wrong IP, or cached DNS | `dig +short dayan.azanabbaswani.online` must be the Elastic IP |
| HTTPS fails but HTTP works | certbot not run, or port 443 closed | Open 443, rerun certbot |
| Actions push fails with denied | Token is read-only, or username secret is wrong | New Read & Write token. Username is not the email. |
| Actions deploy fails with SSH timeout | Security group, wrong IP, or key formatted badly | Port 22 from GitHub is not your home IP. For this assignment you may temporarily open 22 to `0.0.0.0/0`, then tighten it. The secret must be the whole PEM. |
| Actions deploy fails with `no such file` | `/opt/dayan-desk` or Compose file missing | Finish section 7 before enabling the deploy job |
| Briefs disappear after `docker compose down -v` | You deleted the volume | Restore from nowhere. Do not use `-v` on the server. |
| `permission denied` on Docker socket | Group membership not reloaded | Log out of SSH and back in |
| Image missing `pg` | Standalone file trace | See the note in section 5.4 |

Apply the schema onto an already-created volume:

```bash
cd /opt/dayan-desk
docker compose exec -T db psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" < db/init.sql
```

Watch logs while you test:

```bash
docker compose logs -f web
sudo journalctl -u nginx --no-pager -n 50
```

---

## 13. Suggested order of work

Do not start with the EC2 console.

1. Clone, run locally with `npm`, file a brief, refresh.
2. Add the Dockerfile and Compose file. Prove `docker compose up --build`.
3. Push one image to Docker Hub by hand.
4. Add the GitHub Actions publish job. Push to `main`. Confirm the tag appears on Hub.
5. Launch EC2, Elastic IP, Docker, clone, `.env`, `docker compose up -d`.
6. Install nginx, point DNS, confirm HTTP on the domain.
7. Add the deploy job and the SSH secret. Push a visible change. Confirm Actions updates the site.
8. Run certbot. Confirm HTTPS.
9. Write `DEPLOYMENT.md` and the answers to the five questions.
10. Ask someone else to file a brief and refresh.

---

## 14. Stretch goals

Only after the rubric items pass.

- HTTPS is listed as bonus in the rubric and you should still do it.
- Add a Compose healthcheck for `web` that curls `/api/health`.
- Tag images with the branch name as well as the SHA.
- Fail the workflow if the on-server health curl fails. The sample workflow already does this via `curl -fsS`.
- Put nginx in a third Compose service and publish only 80/443. Keep the same `server_name`.
- Restrict SSH to your IP plus the [GitHub Actions IP ranges](https://api.github.com/meta), or use a bastion. Opening port 22 to the world is a shortcut, not a habit.
- Add a nightly `pg_dump` cron on the host to `/var/backups/dayan-desk`.
- Replace the shared studio key with a real login. Out of scope unless the required deploy is done.

---

## 15. App notes for anyone changing code later

- Schema lives in `src/db/schema.ts`. `db/init.sql` must be updated to match, because Docker’s first boot does not run Drizzle Kit.
- Drizzle Kit locally: `npx drizzle-kit push` against `DATABASE_URL`.
- Sample rows are inserted only when `inquiries` is empty. Wiping the table and reloading the page brings the samples back.
- Studio key: `STUDIO_KEY` in the environment, default `dayan-studio` if unset. The browser stores the typed key in `sessionStorage` and sends `x-studio-key`.
- `GET /api/health` must keep returning `{"ok":true}`. Do not rename it.
- Photographs in `public/images/` are from Pexels. Credits are in `public/images/CREDITS.txt`.

This repository does not deploy itself. When the domain loads, that was your pipeline.
