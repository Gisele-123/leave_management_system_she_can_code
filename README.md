ployed my frontend here and it's working good# SheCanCode Leave Management System (Monorepo)

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

## Hosted (Live) Setup
If you already deployed the backend and frontend, set the frontend env variables to your hosted backend base URL.

Your deployments:
- Frontend (Vercel): https://leave-management-system-she-can-cod.vercel.app/
- Backend (Render): https://leave-management-system-she-can-code-1.onrender.com

For this repo, we updated frontend/.env to:
- VITE_AUTH_URL=https://leave-management-system-she-can-code-1.onrender.com
- VITE_LEAVE_URL=https://leave-management-system-she-can-code-1.onrender.com

On Vercel, set the same values in Project Settings > Environment Variables and redeploy the frontend so Vite rebuilds with these URLs.

## Live Testing Guide (Deployed)
Follow these steps to validate your live deployment end-to-end using your Vercel frontend and Render backend.

### Default Accounts / Roles (Live & Local)
- Admin (seeded by backend):
  - Username/Email: admin@iro.rw
  - Password: admin123
  - Role: ADMIN
- Manager: Not pre-seeded. Please create a MANAGER account via the Register page or API.
- Staff: Not pre-seeded. Create as needed during testing.

Tip: You can log into the Admin Dashboard immediately using the default admin without registering a new ADMIN user.

URLs
- Frontend (UI): https://leave-management-system-she-can-cod.vercel.app/
- Backend (Swagger): https://leave-management-system-she-can-code-1.onrender.com/swagger-ui/index.html
  - If the above 404s, try: https://leave-management-system-she-can-code-1.onrender.com/swagger-ui.html
- Health check: https://leave-management-system-she-can-code-1.onrender.com/actuator/health

Prerequisites (one-time)
- On Vercel: ensure these variables exist and were present at build time (then redeploy Frontend after editing):
  - VITE_AUTH_URL=https://leave-management-system-she-can-code-1.onrender.com
  - VITE_LEAVE_URL=https://leave-management-system-she-can-code-1.onrender.com
  - VITE_GOOGLE_CLIENT_ID=your-google-client-id (optional if testing Google login)
- On Render (Auth service): ensure env has JWT_SECRET, JWT_EXPIRATION_MS, and (optional) GOOGLE_CLIENT_ID.
- Confirm backend is healthy via the health check URL (should return {"status":"UP"}).

A. Quick UI Flow (Staff → Manager → Admin)
1) Open the frontend
   - Go to https://leave-management-system-she-can-cod.vercel.app/
2) Register accounts
   - Click Register and create three users (choose roles in the dropdown):
     - alice (STAFF), any email, a password you will remember
     - mary (MANAGER)
     - adam (ADMIN)
   - Tip: If you already registered, you can skip and just Log in.
3) Login as Staff and apply leave (with Submitting UX)
   - Log in as alice
   - You’ll land on the Staff Dashboard
   - Apply for leave with:
     - Type: PTO (or any)
     - Start Date: today or a future date
     - End Date: same as start or a future date
     - Reason: optional
   - Click Submit and observe the button changes to “Submitting…” and becomes disabled until the request completes.
   - Verify the new request appears in “My Applications” with status PENDING.
   - Click View to see details. While PENDING, you can click Edit to update dates/reason, or Delete to remove it.
4) Manager review and decision (with View)
   - Logout, then login as mary (MANAGER)
   - Go to Manager Dashboard
   - You should see alice’s request as PENDING; use View to inspect, then Approve/Reject.
5) Admin overview (with full list)
   - Option A: Login with default admin (no registration needed)
     - Username/Email: admin@iro.rw
     - Password: admin123
   - Option B: If you created your own ADMIN during Register, use that account instead
   - Check the Admin Dashboard cards (Approved, Pending, Rejected) reflect the current counts
   - Scroll down to "All Applications" to view every request and open details using View

B. API Smoke Test (Live Backend)
Use Swagger UI or PowerShell to verify the backend independently from the UI.

1) Open Swagger
   - https://leave-management-system-she-can-code-1.onrender.com/swagger-ui/index.html
   - Find auth and leave endpoints under /api/auth and /api/leaves
2) Register via API (optional if already registered)
   - POST /api/auth/register
   - Body example:
     {
       "username": "alice",
       "password": "pass123",
       "email": "alice@example.com",
       "role": "STAFF"
     }
