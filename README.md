# SheCanCode Leave Management System (Monorepo)

This repository contains three independent services communicating via REST:
- auth-service (Spring Boot): User registration and JWT-based login, 2FA stub, Swagger
- leave-service (Spring Boot): Leave balance, apply, approve, who’s on leave, Swagger
- frontend (React + Vite): Responsive, vibrant UI consuming both APIs

Fully Dockerized and Apple Silicon compatible. Includes sample .env files and swagger for backend testing.

## Quick Start (Docker - one command)
Prerequisites: Docker Desktop 4+, Git

1. Clone the repo
2. From the repo root, run:
   - Windows PowerShell: `docker compose up --build`
3. Open the apps:
   - Frontend: http://localhost:5173
   - Auth Swagger: http://localhost:8081/swagger-ui.html
   - Leave Swagger: http://localhost:8082/swagger-ui.html

To stop: `docker compose down`

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
- auth-service/.env.sample
- leave-service/.env.sample
- frontend/.env.sample
Copy to `.env` if you want to override defaults.

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

## Building and Pushing Docker Images
From repo root:
- Build: `docker compose build`
- Tag and push (example):
  - `docker tag lms-auth yourhub/auth-service:0.0.1`
  - `docker push yourhub/auth-service:0.0.1`
  - `docker tag lms-leave yourhub/leave-service:0.0.1`
  - `docker push yourhub/leave-service:0.0.1`
  - `docker tag lms-frontend yourhub/lms-frontend:0.0.1`
  - `docker push yourhub/lms-frontend:0.0.1`

## Swagger
- Auth: http://localhost:8081/swagger-ui.html
- Leave: http://localhost:8082/swagger-ui.html

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
