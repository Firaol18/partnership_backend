# Partnership Management System Backend

A robust and scalable backend API for the **Partnership Management System**, built with **NestJS**, **Prisma ORM**, and **PostgreSQL**. The system manages the complete partnership lifecycle, from opportunity identification to engagement, agreement management, partner registration, implementation, monitoring, and reporting.

---

## Table of Contents

- Overview
- Features
- Technology Stack
- Project Structure
- Prerequisites
- Installation
- Environment Variables
- Database Setup
- Running the Application
- API Documentation
- Authentication
- Scripts
- Database Migration
- Testing
- Logging
- Coding Standards
- Git Workflow
- Deployment
- Troubleshooting
- License

---

# Overview

The Partnership Management System is designed to digitize and automate partnership processes within an organization.

The backend provides secure REST APIs for:

- User Authentication
- Role & Permission Management
- Opportunity Management
- Engagement Management
- Agreement Management
- Partner Registration
- Document Management
- Workflow Management
- Notifications
- Audit Logging
- Reports & Dashboards

---

# Features

- JWT Authentication
- Role Based Access Control (RBAC)
- Permission Management
- RESTful APIs
- Swagger API Documentation
- Prisma ORM
- PostgreSQL
- Request Validation
- Global Exception Handling
- Logging
- File Upload Support
- Audit Trail
- Pagination
- Filtering
- Search
- Soft Delete
- Modular Architecture

---

# Technology Stack

| Technology      | Version |
| --------------- | ------- |
| Node.js         | 22+     |
| NestJS          | Latest  |
| Prisma ORM      | Latest  |
| PostgreSQL      | Latest  |
| TypeScript      | Latest  |
| JWT             | Latest  |
| Swagger         | Latest  |
| Class Validator | Latest  |

---

# Project Structure

```
src/
│
├── common/
│   ├── decorators/
│   ├── dto/
│   ├── enums/
│   ├── filters/
│   ├── guards/
│   ├── interceptors/
│   ├── middleware/
│   ├── pipes/
│   └── utils/
│
├── config/
│
├── prisma/
│
├── modules/
│   ├── auth/
│   ├── users/
│   ├── roles/
│   ├── permissions/
│   ├── opportunities/
│   ├── engagements/
│   ├── agreements/
│   ├── partners/
│   ├── documents/
│   ├── notifications/
│   └── reports/
│
├── app.module.ts
└── main.ts
```

---

# Prerequisites

Before running the project, ensure the following are installed:

- Node.js (22 or higher)
- npm
- PostgreSQL
- Git

---

# Installation

Clone the repository

```bash
git clone https://gitlab.aii.et/lechisa21/partnership-backend.git
```

Move into the project directory

```bash
cd partnership-backend
```

Install dependencies

```bash
npm install
```

---

# Environment Variables

Create a `.env` file in the project root.

Example:

```env
NODE_ENV=development

PORT=3000

API_PREFIX=api

DATABASE_URL="postgresql://postgres:password@localhost:5432/partnership_db"

JWT_SECRET=your-secret-key

JWT_EXPIRES_IN=1d

REFRESH_TOKEN_SECRET=refresh-secret

REFRESH_TOKEN_EXPIRES_IN=7d

CORS_ORIGIN=http://localhost:3000
```

---

# Database Setup

Generate Prisma Client

```bash
npx prisma generate
```

Run database migrations

```bash
npx prisma migrate dev
```

If you already have migrations

```bash
npx prisma migrate deploy
```

Open Prisma Studio

```bash
npx prisma studio
```

---

# Running the Application

Development

```bash
npm run start:dev
```

Production

```bash
npm run build
npm run start:prod
```

Watch Mode

```bash
npm run start:dev
```

---

# API Documentation

Swagger documentation is available after starting the server.

```
http://localhost:3000/api/docs
```

Use the **Authorize** button to authenticate with a JWT token.

Example:

```
Bearer eyJhbGciOiJIUzI1NiIs...
```

---

# Authentication

The system uses JWT Authentication.

Typical flow:

1. Login
2. Receive Access Token
3. Click **Authorize** in Swagger
4. Paste JWT token
5. Access protected endpoints

---

# Scripts

| Command            | Description          |
| ------------------ | -------------------- |
| npm install        | Install dependencies |
| npm run start      | Start application    |
| npm run start:dev  | Development mode     |
| npm run build      | Build project        |
| npm run start:prod | Production           |
| npm run lint       | Lint project         |
| npm run format     | Format code          |
| npm run test       | Unit tests           |
| npm run test:e2e   | End-to-end tests     |
| npm run test:cov   | Test coverage        |

---

# Database Migration

Create migration

```bash
npx prisma migrate dev --name migration_name
```

Generate Prisma Client

```bash
npx prisma generate
```

Reset Database

```bash
npx prisma migrate reset
```

Deploy Migrations

```bash
npx prisma migrate deploy
```

---

# Logging

The application includes centralized logging for:

- API Requests
- API Responses
- Errors
- Authentication
- Database Operations
- System Events

---

# Coding Standards

- Use TypeScript strict mode.
- Follow NestJS module architecture.
- Validate all incoming DTOs.
- Use Prisma for all database operations.
- Keep business logic in services.
- Keep controllers thin.
- Use dependency injection.
- Follow RESTful API conventions.

---

# Git Workflow

Create a feature branch

```bash
git checkout -b feature/feature-name
```

Commit changes

```bash
git commit -m "Add feature"
```

Push branch

```bash
git push origin feature/feature-name
```

Create a Merge Request in GitLab.

---

# Deployment

Production checklist

- Configure environment variables
- Run Prisma migrations
- Generate Prisma Client
- Build application
- Start production server
- Configure reverse proxy (Nginx)
- Enable HTTPS
- Configure logging
- Configure backups

---

# Troubleshooting

### Prisma Client Outdated

```bash
npx prisma generate
```

---

### Migration Error

```bash
npx prisma migrate reset
```

---

### Port Already in Use

Change

```
PORT=3000
```

to another available port.

---

### Cannot Connect to Database

Verify:

- PostgreSQL is running
- DATABASE_URL is correct
- Database exists
- User credentials are correct

---

# Contributing

1. Fork the repository.
2. Create a feature branch.
3. Commit your changes.
4. Push the branch.
5. Open a Merge Request.

---

---

# License

This project is proprietary and intended for internal organizational use unless otherwise specified.

© 2026 Partnership Management System. All rights reserved.
