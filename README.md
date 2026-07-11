# RentNest Backend

![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![Node.js](https://img.shields.io/badge/Node.js-Express-green)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-blue)
![Stripe](https://img.shields.io/badge/Stripe-Payments-635BFF)
![License](https://img.shields.io/badge/License-Educational-orange)

A production-ready **Rental Management System Backend** built with
**Node.js, Express, TypeScript, PostgreSQL, Prisma ORM, and Stripe**.

## Quick Links

---

Resource Link

---

Backend Repository https://github.com/thedev-mohammadali/rent-nest-backend.git

Live API https://rent-nest-backend-1.onrender.com/

API Documentation https://documenter.getpostman.com/view/29072367/2sBY4LQgiB

Demo Video https://drive.google.com/file/d/1f0bPzB-JE_i_1FODzWciud64w_VZqTPu/view?usp=sharing

ERD: https://drawsql.app/teams/mohammad-ali-thedev/diagrams/rentnest

---

## Demo Credentials

Email Password

---

admin@rentnest.com Admin123@

## Table of Contents

- Project Overview
- Features
- Tech Stack
- Architecture
- Design Patterns
- Installation
- Environment Variables
- Database Migration
- Seed Script
- Running the Project
- Authentication
- Stripe Integration
- API Testing
- Business Workflow
- Deployment
- Future Improvements
- Author
- License

## Project Overview

RentNest is a RESTful backend that manages the complete rental lifecycle
including authentication, property listings, rental requests, rental
agreements, Stripe payments, reviews, and administration.

## Features

- JWT Authentication with Access & Refresh Tokens
- Category Management
- Property Management
- Rental Requests
- Rental Agreements
- Stripe Checkout & Webhooks
- Reviews
- Administration
- Pagination, Filtering, Searching and Sorting

## Tech Stack

- Node.js
- Express.js
- TypeScript
- PostgreSQL
- Prisma ORM
- Zod
- JWT
- Stripe
- Render
- Neon PostgreSQL

## Architecture

```text
src/
├── app/
├── common/
├── config/
├── generated/
├── lib/
├── middleware/
├── modules/
│   ├── auth/
│   ├── admin/
│   ├── category/
│   ├── property/
│   ├── rental-request/
│   ├── rental-agreement/
│   ├── payment/
│   └── review/
├── routes/
├── types/
├── utils/
├── app.ts
└── server.ts
```

The project follows a Domain-Driven Modular Architecture with Thin
Controllers, Fat Services, reusable Query Builders and Scope-Based
Authorization.

## Installation

```bash
git clone https://github.com/thedev-mohammadali/rent-nest-backend.git
cd rent-nest-backend
pnpm install
```

## Environment Variables

```env
PORT=
DATABASE_URL=
NODE_ENV=
BCRYPT_SALT_ROUNDS=
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
JWT_ACCESS_EXPIRES_IN=
JWT_REFRESH_EXPIRES_IN=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_SUCCESS_URL=
STRIPE_CANCEL_URL=
```

## Database Migration

```bash
pnpm prisma migrate dev
pnpm prisma generate
```

## Seed Script

```bash
pnpm prisma db seed
```

Creates the default administrator account.

## Running

```bash
pnpm dev
pnpm build
pnpm start
```

## Authentication

Protected endpoints support:

- Bearer Token
- HTTP-only Access Token Cookie

Refresh Tokens are stored as HTTP-only cookies.

## Stripe

Local webhook testing:

```bash
stripe listen --forward-to localhost:5000/api/payments/webhook
```

## API Testing

Use the published Postman documentation linked above.

## Business Workflow

```text
Register
↓
Login
↓
Create Property
↓
Rental Request
↓
Rental Agreement
↓
Stripe Payment
↓
Agreement Activated
↓
Review
```

## Deployment

- Backend: Render
- Database: Neon
- Payments: Stripe

## Future Improvements

- Email Notifications
- Image Uploads
- Dashboard Analytics
- Rate Limiting
- Automated Testing

## Author

**Mohammad Ali**

## License

Educational project developed as part of a backend development
assignment.
