# HRMS PRO Backend

Enterprise-grade multi-tenant HRMS backend built with Node.js, Express, and TypeScript.

## Features
- **Multi-Tenancy**: Data isolation using `tenantId`.
- **Authentication**: JWT with Refresh Token Rotation.
- **RBAC**: Role-Based Access Control.
- **Modules**: Employee, Organization, Attendance, Leave, Workflow, Reports, Audit.
- **Architecture**: Service-Repository Pattern, Clean Architecture.

## Setup
1. Install dependencies: `npm install`
2. Configure `.env` (use `.env.example` as a template)
3. Start development server: `npm run dev`
4. Build for production: `npm run build`

## Scripts
- `npm run dev`: Start with `ts-node-dev`
- `npm run build`: Compile TypeScript to JavaScript
- `npm run start`: Run production build
- `npm test`: Run tests
