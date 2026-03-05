# Authentication System

A monorepo containing a web and mobile authentication system built on Firebase.
Both platforms share a common library for auth logic, user management, and Firebase configuration, keeping behaviour consistent across web and mobile while allowing platform-specific setup where needed.

| Layer   | Technology                     |
|---------|--------------------------------|
| Web     | Next.js, React, Tailwind CSS   |
| Mobile  | Expo, React Native             |
| Backend | Firebase Auth, Firestore       |
| Shared  | TypeScript                     |
| Testing | Vitest, React Testing Library  |

---

## Setup

### Prerequisites

- Node.js >= 18
- npm >= 9
- A Firebase project with Authentication and Firestore enabled
- (Mobile) Expo CLI (`npx expo`)
- (Optional) Docker and Docker Compose

### 1. Clone the repository

```bash
git clone <repo-url>
cd authentication-system-mobile-web
```

### 2. Install dependencies

The project has three packages (`shared`, `web`, `mobile`) that each have their own `node_modules`. The quickest way to install everything at once is through the Makefile:

```bash
make setup
```

Or equivalently with npm:

```bash
npm run setup
```

This runs `npm install` inside `shared/`, `web/`, and `mobile/` in sequence.

**Important:** whenever you run `npm install` in `web/` or `mobile/` individually, make sure `shared/` dependencies are also installed. The root `setup:shared` script handles this (`cd shared && npm install`), so running `npm run setup` from the root always covers all three.

### 3. Set up environment variables

Each package ships an `.env.example` file listing every variable that needs to be set. To create your local development copies:

```bash
make setup-env
```

This copies `web/.env.example` to `web/.env.development` and `mobile/.env.example` to `mobile/.env.development`. Existing files are not overwritten.

Open the newly created files and fill in your Firebase project credentials:

**web/.env.development**

```
NEXT_PUBLIC_API_KEY=
NEXT_PUBLIC_AUTH_DOMAIN=
NEXT_PUBLIC_PROJECT_ID=
NEXT_PUBLIC_STORAGE_BUCKET=
NEXT_PUBLIC_MESSAGING_SENDER_ID=
NEXT_PUBLIC_APP_ID=
NEXT_PUBLIC_MEASUREMENT_ID=
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=
NEXT_PUBLIC_APP_CHECK_DEBUG=
```

**mobile/.env.development**

```
EXPO_PUBLIC_API_KEY=
EXPO_PUBLIC_AUTH_DOMAIN=
EXPO_PUBLIC_PROJECT_ID=
EXPO_PUBLIC_STORAGE_BUCKET=
EXPO_PUBLIC_MESSAGING_SENDER_ID=
EXPO_PUBLIC_APP_ID=
EXPO_PUBLIC_MEASUREMENT_ID=
```

All `.env` files are gitignored. Only `.env.example` files are committed so that other developers know which variables are required without ever exposing real credentials.

### 4. Start development servers

