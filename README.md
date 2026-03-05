# authentication-system-mobile-web

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9
- A **Firebase** project with Authentication and Firestore enabled
- (Optional) **Docker** & **Docker Compose** for containerised builds

### 1. Clone & install

```bash
git clone <repo-url>
cd authentication-system-mobile-web
make setup        # installs shared, web, and mobile dependencies
```

### 2. Configure environment variables

```bash
make setup-env    # copies .env.example → .env for web and mobile
```

Then open `web/.env` and `mobile/.env` and fill in your Firebase credentials.  
See `web/.env.example` and `mobile/.env.example` for the full list of required variables.

### 3. Run

```bash
make dev-web      # Next.js on http://localhost:3000
make dev-mobile   # Expo dev server
```

### 4. Test

```bash
make test                # run all tests (shared + web)
make test-web            # web only
make test-shared         # shared only
make test-web-watch      # web in watch mode
make test-shared-watch   # shared in watch mode
make test-web-coverage   # web with coverage report
make test-shared-coverage # shared with coverage report
```

### 5. Lint & Build

```bash
make lint-web     # ESLint
make build-web    # production build
```

### 6. Docker

```bash
make docker-up    # build & start containers
make docker-down  # stop containers
make docker-build # build images only
```

### All Makefile commands

Run `make` or `make help` to see every available target.