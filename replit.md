# Online Testing Application

## Overview

This is a comprehensive online testing application designed for English language proficiency exam preparation, specifically for Aptis ESOL and VSTEP tests. The system provides a complete learning management platform with practice modes, mock tests, question bank management, and anti-cheating mechanisms for secure online testing.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite for build tooling
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming support
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Internationalization**: Custom i18n implementation supporting English and Vietnamese

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **API Design**: RESTful APIs with structured error handling
- **Session Management**: Express sessions with PostgreSQL session store
- **File Processing**: Multer for file uploads with support for Excel/Word document parsing
- **Real-time Features**: WebSocket integration for anti-cheat monitoring

### Database Design
- **ORM**: Drizzle ORM with type-safe database operations
- **Schema**: Relational design with the following core entities:
  - Users (authentication and profile management)
  - Question Banks (categorized by test type and skill)
  - Questions (with multiple choice options and explanations)
  - Tests (configurable exam templates)
  - Test Sessions (active test instances with anti-cheat tracking)
  - Results (detailed performance analytics)

### Authentication & Authorization
- **Strategy**: Session-based authentication using secure HTTP-only cookies
- **User Management**: Registration, login, and profile management
- **Session Security**: PostgreSQL-backed session storage with automatic cleanup

### Anti-Cheat System
- **Client-Side Monitoring**: JavaScript-based detection of tab switches, window focus changes, and user activity
- **WebSocket Communication**: Real-time event streaming for suspicious behavior
- **Behavioral Analytics**: Tracking and logging of potentially fraudulent activities
- **Test Environment Control**: Fullscreen enforcement and navigation restrictions during exams

### Test Management Features
- **Question Import**: Support for Excel and Word document parsing with structured question formats
- **Test Configuration**: Customizable time limits, question selection, and difficulty settings
- **Adaptive Testing**: Support for different test types (Aptis, VSTEP, custom)
- **Progress Tracking**: Detailed analytics and skill-based performance metrics

## External Dependencies

### Database
- **Neon Database**: Serverless PostgreSQL database with connection pooling
- **Connection Management**: @neondatabase/serverless with WebSocket support for edge compatibility

### UI & Styling
- **Component Library**: Radix UI primitives for accessible, unstyled components
- **Styling System**: Tailwind CSS with custom design tokens and CSS variables
- **Icons**: Lucide React for consistent iconography
- **Typography**: Google Fonts integration (Architects Daughter, DM Sans, Fira Code, Geist Mono)

### Development Tools
- **Build System**: Vite with React plugin and TypeScript support
- **Type Safety**: Comprehensive TypeScript configuration with strict mode
- **Code Quality**: ESLint integration for code consistency
- **Development Environment**: Replit-specific plugins for runtime error handling and debugging

### File Processing
- **Document Parsing**: XLSX for Excel file processing, Mammoth for Word document extraction
- **File Upload**: Multer middleware with configurable storage and size limits
- **Validation**: Zod schemas for runtime type validation and data sanitization

### Third-Party Services
- **Session Storage**: connect-pg-simple for PostgreSQL session management
- **WebSocket**: ws library for real-time communication
- **Date Manipulation**: date-fns for internationalized date formatting
- **Form Handling**: React Hook Form with Zod resolvers for type-safe form validation