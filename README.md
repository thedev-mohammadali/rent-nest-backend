# RentNest Backend

A production-ready **Rental Management System Backend** built with **Node.js, Express, TypeScript, PostgreSQL, Prisma ORM, and Stripe**.

RentNest enables landlords to list rental properties, tenants to request and rent those properties, secure online payments through Stripe Checkout, and administrators to manage the entire platform.

---

# Live API

> Render Deployment

```
https://rent-nest-backend-1.onrender.com
```

---

# Project Overview

RentNest is a RESTful backend service that supports the complete rental lifecycle:

- User Authentication
- Property Management
- Rental Requests
- Rental Agreements
- Secure Online Payments
- Property Reviews
- Administrative Management

The application follows a **Domain-Driven Modular Architecture**, where each module represents a business domain instead of user roles, making the project easier to scale and maintain.

---

# Features

## Authentication

- User Registration
- Login
- Refresh Token
- Logout
- Current User Profile
- JWT Authentication
- HTTP Only Refresh Token Cookies

---

## Categories

Admin can

- Create Category
- Update Category
- View Categories

---

## Property Management

### Public

- Browse Available Properties
- View Property Details

### Landlord

- Create Property
- Delete Property
- Toggle Availability
- View Own Properties
- View Single Property

### Admin

- View All Properties

Supports

- Pagination
- Search
- Filtering
- Sorting

---

## Rental Requests

Tenant

- Request Property Rental
- View Own Requests

Landlord

- View Rental Requests
- Approve Request
- Reject Request

Admin

- View All Requests

---

## Rental Agreements

- Automatically created after request approval
- Scope-based visibility
- Tenant access
- Landlord access
- Admin access

---

## Payments

Integrated with Stripe Checkout.

Features

- Secure Checkout Session
- Stripe Webhook
- Transaction-safe payment updates
- Payment History
- Payment Details

Supports

- Tenant
- Landlord
- Admin

---

## Reviews

Tenant can

- Create Review

---

## Admin

Manage

- Users
- User Status

---

# Tech Stack

## Backend

- Node.js
- Express.js
- TypeScript

## Database

- PostgreSQL
- Prisma ORM

## Authentication

- JWT
- Refresh Tokens
- HTTP Only Cookies
- bcrypt

## Validation

- Zod

## Payment

- Stripe Checkout
- Stripe Webhooks

## Deployment

- Render
- Neon PostgreSQL

---

# Architecture

The project follows a **Domain-Driven Architecture**.

```
src/
│
├── app/
├── config/
├── common/
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
│
├── routes/
├── types/
├── utils/
│
├── app.ts
└── server.ts
```

Each module contains its own

- Controller
- Service
- Route
- Validation
- Query Builder
- Types

Business logic stays inside services while controllers remain thin.

---

# Design Patterns

The application uses

- Domain Driven Modular Structure
- Thin Controllers
- Fat Services
- Query Builder Pattern
- Scope-Based Authorization
- Service Layer Pattern
- Prisma ORM Repository Style
- JWT Authentication
- Centralized Error Handling

---

# Query Builder Pattern

The following modules use reusable query builders.

- Property
- Rental Request
- Rental Agreement
- Payment

Each module supports

- Filtering
- Sorting
- Pagination

---

# Scope Based Authorization

Depending on authenticated user,

Scopes include

- PUBLIC
- TENANT
- LANDLORD
- ADMIN

This allows a single service implementation to safely expose different datasets based on user permissions.

---

# Installation

Clone the repository

```bash
git clone https://github.com/thedev-mohammadali/rent-nest-backend.git
```

Move inside the project

```bash
cd rent-nest-backend
```

Install dependencies

```bash
pnpm install
```

---

# Environment Variables

Create a `.env` file.

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

---

# Database Migration

Run Prisma migrations

```bash
pnpm prisma migrate dev
```

Generate Prisma Client

```bash
pnpm prisma generate
```

---

# Seed Admin User

Run

```bash
pnpm prisma db seed
```

Demo Admin

```
Email:
admin@rentnest.com

Password:
Admin123@
```

---

# Running the Project

Development

```bash
pnpm dev
```

Production Build

```bash
pnpm build
```

Start Production

```bash
pnpm start
```

---

# API Modules

```
Authentication

Category

Property

Rental Request

Rental Agreement

Payment

Review

Admin
```

---

# Authentication

Protected routes require

```
Authorization: Bearer <access_token>
```

Refresh Tokens are stored securely using HTTP Only Cookies.

---

# Stripe Integration

RentNest uses

- Stripe Checkout Session
- Stripe Webhooks

Webhook events update payment status after successful checkout.

For local webhook testing

```bash
stripe listen --forward-to localhost:5000/api/payments/webhook
```

---

# API Testing

The project includes a complete Postman Collection.

Features

- Organized by business workflow
- Environment Variables
- JWT Auto Save
- Ready for evaluation

Collection Structure

```
Authentication

Category

Property

Rental Request

Rental Agreement

Payment

Review

Admin
```

---

# Business Workflow

```
Register

↓

Login

↓

Landlord Creates Property

↓

Tenant Browses Properties

↓

Tenant Sends Rental Request

↓

Landlord Approves Request

↓

Rental Agreement Created

↓

Tenant Completes Stripe Payment

↓

Stripe Webhook Updates Payment

↓

Agreement Gets Activated

↓

Complete Rental

↓

Tenant Leaves Review
```

---

# Deployment

Backend

```
Render
```

Database

```
Neon PostgreSQL
```

Payments

```
Stripe
```

---

# Future Improvements

- Email Notifications
- Property Images
- Wishlist
- Advanced Search
- Dashboard Analytics
- File Uploads
- API Rate Limiting
- Unit & Integration Testing

---

# Demo Credentials

## Admin

```
Email:
admin@rentnest.com

Password:
Admin123@
```

---

# Author

**Mohammad Ali**

---

# License

This project was developed for educational purposes as part of a backend development assignment.
