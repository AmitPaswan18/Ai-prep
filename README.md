# AI Platform Monorepo

This repository is a monorepo for the AI Platform, organized using Turborepo.

## Structure

```
ai-platform/
│
├── apps/
│   ├── web/            # Frontend (Next.js)
│   └── api/            # Backend (Node.js / Express)
│
├── packages/
│   ├── ui/             # Shared UI components
│   ├── config/         # Shared configurations (ESLint, TS, Tailwind)
│   ├── ai-core/        # AI logic, LLM proxy, evaluators, agents
│   └── shared/         # Shared types, utils, constants
│
├── infra/              # Infrastructure (Docker, CI/CD, IaC)
│
└── docs/               # Documentation
```

## Getting Started

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Run development servers:**
    ```bash
    npm run dev
    ```
    This command starts both the frontend and backend applications in development mode using Turbo.

3.  **Build:**
    ```bash
    npm run build
    ```

## Apps

-   **web**: The Next.js frontend application.
-   **api**: The Express/Node.js backend application.

## Packages

-   **ui**: Reusable React components.
-   **config**: Shared configuration files.
-   **ai-core**: Core AI functionalities.
-   **shared**: Common utilities and types.
