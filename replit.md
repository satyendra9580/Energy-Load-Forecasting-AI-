# Energy Load Forecasting Dashboard

## Overview

An advanced energy load forecasting platform that provides machine learning-based predictions for electricity demand. The application enables users to upload time-series energy data, train multiple forecasting models (Naive, ARIMA, Prophet, LSTM, Hybrid), and visualize predictions with 1-day (24-hour) and 7-day (168-hour) forecast horizons. The platform includes comprehensive data preprocessing, feature engineering, model comparison, and performance metrics visualization.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript, built using Vite for fast development and optimized production builds.

**UI Component System**: shadcn/ui components built on Radix UI primitives, following Material Design principles for data-intensive applications. The design emphasizes data-first information hierarchy with clear zones for different functions.

**Styling Approach**: 
- Tailwind CSS with custom design tokens defined in CSS variables
- Custom theme system supporting light/dark modes
- Typography: Inter/Roboto for UI, Roboto Mono for numerical data
- Spacing: Consistent primitives (2, 4, 6, 8) with max-w-7xl container strategy

**State Management**:
- TanStack Query (React Query) for server state and API data fetching
- Local component state for UI interactions
- Query client configured with aggressive caching (staleTime: Infinity) and disabled automatic refetching

**Routing**: Wouter for lightweight client-side routing with three main routes:
- `/` - Dashboard (metrics and forecast visualization)
- `/upload` - Data upload and preprocessing
- `/models` - Model selection and training

**Data Visualization**: Recharts library for time-series charts with customized tooltips and legends matching the design system.

### Backend Architecture

**Runtime**: Node.js with Express.js server

**Language**: TypeScript with ES modules

**API Design**: RESTful endpoints with file upload support via Multer:
- `POST /api/upload` - CSV file upload and preprocessing
- `POST /api/predict` - Model training and forecasting
- `GET /api/forecast/latest` - Retrieve latest forecast results
- `GET /api/dataset/info` - Dataset metadata

**Data Processing Pipeline**:
1. CSV parsing using PapaParse
2. Column detection (timestamp, load, temperature, humidity, etc.)
3. Data standardization and type conversion
4. Missing value imputation (forward/backward fill, linear interpolation)
5. Feature engineering (cyclical encoding, lag features, rolling statistics)
6. Model training and evaluation

**Feature Engineering**:
- Temporal features: hour, day_of_week, month, is_weekend
- Cyclical encoding: sin/cos transformations for temporal cycles
- Lag features: lag_1, lag_24, lag_168 (1 hour, 1 day, 1 week)
- Rolling statistics: 3h, 24h, 168h moving averages

**Model Implementation**: Simplified forecasting models implemented server-side:
- Naive baseline (last value persistence)
- ARIMA-like statistical forecasting
- Additional models (Prophet, LSTM, Hybrid) designed but requiring full ML implementation

**Evaluation Metrics**: MAE (Mean Absolute Error), RMSE (Root Mean Squared Error), MAPE (Mean Absolute Percentage Error)

### Data Storage Solutions

**Development Storage**: In-memory storage (MemStorage class) for development and testing. Stores:
- Time series data points
- Processed data with engineered features
- Model results and predictions
- User data (authentication scaffold)

**Production Database**: PostgreSQL configured via Drizzle ORM:
- Database URL provided via environment variable (DATABASE_URL)
- Connection via @neondatabase/serverless for serverless compatibility
- Schema defined in `shared/schema.ts` with Drizzle migrations in `./migrations`

**Schema Design**:
- Users table with username/password (authentication ready)
- Time series data represented as TypeScript interfaces (not persisted in production implementation)
- Shared type definitions between frontend and backend via `shared/schema.ts`

### External Dependencies

**Database**: 
- Neon Serverless PostgreSQL
- Drizzle ORM for type-safe database operations
- Session storage via connect-pg-simple (PostgreSQL session store)

**UI Libraries**:
- Radix UI primitives (@radix-ui/*) for accessible, unstyled components
- shadcn/ui component patterns
- Recharts for data visualization
- date-fns for date formatting and manipulation
- Lucide React for icons

**Data Processing**:
- PapaParse for CSV parsing
- Multer for multipart form data handling

**Development Tools**:
- Vite with React plugin
- TypeScript with strict mode
- Replit-specific plugins: runtime error overlay, cartographer, dev banner

**Build & Deployment**:
- esbuild for server bundling
- Production mode serves built static files
- Development mode uses Vite middleware with HMR

### Authentication and Authorization

**Current State**: Basic authentication scaffolding in place with user schema and storage interface, but authentication endpoints not implemented in routes.

**Design**: User table with username/password fields ready for implementation. Session management prepared via connect-pg-simple for PostgreSQL-backed sessions.