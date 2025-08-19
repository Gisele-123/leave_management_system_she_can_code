# SheCanCode Leave Management System (Monorepo)

Three independent services communicating via REST:
- auth-service (Spring Boot): User registration, JWT login, Google OAuth login, 2FA stub, Swagger
- leave-service (Spring Boot): Leave balance, apply, approve/reject with email notification logs, full CRUD, Swagger
- frontend (React + Vite): Blue & white responsive UI with Login, Register, Google Sign-In, and role‑based dashboards (Staff, Manager, Admin)

Fully Dockerized and Apple Silicon compatible. Includes sample .env files and swagger for backend testing.

## Quick Start (Docker - one command)
Prerequisites: Docker Desktop 4+, Git

1. Clone the repo
2. Set env (optional): Edit `.env` at repo root to set `JWT_SECRET` and `GOOGLE_CLIENT_ID`.
3. From the repo root, run:
   - Windows PowerShell: `docker compose up --build`
4. Open the apps:
   - Frontend: http://localhost:5173
   - Auth Swagger: http://localhost:8081/swagger-ui.html
   - Leave Swagger: http://localhost:8082/swagger-ui.html

To stop: `docker compose down`

## Quick Setup Script (Windows)
If you prefer a single command to do everything (env checks, build, run, open browser), use the provided PowerShell script:

- Run: `./setup.ps1`
- Options:
  - `-Recreate`   Recreate containers (passes `--force-recreate` to compose)
  - `-NoDetach`   Run in foreground (omits `-d`)
  - `-NoOpen`     Do not auto-open browser tabs

Examples:
- `./setup.ps1` (recommended)
- `./setup.ps1 -Recreate`
- `./setup.ps1 -NoOpen`

## URLs
- Auth service base: http://localhost:8081
- Leave service base: http://localhost:8082
- Frontend: http://localhost:5173

## Endpoints (MVP)
Auth:
- POST /api/auth/register {username,password,email,role?}
- POST /api/auth/login {username,password}

Leave:
- GET /api/leaves/balance/{username}
- POST /api/leaves/apply {username,type,startDate,endDate,reason?}
- POST /api/leaves/approve/{id}?status=APPROVED|REJECTED&comment=...
- GET /api/leaves/currently-on-leave

## Environment Files
The repo includes both sample and ready-to-use .env files:
- Root: .env (used by docker-compose for JWT_SECRET, GOOGLE_CLIENT_ID)
- auth-service/.env and auth-service/.env.sample
- leave-service/.env and leave-service/.env.sample
- frontend/.env and frontend/.env.sample

You can edit these to match your environment (e.g., set GOOGLE_CLIENT_ID).

## Development (without Docker)
- Java 21, Maven 3.9+
- Node 20+, NPM 10+

Backends:
- In each service folder, run: `mvn spring-boot:run`
- http://localhost:8081 and http://localhost:8082

Frontend:
- In frontend: `npm install && npm run dev` → http://localhost:5173

## Plugins to install (IDE guidance)
- IntelliJ IDEA:
  - Lombok plugin (enable annotation processing)
  - Docker plugin
  - Swagger/OpenAPI plugin (optional)
- VSCode:
  - Java Extension Pack, Lombok Annotations support
  - Docker, Thunder Client/REST Client
  - ESLint (optional)

## Apple Silicon Notes
The Dockerfiles and compose specify multi-arch images and platforms (linux/arm64 and linux/amd64). On Apple Silicon (M1/M2), Docker will pick arm64 layers automatically.

## Production/Next Steps
This MVP demonstrates the architecture and core flows. For production readiness:
- Persist users and leaves using PostgreSQL (compose service) and Flyway migrations
- Proper JWT validation in leave-service (resource server) and role-based authorization (STAFF/MANAGER/ADMIN)
- Add Google Authenticator 2FA (e.g., TOTP via `com.warrenstrange:googleauth`), QR enrollment endpoints
- Email notifications using real SMTP (Mailhog for dev)
- Accrual jobs (Quartz), carryover rules, admin adjustments, reports
- CI/CD: Build multi-arch images and push to Docker Hub

