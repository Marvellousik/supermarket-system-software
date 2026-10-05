# SuperMarket Management System
livelink : https://supermarket-system-software.vercel.app/
A comprehensive staff and machine management solution for supermarkets with shift scheduling capabilities.

## Key Features

- **Staff Management**:

  - Add, view, and remove cashiers with secure credentials
  - Toggle password visibility for verification
  - Responsive list and grid views

- **Machine Tracking**:

  - Register and manage cash register machines
  - Visual machine status indicators

- **Shift Scheduling**:

  - Assign cashiers to machines with start/end times
  - View current shift assignments

- **Modern UI**:
  - Dark theme interface with intuitive controls
  - Real-time clock display
  - Responsive design for all devices

## Technology Stack

- **Frontend**:

  - Next.js (App Router)
  - TypeScript
  - Tailwind CSS
  - React Hooks

- **State Management**:
  - React useState for local state
  - Context API (if applicable)

## Project Structure

```
src/
├── app/               # Main application pages
│   ├── layout.tsx     # Root layout
│   └── page.tsx       # Home page with staff management
├── components/        # Reusable components
│   └── Staff/         # Staff management components
│       ├── StaffManagement.tsx  # Main staff interface
│       └── ShiftManagement.tsx  # Shift scheduling
└── types/             # Type definitions
    ├── Entities.ts    # Employee and Machine types
    └── Shift.ts       # Shift type definitions
```

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## CI/CD & Deployment

This project includes automated CI/CD workflows using GitHub Actions:

- **CI Pipeline (`.github/workflows/ci.yml`)**:
  - Automatically runs on pull requests and pushes to `main`.
  - **Lint & Typecheck**: Enforces ESLint standards and runs TypeScript type checking (`tsc --noEmit`).
  - **Security Audit**: Scans production dependencies (`npm audit --omit=dev --audit-level=high`) to prevent vulnerable packages from being deployed.
  - **Production Build**: Compiles Next.js with telemetry disabled to verify build integrity.

- **CD Pipeline (`.github/workflows/deploy.yml`)**:
  - Triggers on push to `main` or manual dispatch.
  - Validates production build prior to deployment.
  - Supports Vercel deployment via GitHub Secrets (`VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`), or automatically through Vercel's native GitHub integration.

### NPM Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Create optimized production build
- `npm run start` - Start production server
- `npm run lint` - Run ESLint checks
- `npm run typecheck` - Run TypeScript compiler checks without emitting files

## Screenshots

![Staff Management Interface](/public/Screenshot_21-4-2025_15305_localhost.jpeg)

