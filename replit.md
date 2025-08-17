# Personal Finance App

## Overview
A comprehensive personal finance management application built with React, TypeScript, and Express. The app provides users with a modern, intuitive interface to track transactions, manage budgets, set financial goals, and visualize spending patterns through interactive dashboards and statistics.

## Recent Changes (August 17, 2025)
✓ Successfully migrated from Replit Agent to standard Replit environment
✓ Fixed mobile layout issues with safe area support for APK
✓ Added category creation functionality with icon and color selection
✓ Optimized CSS for mobile devices and standalone PWA mode
✓ Configured Capacitor for Android APK generation
✓ Added meta tags for proper mobile app behavior
✓ Updated navigation to work correctly with device safe areas
✓ Implemented complete offline storage system for mobile APK
✓ Fixed dashboard loading issues in mobile environment
✓ Added edit and delete transaction functionality with offline support
✓ Confirmed separate user sessions per APK installation (privacy feature)
✓ All core features now work 100% offline in mobile app
✓ **FIXED: Budget and goals not appearing after creation** - Fixed cache invalidation and data refresh
✓ **FIXED: Category icons appearing the same** - Improved icon rendering system
✓ **ADDED: Keyboard auto-dismiss** - Tapping outside form fields now dismisses keyboard
✓ **IMPROVED: Offline data persistence** - Enhanced storage reliability for budgets and goals
✓ **FIXED: Menu labels overlapping** - Shortened navigation labels for better mobile UX
✓ **ENHANCED: Force refresh after creation** - Added immediate refetch to ensure data appears
✓ **REMOVED: Goals feature** - Simplified app by removing unused goals functionality
✓ **FIXED: Category creation icons** - All category icons now display correctly and uniquely
✓ **ENHANCED: Debug logging** - Added comprehensive logging for budget creation troubleshooting
✓ **ADDED: Settings page** - Moved category creation to dedicated Settings menu
✓ **FIXED: Balance visibility toggle** - Eye icon now works to hide/show balance amounts
✓ **IMPROVED: Budget filtering** - Enhanced type conversion for month/year filtering
✓ Generated FinanceApp-ULTRA-FINAL-CORRECTED.apk with all critical issues resolved
✓ **ENHANCED: Budget daily suggestions** - Each budget now shows individual daily spending recommendations
✓ **FIXED: Category creation modal size** - Reduced modal width for better mobile proportions 
✓ **IMPROVED: Floating action button** - Changed to dropdown menu with multiple quick actions
✓ **ENHANCED: Dropdown styling** - Made Nova Transação more prominent with better visual hierarchy
✓ **OPTIMIZED: Category modal** - Reduced size and improved layout with compact grid design
✓ **IMPROVED: Dropdown actions** - Each option now directly opens the creation modal instead of just navigating
✓ **ENHANCED: Visual design** - Added gradients, shadows, and hover effects to all dropdown options
✓ **ADDED: Step-by-step category creation** - Split into Etapa 1 (nome) and Etapa 2 (ícone e cor)
✓ **INCREASED: Nova Transação emphasis** - Larger size, bold text, gradient background, and prominent positioning
✓ **ADDED: Delete functionality** - Added delete buttons for both categories and budgets with confirmation
✓ **MOVED: Smart tips to dashboard** - Removed general smart tip, moved to dashboard and individual budget cards
✓ **ENLARGED: Novo Orçamento button** - Made button larger and more prominent on budget page
✓ **CLEANED: Sample data** - Removed all sample transactions for clean app start with only default categories

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React + TypeScript**: Single-page application with component-based architecture
- **Vite**: Build tool and development server for fast development experience
- **TanStack Query**: Server state management for API data fetching and caching
- **Shadcn/ui**: Component library built on Radix UI primitives for consistent design
- **Tailwind CSS**: Utility-first CSS framework with custom dark theme styling
- **Chart.js**: Data visualization library for financial charts and graphs

### Backend Architecture
- **Express.js**: RESTful API server with TypeScript support
- **In-Memory Storage**: Current implementation uses MemStorage class as data layer
- **Drizzle ORM**: Database toolkit with PostgreSQL schema definitions
- **Session-based Architecture**: Single default user system for demo purposes

### Data Storage Design
- **Schema Definition**: Centralized in `shared/schema.ts` using Drizzle ORM
- **Database Tables**: Users, Categories, Transactions, Budgets, Goals
- **Type Safety**: Zod validation schemas for runtime type checking
- **Migration Ready**: Configured for PostgreSQL with Neon Database integration

### Authentication Strategy
- **Simplified Demo Mode**: Uses default user ID for all operations
- **Session Management**: Express session configuration with PostgreSQL store setup
- **Future-Ready**: Architecture supports user authentication expansion

### API Design
- **RESTful Endpoints**: CRUD operations for all financial entities
- **Filtering Support**: Query parameters for transaction filtering by type, category, date
- **Error Handling**: Centralized error middleware with appropriate HTTP status codes
- **Request Validation**: Input validation using Zod schemas

### UI/UX Architecture
- **Mobile-First Design**: Responsive layout optimized for mobile devices
- **Bottom Navigation**: Tab-based navigation for core features
- **Dark Theme**: Professional dark color scheme for financial applications
- **Component Modularity**: Reusable UI components for cards, modals, charts

## External Dependencies

### Database & Storage
- **Neon Database**: PostgreSQL-compatible serverless database
- **Drizzle Kit**: Database migration and schema management tool

### UI & Styling
- **Radix UI**: Headless component primitives for accessibility
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library for consistent iconography
- **Chart.js**: Canvas-based charting for financial data visualization

### State Management
- **TanStack Query**: Server state management and caching
- **React Hook Form**: Form state management with validation
- **Hookform Resolvers**: Integration between React Hook Form and Zod

### Development Tools
- **Vite**: Fast build tool with HMR support
- **TypeScript**: Static type checking
- **ESBuild**: Fast JavaScript bundler for production builds
- **Replit Integration**: Development environment optimization plugins

### Utility Libraries
- **Date-fns**: Date manipulation and formatting
- **Class Variance Authority**: CSS class composition utilities
- **Clsx**: Conditional CSS class composition
- **Nanoid**: Unique ID generation for entities