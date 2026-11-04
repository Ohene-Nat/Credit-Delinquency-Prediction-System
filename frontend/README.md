# Delinquency Desk – Frontend (Phase 1)

React + Vite + TypeScript + Tailwind CSS + Recharts + Lucide + React Router.

    npm install
    npm run dev      # http://localhost:5173
    npm run build

Sign in with any valid email and a password of 6+ characters.

## Mock data
Everything is in-memory sample data (`src/data/mock.ts`). Predictions use a placeholder formula
(`src/data/mockEngine.ts`) that is NOT a machine learning model; the UI labels it as sample data.
Replace `runPrediction` in `src/context/AppContext.tsx` and the seed data with API calls in later phases.

## Structure
    src/components  Layout, ui primitives, charts
    src/context     App state (auth, theme, customers, predictions, toasts)
    src/data        Mock data + placeholder scoring
    src/pages       Login, Dashboard, Customers, NewPrediction, PredictionResult, History, Analytics, Reports, Settings
    src/types       TypeScript interfaces
    src/utils       Formatting, CSV export, stats