Web (runs on http://localhost:3000):

```bash
make dev-web
```

Mobile (opens Expo dev server):

```bash
make dev-mobile
```

### 5. Run tests

```bash
make test               # all tests (shared + web)
make test-web           # web only
make test-shared        # shared only
make test-web-watch     # web in watch mode
make test-shared-watch  # shared in watch mode
```

### 6. Lint and build

```bash
make lint-web           # ESLint
make build-web          # production build
```

### 7. Docker

Docker requires Docker Desktop (or the Docker daemon) to be running. Start it before using any Docker commands.

Docker Compose reads Firebase credentials from a root `.env` file for build-time arguments. Create it with:

```bash
make setup-env-docker
```

Then open `.env` in the project root and fill in the same `NEXT_PUBLIC_*` values you use in `web/.env.development`. You can copy them from there.

```bash
make docker-up          # build and start containers
make docker-down        # stop containers
make docker-build       # build images only
```

### 8. Cleanup

Remove all `node_modules` directories at once:

```bash
make clean
```

Run `make help` to see every available Makefile target.

---

## Project Structure

```
authentication-system-mobile-web/
├── shared/             Shared TypeScript library (Firebase init, auth, user service)
├── web/                Next.js web application
├── mobile/             Expo React Native application
├── Makefile            Development commands
├── docker-compose.yml  Docker Compose configuration
└── package.json        Root scripts that orchestrate all packages
```

### shared/

Contains all Firebase initialisation, authentication logic (sign in, sign up, sign out, password reset), user profile management, and shared TypeScript types. Both `web` and `mobile` import from this package via `@shared/*` path aliases, so any change to auth behaviour is made in one place.

### web/

Next.js application using the App Router. Auth pages (login, register, forgot password) live under `(auth)/` and the protected dashboard under `(protected)/`. Includes Tailwind CSS for styling, the logger utility, and App Check integration with reCAPTCHA.

### mobile/

Expo application using expo-router for file-based navigation. Reads Firebase config through `app.config.js` extras and initialises auth with React Native AsyncStorage persistence.

---

## What This Includes

### Environment Isolation (Development vs Production)

The project uses two separate Firebase projects to keep development and production data completely apart:

- **AuthAppDev** -- used during development. Developers can create test accounts, manipulate data, and experiment without risk.
- **AuthApp** -- the production project. Real user data lives here and is never touched during development.

Each environment has its own `.env.development` / `.env.production` file pointing to the corresponding Firebase project. This data isolation means a developer can freely test registration flows, reset passwords, or wipe Firestore collections in the dev project without any chance of affecting production.

### Secure Credential Management

Firebase API keys, reCAPTCHA site keys, and project IDs are stored in `.env` files that are gitignored. The repository only tracks `.env.example` templates so new developers can see which variables are needed and create their own local copies.

### Adapter Pattern

Web and mobile have different requirements for Firebase Auth initialisation. Web uses the default browser-based persistence, while React Native needs `initializeAuth` with `AsyncStorage` persistence. These two approaches are incompatible.

The shared `initializeFirebase` function accepts an optional `initAuth` callback. When omitted (web), it falls back to the standard `getAuth()`. When provided (mobile), it uses the platform-specific initialisation. This lets both platforms share the same auth service layer without either needing to know about the other's persistence mechanism.

### Email Enumeration Prevention

Authentication error messages are deliberately vague to prevent attackers from discovering whether a given email exists in the system:

- Login failures for wrong password, unknown email, and invalid credentials all return the same "Invalid email or password" message.
- The forgot-password page always displays "If an account exists with that email, a reset link has been sent" regardless of whether the email is registered.
- Registration errors are similarly normalised.

An attacker probing the system cannot distinguish between a valid and invalid email address.

### reCAPTCHA and App Check

The web application uses Firebase App Check with reCAPTCHA Enterprise to verify that incoming requests come from a legitimate app instance rather than a bot or script. This is configured through the `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` environment variable. For local development, setting `NEXT_PUBLIC_APP_CHECK_DEBUG=true` enables the debug token provider so reCAPTCHA is bypassed on localhost.

In a production deployment, per-account rate limiting would be added on top of App Check to enforce cooldowns after repeated failed login attempts.

### Whitelist-Based Registration

Sign-up is gated behind a Firestore-backed whitelist. Only email addresses that exist in the `whitelist` collection with `approved: true` are allowed to register. This is enabled by default on web and can be toggled per platform through the `requireWhitelist` option in the shared auth service.

### Logger

The web app includes a lightweight logger that adjusts its output based on environment:

- **Development:** logs info, warnings, debug messages, and errors with labelled prefixes (`[INFO]`, `[WARN]`, `[DEBUG]`, `[ERROR]`).
- **Production:** only critical errors (`[ERROR]`) are logged. All other levels are stripped to keep the console clean and avoid leaking internal details.

### Unit Tests

Tests cover both the shared library and the web application:

- **Shared:** tests for `authService`, `firebaseConfig`, and `userService`.
- **Web:** tests for every page (login, register, forgot password, dashboard, home), the auth context, protected route layout, App Check initialisation, the logger, the whitelist check, and Firebase setup.

All tests run through Vitest. Use `make test` to run everything, or `make test-web-coverage` / `make test-shared-coverage` for coverage reports.

### Docker

A `docker-compose.yml` and `Dockerfile` are included alongside Makefile targets (`make docker-up`, `make docker-down`, `make docker-build`) for containerised builds and deployment.
