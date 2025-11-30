# FoodBytes Client

React frontend for the FoodBytes meal planning application.

## Features

- Recipe browsing with meal type tabs (Breakfast, Lunch, Dinner, Snacks)
- Google OAuth authentication
- Weekly meal planning calendar
- Shopping list with aisle grouping
- Mobile-first responsive design
- Wake lock for shopping and calendar views

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

The app will be available at http://localhost:3000

## Build

```bash
npm run build
```

## Technologies

- React 18
- Vite
- React Router v6
- Axios
- date-fns
- CSS Modules

## Project Structure

```
src/
├── components/
│   ├── auth/          # Authentication components
│   ├── calendar/      # Calendar view components
│   ├── common/        # Reusable UI components
│   ├── layout/        # Layout components
│   ├── recipes/       # Recipe components
│   └── shopping/      # Shopping list components
├── contexts/          # React contexts
├── hooks/             # Custom hooks
├── pages/             # Page components
├── services/          # API services
├── styles/            # Global styles
└── utils/             # Utility functions
```

## API Configuration

The Vite dev server proxies API requests to localhost:8080. Update `vite.config.js` if your backend runs on a different port.
