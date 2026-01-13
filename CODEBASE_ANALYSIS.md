# Southern Apparels ERP - Complete Codebase Analysis

## Executive Summary

This is a comprehensive Enterprise Resource Planning (ERP) system for **Southern Apparels and Holdings**, a ready-made garment (RMG) manufacturing company. The system is built with a modern microservices-inspired architecture using **FastAPI (Python)** backend and **Next.js 16 (TypeScript/React 19)** frontend, orchestrated via Docker Compose.

---

## Architecture Overview

### Technology Stack

**Backend:**
- **Framework:** FastAPI 0.115.5
- **Database:** PostgreSQL 15 (6 separate databases)
- **ORM:** SQLAlchemy 2.0.36
- **Authentication:** JWT (python-jose)
- **Caching:** Redis 7
- **Server:** Uvicorn/Gunicorn
- **Validation:** Pydantic 2.10.3

**Frontend:**
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript 5.8.3
- **UI Library:** React 19
- **Styling:** Tailwind CSS 4.1.10
- **Components:** Radix UI
- **State Management:** Zustand 5.0.5
- **Data Fetching:** TanStack React Query 5.62.0
- **Forms:** React Hook Form + Zod
- **Testing:** Vitest 4.0.16

**Infrastructure:**
- **Containerization:** Docker & Docker Compose
- **Database:** 6 PostgreSQL instances
- **Cache:** Redis
- **Deployment:** Standalone Next.js output

---

## Database Architecture

### Multi-Database Design

The system uses **6 separate PostgreSQL databases** for data isolation and scalability:

1. **`rmg_erp_clients`** (db-clients)
   - Buyers, Suppliers, Contacts, Shipping Addresses, Banking Details
   - Buyer Types

2. **`rmg_erp_samples`** (db-samples)
   - Style Summaries, Style Variants
   - Sample Requests, Sample Plans
   - Sample Operations, Manufacturing Operations
   - Sample TNA, Sample Status
   - SMV Calculations
   - **Workflow System** (SampleWorkflow, WorkflowCard, CardStatusHistory, etc.)

3. **`rmg_erp_users`** (db-users)
   - Users, Roles, Permissions
   - Authentication data

4. **`rmg_erp_orders`** (db-orders)
   - Order Management
   - Order tracking and status

5. **`rmg_erp_merchandiser`** (db-merchandiser)
   - Material Details (Yarn, Fabric, Trims, Accessories, Finished Goods, Packing Goods)
   - Size Charts
   - Sample Primary Info (Merchandiser view)
   - Sample TNA Color Wise
   - Sample Status (Merchandiser view)
   - Style Creation, Style Basic Info
   - Style Material Links
   - Style Colors, Sizes, Variants
   - CM Calculations

6. **`rmg_erp_settings`** (db-settings)
   - Company Profile, Branches, Departments
   - User Roles
   - Master Data: Colors, Countries, Currencies
   - **Unit of Measure (UOM)** System
   - UOM Categories (9 categories: Length, Weight, Quantity, Textile Density, Yarn Count, Packaging, Area, Volume, Time)
   - Fiscal Years, Document Numbering
   - Warehouses, Accounts

### Database Connection Management

- Each database has its own SQLAlchemy engine and session factory
- Connection pooling: 10 base connections per database (60 total base, 120 max with overflow)
- Separate Base classes: `BaseClients`, `BaseSamples`, `BaseUsers`, `BaseOrders`, `BaseMerchandiser`, `BaseSettings`
- Dependency injection functions: `get_db_clients()`, `get_db_samples()`, etc.

---

## Backend Architecture

### Project Structure

```
backend/
├── main.py                 # FastAPI app entry point
├── core/                   # Shared core functionality
│   ├── config.py          # Settings (Pydantic BaseSettings)
│   ├── database.py        # Multi-DB connection management
│   ├── security.py        # JWT, password hashing
│   ├── logging.py         # Logging configuration
│   ├── cache.py           # Redis caching
│   └── services/          # Base service classes
├── modules/               # Feature modules
│   ├── auth/              # Authentication
│   ├── clients/           # Buyers, Suppliers, Contacts, Shipping, Banking
│   ├── samples/           # Sample tracking, Styles, Variants, Operations
│   ├── orders/            # Order management
│   ├── materials/         # Material master data
│   ├── users/             # User management
│   ├── operations/        # Manufacturing operations
│   ├── master_data/       # Colors, sizes
│   ├── merchandiser/      # Merchandiser department features
│   ├── settings/          # System settings, UOM, master data
│   ├── notifications/     # Notification system
│   ├── workflows/         # ClickUp-style workflow system
│   └── health/            # Health checks
├── migrations/            # Database migrations
└── requirements.txt       # Python dependencies
```

### Module Pattern

Each module follows a consistent structure:
- **`models/`** - SQLAlchemy ORM models
- **`schemas/`** - Pydantic schemas (request/response validation)
- **`routes/`** - FastAPI route handlers
- **`services/`** (optional) - Business logic layer

### Key Backend Features

1. **Authentication & Authorization**
   - JWT-based authentication
   - Password hashing with bcrypt
   - Token expiration: 7 days (configurable)
   - User roles and department-based access control

