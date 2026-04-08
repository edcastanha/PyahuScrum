# Quickstart - GitHub OAuth Authentication with Login Home

## 1. Prerequisites
- Node.js 20+
- npm 10+
- MongoDB running and reachable
- GitHub OAuth App configured with callback URL

## 2. Environment Variables

Backend (`backend/.env`):
- PORT=4000
- MONGODB_URI=mongodb://localhost:27017/devportfolio
- GITHUB_CLIENT_ID=<github-client-id>
- GITHUB_CLIENT_SECRET=<github-client-secret>
- GITHUB_CALLBACK_URL=http://localhost:4000/api/auth/github/callback
- JWT_SECRET=<long-random-secret>
- FRONTEND_URL=http://localhost:3000

Frontend (`DevPortfolio/.env`):
- REACT_APP_API_BASE_URL=http://localhost:4000/api

## 3. Install Dependencies

Frontend:
- cd DevPortfolio
- npm install

Backend:
- cd backend
- npm install

## 4. Run Locally

Terminal 1 (backend):
- cd backend
- npm run dev

Terminal 2 (frontend):
- cd DevPortfolio
- npm start

## 5. Validate Main Flow
1. Open http://localhost:3000
2. Confirm home shows login page.
3. Click "Entrar com GitHub".
4. Authorize app on GitHub.
5. Confirm redirect back to app and dashboard access.
6. Confirm user and session records in MongoDB.

## 6. Validate Security and Errors
1. Revoke session and verify protected route redirect.
2. Simulate expired token and verify re-login prompt.
3. Simulate GitHub API failure and verify retry + user message.

## 7. Minimum Automated Tests
- Contract tests for auth endpoints.
- Integration tests for OAuth callback -> user upsert -> session create.
- Frontend route guard tests (unauthenticated vs authenticated).
- Logout test for session invalidation.
