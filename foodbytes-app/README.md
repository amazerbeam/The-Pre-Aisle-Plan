# FoodBytes MVP

A recipe viewer application with Google OAuth authentication.

## Features (MVP)

- **Sign In / Guest Access** - Sign in with Google or continue as guest
- **Browse Recipes** - View recipes by meal category (Breakfast, Lunch, Dinner, Snacks)
- **Recipe Details** - Expandable cards with ingredients and cooking steps
- **Serving Adjustment** - Scale ingredient quantities based on servings
- **Search** - Find recipes by name
- **Footer Navigation** - Quick access to features

## Tech Stack

- **Frontend**: React 18 + Vite
- **Backend**: Java 17 + Spring Boot 3.2
- **Database**: MySQL 8.0
- **Authentication**: Google OAuth 2.0 with JWT (httpOnly cookies)
- **Deployment**: Docker + Docker Compose

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Google OAuth credentials (see setup below)

### Setup Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Navigate to APIs & Services > Credentials
4. Create OAuth 2.0 Client ID (Web application)
5. Add authorized redirect URI: `http://localhost:3000/login/oauth2/code/google`
6. Copy Client ID and Client Secret

### Run the Application

1. Copy environment template:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your Google OAuth credentials:
   ```
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-client-secret
   ```

3. Start with Docker Compose:
   ```bash
   docker-compose up --build
   ```

4. Open http://localhost:3000 in your browser

## Development

### Run Frontend (Dev Mode)

```bash
cd client
npm install
npm run dev
```

### Run Backend (Dev Mode)

```bash
cd foodbytes-api
./mvnw spring-boot:run
```

### Database

The database is automatically initialized with schema and seed data when Docker starts.

## Project Structure

```
foodbytes-app/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── contexts/       # React contexts
│   │   ├── services/       # API services
│   │   └── styles/         # CSS files
│   └── Dockerfile
├── foodbytes-api/          # Spring Boot backend
│   ├── src/main/java/com/foodbytes/
│   │   ├── config/         # Configuration
│   │   ├── controller/     # REST controllers
│   │   ├── dto/            # Data transfer objects
│   │   ├── model/          # JPA entities
│   │   ├── repository/     # JPA repositories
│   │   ├── security/       # Security/JWT
│   │   └── service/        # Business logic
│   └── Dockerfile
├── database/               # SQL scripts
│   ├── schema.sql          # Database schema
│   └── seed.sql            # Sample data
├── docker-compose.yml
└── .env.example
```

## Requirements Implemented

- [x] FR-001: Sign In / Guest Access
- [x] FR-002: Browse Recipes by Meal Category
- [x] FR-003: View Recipe Details
- [x] FR-004: Adjust Serving Sizes
- [x] FR-005: Search Recipes
- [x] FR-006: Footer Navigation

## Brand Color

Primary: `#4a3f80` (Deep Purple)