2. **Workflow System** (ClickUp-style)
   - Sample workflows with cards and stages
   - Sequential stage progression
   - Status tracking (pending, in_progress, completed, blocked, ready)
   - Auto-activation of next stage on completion
   - Blocking prevention (blocks subsequent stages)
   - Status history audit trail
   - Comments and attachments on cards
   - Workflow templates
   - Statistics and reporting

3. **Sample Management**
   - Sample requests with full lifecycle tracking
   - Style summaries and variants
   - Material requirements
   - TNA (Time and Action) tracking
   - Sample operations and SMV calculations
   - Sample status synchronization with workflows

4. **Merchandiser Module**
   - Comprehensive material details (6 types)
   - Size chart management
   - Sample development tracking
   - Style creation from samples
   - CM (Cost per Minute) calculations

5. **UOM System**
   - 9 garment-industry categories
   - 55+ predefined units
   - Unit conversion system
   - Category-based organization
   - Database-driven (not hardcoded)

---

## Frontend Architecture

### Project Structure

```
frontend/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth routes (login, register, forgot-password)
│   ├── dashboard/
│   │   ├── (authenticated)/ # Protected routes
│   │   │   └── erp/       # Main ERP modules
│   │   └── (public)/      # Public dashboard routes
│   ├── api/               # API proxy routes
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/                # Radix UI components (shadcn/ui)
│   ├── layout/            # Layout components (sidebar, header)
│   └── uom/               # UOM-specific components
├── lib/                   # Utilities and configurations
│   ├── auth-context.tsx   # Authentication context
│   ├── config.ts          # App configuration
│   ├── permissions.ts     # Permission checking
│   └── utils.ts           # Helper functions
├── services/              # API service layer
│   ├── api.ts             # Core API functions
│   └── error-handling.ts  # Error handling
├── hooks/                 # Custom React hooks
│   ├── use-uom.ts         # UOM hooks
│   └── use-queries.ts     # React Query hooks
├── router.config.ts       # Route definitions
├── query.config.ts        # React Query keys
└── types.d.ts             # TypeScript type definitions
```

### Key Frontend Features

1. **Authentication Flow**
   - Encrypted token storage (Web Crypto API)
   - Cookie-based middleware authentication
   - Legacy migration support
   - Auto-redirect on protected routes

2. **Routing**
   - Next.js App Router with route groups
   - Middleware for route protection
   - API masking via URL rewrites
   - Centralized route configuration

3. **State Management**
   - React Context for auth
   - Zustand for global state
   - TanStack React Query for server state
   - Optimistic updates support

4. **UI Components**
   - shadcn/ui component library
   - Radix UI primitives
   - Tailwind CSS styling
   - Responsive design
   - Dark mode support (via next-themes)

5. **Data Fetching**
   - Centralized API service layer
   - React Query for caching and synchronization
   - Error handling service
   - Loading states management

---

## Core Business Logic

### Sample Development Workflow

1. **Sample Request Creation**
   - Buyer selection
   - Style linking (optional)
   - Material specifications (yarn, trims, decorative)
   - TNA dates (yarn handover, trims handover, required date)
   - Techpack attachment

2. **Workflow Creation**
   - Based on templates
   - Creates cards for each stage
   - Assigns team members
   - Sets due dates

3. **Stage Progression**
   - Sequential stages (Designer → Programming → Knitting → Finishing)
   - Status transitions: ready → pending → in_progress → completed
   - Auto-activation of next stage
   - Blocking prevents subsequent stages

4. **Sample Status Sync**
   - Workflow status syncs to sample request
   - Statuses: Pending, In Progress, Blocked, Completed, Cancelled

### Material Management

**6 Material Types:**
1. **Yarn Details** - 13 fields (ID, name, composition, blend ratio, count, type, form, TPI, finish, color, dye type, UOM, remarks)
2. **Fabric Details** - 16 fields (ID, name, category, type, construction, weave/knit, GSM, gauge/EPI, width, stretch, shrink, finish, composition, handfeel, UOM, remarks)
3. **Trims Details** - 7 fields (Product ID, name, category, sub-category, UOM, consumable flag, remarks)
4. **Accessories Details** - 7 fields (same as trims)
5. **Finished Good Details** - 7 fields (same as trims)
6. **Packing Good Details** - 12 fields (includes carton dimensions and weight)

### Order Management

- Order creation from samples
- Style linking
- Buyer association
- Order quantity, pricing, dates
- Status tracking (Received, In Production, Shipped, Completed)
- SCL PO number generation

### UOM System

**9 Categories:**
1. Length (m, cm, mm, in, ft, yd, km)
2. Weight (kg, g, mg, lb, oz, MT)
3. Quantity (pcs, dz, gr, gg, pr, set, pk)
4. Textile Density (gsm, oz/yd², g/m²)
5. Yarn Count (den, tex, dtex, Ne, Nm)
6. Packaging (roll, cone, spool, hank, bale, ctn, box, bdl, bag)
7. Area (m², cm², ft², yd², in²)
8. Volume (L, mL, m³, gal)
9. Time (min, sec, hr, day)