## Building and Pushing Docker Images (Apple Silicon compatible)
We recommend using docker buildx to build multi-arch images (linux/amd64, linux/arm64).

1. Create and use a builder (once):
   - `docker buildx create --name multi --use`  (or `docker buildx use default` if already present)
2. Log in to Docker Hub:
   - `docker login`
3. Build and push each service (replace YOUR_HUB with your Docker Hub username/organization):
   - Auth:
     - `docker buildx build --platform linux/amd64,linux/arm64 -t YOUR_HUB/leave-auth-service:0.0.1 -t YOUR_HUB/leave-auth-service:latest -f auth-service/Dockerfile auth-service --push`
   - Leave:
     - `docker buildx build --platform linux/amd64,linux/arm64 -t YOUR_HUB/leave-leave-service:0.0.1 -t YOUR_HUB/leave-leave-service:latest -f leave-service/Dockerfile leave-service --push`
   - Frontend:
     - `docker buildx build --platform linux/amd64,linux/arm64 -t YOUR_HUB/leave-frontend:0.0.1 -t YOUR_HUB/leave-frontend:latest -f frontend/Dockerfile frontend --push`

Alternatively, for local testing only: `docker compose build` builds for your current platform.

## Swagger
- Auth: http://localhost:8081/swagger-ui.html
- Leave: http://localhost:8082/swagger-ui.html

## Submission Checklist
- [ ] Push this repository to GitHub/GitLab (monorepo with auth-service, leave-service, frontend)
- [ ] Build and push multi-arch Docker images to Docker Hub (see section above)
- [ ] Include `.env` files for all services (root, auth-service, leave-service, frontend)
- [ ] Ensure the app runs with a single command: `docker compose up --build`
- [ ] Verify Apple Silicon compatibility by building with buildx or testing on an M1/M2 machine
- [ ] Verify Swagger UIs respond on 8081 and 8082

## Quick API Smoke Tests (PowerShell)
# Register or login
# Register
# Invoke-WebRequest -Method Post -Uri http://localhost:8081/api/auth/register -Body (@{username='alice';password='pass123';email='alice@example.com'} | ConvertTo-Json) -ContentType 'application/json'
# Login
# Invoke-WebRequest -Method Post -Uri http://localhost:8081/api/auth/login -Body (@{username='alice';password='pass123'} | ConvertTo-Json) -ContentType 'application/json'

# Balance
# Invoke-WebRequest http://localhost:8082/api/leaves/balance/alice

# Apply leave
# $body = @{username='alice';type='PTO';startDate='2025-08-20';endDate='2025-08-21';reason='vacation'} | ConvertTo-Json
# Invoke-WebRequest -Method Post -Uri http://localhost:8082/api/leaves/apply -Body $body -ContentType 'application/json'

## Troubleshooting Docker on Windows
If `docker compose up --build` fails with a 500 Internal Server Error on a named pipe URL like `http://%2F%2F.%2Fpipe%2FdockerDesktopLinuxEngine/...`:
- Restart Docker Desktop (System tray > Docker > Troubleshoot > Restart Docker) and retry.
- Ensure Docker Desktop is on the latest version and using the Linux engine (Settings > General > Use the WSL 2 based engine).
- Make sure WSL 2 is running and your default distro is healthy (PowerShell: `wsl -l -v`).
- Run `docker info` to confirm the daemon is reachable; if it errors, the issue is with Docker Desktop rather than the compose file.
- Try `docker system prune -a` to clear stale images (beware: it removes unused data).
- If corporate VPN/Proxy is active, try disabling it temporarily or configure Docker’s proxy settings.

If problems persist, please share the full output of `docker version`, `docker info`, and `docker compose up --build` for diagnosis.

## Notes on Existing Root Project
The original Spring Boot skeleton remains at root; this monorepo adds three stand-alone services per requirement. Prefer using docker-compose to run them together.