3) Login via API and capture token
   - POST /api/auth/login
   - Body: {"username":"alice","password":"pass123"}
   - Response contains token (JWT)
4) Create leave
   - POST /api/leaves/apply
   - Body example:
     {
       "username":"alice",
       "type":"PTO",
       "startDate":"2025-08-20",
       "endDate":"2025-08-21",
       "reason":"vacation"
     }
5) Manager decision
   - POST /api/leaves/approve/{id}?status=APPROVED or REJECTED

PowerShell examples (adjust dates/IDs):
# Register
# Invoke-WebRequest -Method Post -Uri https://leave-management-system-she-can-code-1.onrender.com/api/auth/register -Body (@{username='alice';password='pass123';email='alice@example.com';role='STAFF'} | ConvertTo-Json) -ContentType 'application/json'
# Login
# $login = Invoke-WebRequest -Method Post -Uri https://leave-management-system-she-can-code-1.onrender.com/api/auth/login -Body (@{username='alice';password='pass123'} | ConvertTo-Json) -ContentType 'application/json'
# $token = (ConvertFrom-Json $login.Content).token
# Apply leave
# $body = @{username='alice';type='PTO';startDate='2025-08-20';endDate='2025-08-21';reason='vacation'} | ConvertTo-Json
# Invoke-WebRequest -Method Post -Uri https://leave-management-system-she-can-code-1.onrender.com/api/leaves/apply -Body $body -ContentType 'application/json'

C. Optional: Google Sign-In (if configured)
- In Vercel and Render, set GOOGLE_CLIENT_ID/VITE_GOOGLE_CLIENT_ID to the same valid OAuth Client ID
- On the Login or Register page, click “Continue with Google” and complete the flow

Troubleshooting (Live)
- Frontend calls localhost or wrong URL
  - Cause: Vite env vars weren’t set at build time. Fix values in Vercel Project Settings and Redeploy (not just restart) so the build bakes them in.
- Backend 404/500 from the UI
  - Check backend health: https://leave-management-system-she-can-code-1.onrender.com/actuator/health
  - Open Swagger and try the same endpoint; compare paths the UI calls (see devtools Network tab) vs Swagger paths.
- CORS issues
  - Render usually sends permissive CORS for simple endpoints in this MVP. If you see CORS blocked, try in Swagger first; if it works there but not from Vercel, share the failing request details (method, path, response headers) so we can tune CORS.
- Dates validation
  - Ensure startDate <= endDate and pick a current or future date for predictable results.
- JWT or session issues
  - If actions suddenly fail, log out and log back in to refresh your token.

After completing the above, you’ll have validated: registration, login, staff apply, manager approve/reject, and admin stats on your live deployment.

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


## Deploying to Render (Blueprint)
You can deploy all three services to Render using the render.yaml we added.

Steps:
1. Push this repository to GitHub or GitLab.
2. In Render, click New > Blueprint and connect your repo.
3. Render will detect render.yaml and show three Web Services:
   - lms-auth-service (Docker) – health check: /actuator/health
   - lms-leave-service (Docker) – health check: /actuator/health
   - lms-frontend (Docker) – health check: /
4. For the first deploy, set environment variables in each service:
   - Auth service:
     - JWT_SECRET: set a strong secret (min 32 chars).
     - JWT_EXPIRATION_MS: e.g., 3600000.
     - GOOGLE_CLIENT_ID: your Google OAuth client ID (optional if not using Google login).
   - Leave service: no required vars by default.
   - Frontend:
     - VITE_AUTH_URL: e.g., https://lms-auth-service.onrender.com
     - VITE_LEAVE_URL: e.g., https://lms-leave-service.onrender.com
     - VITE_GOOGLE_CLIENT_ID: same as above if using Google login.
5. Click Apply. Render will build Docker images and deploy the services.
6. After the backends are live, update the frontend’s VITE_* URLs if needed and redeploy the frontend (rebuild required to bake in Vite env vars).

Notes:
- The backend Dockerfiles expose ports 8081 and 8082, and the frontend exposes 80. Render handles routing; no manual port mapping is needed.
- Spring Boot Actuator is already included; health checks at /actuator/health are available by default.
- Vite environment variables are read at build time; ensure the frontend service has the correct VITE_* values when it builds on Render.