**Features:**
- Factor-based conversion
- Base unit system
- Category filtering
- Symbol validation
- Search functionality

---

## API Architecture

### Endpoint Structure

All APIs follow RESTful conventions:
- Base path: `/api/v1`
- Resource-based URLs
- Standard HTTP methods (GET, POST, PUT, DELETE, PATCH)
- JWT Bearer token authentication

### Key Endpoints

**Authentication:**
- `POST /auth/login` - Login
- `GET /auth/me` - Get current user
- `POST /auth/register` - Register (if enabled)

**Clients:**
- `/buyers/*` - Buyer management
- `/suppliers/*` - Supplier management
- `/contacts/*` - Contact management
- `/shipping/*` - Shipping addresses
- `/banking/*` - Banking details

**Samples:**
- `/samples/*` - Sample requests
- `/samples/styles/*` - Style summaries
- `/samples/style-variants/*` - Style variants
- `/samples/operations/*` - Sample operations
- `/samples/tna/*` - TNA tracking

**Workflows:**
- `/workflows/*` - Workflow management
- `/workflows/{id}/cards/*` - Card operations
- `/workflows/statistics` - Statistics

**Merchandiser:**
- `/merchandiser/yarn/*` - Yarn details
- `/merchandiser/fabric/*` - Fabric details
- `/merchandiser/trims/*` - Trims details
- `/merchandiser/sample-primary/*` - Sample primary info
- `/merchandiser/style-creation/*` - Style creation
- `/merchandiser/cm-calculation/*` - CM calculations

**Settings:**
- `/settings/uom-categories/*` - UOM categories
- `/settings/uom/*` - UOM units
- `/settings/uom/convert` - Unit conversion
- `/settings/colors/*` - Color master
- `/settings/size-charts/*` - Size charts

---

## Security Features

1. **Authentication**
   - JWT tokens with expiration
   - Password hashing (bcrypt)
   - Encrypted token storage (frontend)

2. **Authorization**
   - Department-based access control
   - Role-based permissions
   - Route protection via middleware

3. **Data Security**
   - SQL injection prevention (SQLAlchemy ORM)
   - XSS protection (React auto-escaping)
   - CORS configuration
   - Security headers (X-Frame-Options, X-Content-Type-Options)

4. **API Security**
   - Bearer token authentication
   - Rate limiting (via Redis)
   - Input validation (Pydantic schemas)

---

## Deployment Architecture

### Docker Compose Setup

**Services:**
1. **6 PostgreSQL databases** (one per database)
2. **Redis** (caching)
3. **Backend** (FastAPI on port 8000)
4. **Frontend** (Next.js on port 3000)

**Networks:**
- All services on `erp` bridge network

**Volumes:**
- Persistent database volumes
- Database initialization scripts

### Environment Configuration

- `.env` file for configuration
- Environment variables for:
  - Database credentials
  - Redis settings
  - JWT secret key
  - CORS origins
  - Ports

---

## Key Design Patterns

1. **Repository Pattern** - Service layer abstracts database access
2. **Dependency Injection** - FastAPI Depends() for database sessions
3. **Factory Pattern** - Database session factories
4. **Observer Pattern** - Notification system
5. **Template Method** - Workflow templates
6. **Strategy Pattern** - UOM conversion strategies

---

## Testing

- **Backend:** Unit tests (pytest)
- **Frontend:** Component tests (Vitest, React Testing Library)
- **Property-based testing:** Fast-check for complex logic

---

## Development Workflow

1. **Migrations:** Run on startup (automatic)
2. **Seed Data:** Initial data population
3. **Hot Reload:** Both frontend and backend support hot reload
4. **Type Safety:** Full TypeScript coverage

---

## Known Features & Modules

### Completed Modules
- ✅ Authentication & User Management
- ✅ Client Management (Buyers, Suppliers, Contacts, Shipping, Banking)
- ✅ Sample Management
- ✅ Style Management
- ✅ Workflow System (ClickUp-style)
- ✅ Order Management
- ✅ Merchandiser Module
- ✅ UOM System
- ✅ Notifications
- ✅ Master Data (Colors, Sizes)

### In Progress / Planned
- Production Management
- Inventory Management
- Reports & Analytics
- Advanced Permissions

---

## File Count Summary

- **Backend:** ~117 Python files
- **Frontend:** ~216 TypeScript/TSX files
- **Total:** ~333 source files

---

## Key Configuration Files

- `backend/core/config.py` - Backend settings
- `frontend/lib/config.ts` - Frontend settings
- `docker-compose.yml` - Infrastructure
- `router.config.ts` - Route definitions
- `query.config.ts` - React Query keys
- `types.d.ts` - TypeScript types

---

## Conclusion

This is a **production-ready, enterprise-grade ERP system** with:
- **Modular architecture** for maintainability
- **Multi-database design** for scalability
- **Modern tech stack** for performance
- **Comprehensive feature set** for RMG industry
- **Type-safe** codebase (TypeScript + Pydantic)
- **Docker-based** deployment for consistency

The codebase follows best practices with clear separation of concerns, comprehensive error handling, and a well-structured API layer.
