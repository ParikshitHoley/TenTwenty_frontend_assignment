# Ticktock - Timesheet Management SaaS

A modern timesheet management application built with Next.js, NextAuth, SQLite, and Tailwind CSS.

## Features

✅ **Authentication** - Secure login with NextAuth.js credentials provider
✅ **Dashboard** - Weekly timesheet overview with advanced filtering and sorting
✅ **Timesheet Entries** - Add, edit, and delete daily timesheet entries
✅ **Progress Tracking** - Visual progress bar showing weekly hour completion
✅ **Data Validation** - Maximum 40 hours per week enforcement
✅ **Responsive Design** - Mobile-friendly UI with Tailwind CSS
✅ **Toast Notifications** - User-friendly feedback for actions
✅ **React Table** - Advanced data table with pagination and sorting

## Tech Stack

- **Frontend**: Next.js 14+ with App Router
- **UI Framework**: React with Tailwind CSS
- **Authentication**: NextAuth.js with Credentials Provider
- **Database**: SQLite with better-sqlite3
- **Data Table**: TanStack React Table (React Table v8)
- **Language**: TypeScript

## Project Structure

```
├── app/
│   ├── api/                    # API routes
│   │   ├── auth/[...nextauth]/ # NextAuth route
│   │   ├── weeks/              # Weeks API endpoints
│   │   └── timesheet/          # Timesheet entries API
│   ├── dashboard/
│   │   ├── page.tsx            # Dashboard main page
│   │   └── [weekId]/
│   │       └── page.tsx        # Week details page
│   ├── login/
│   │   └── page.tsx            # Login page
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Root redirect
│   └── globals.css             # Global styles
├── components/                 # Reusable React components
│   ├── Modal.tsx              # Modal wrapper component
│   ├── EntryModal.tsx         # Entry form modal
│   └── Toast.tsx              # Toast notification system
├── lib/
│   ├── auth.ts                # NextAuth configuration
│   ├── db.ts                  # Database connection utility
│   └── types.ts               # TypeScript type definitions
├── scripts/
│   └── initDb.js              # Database initialization script
├── data/
│   └── timesheet.db           # SQLite database (created on init)
├── .env.local                 # Environment variables
├── tailwind.config.ts         # Tailwind configuration
├── postcss.config.js          # PostCSS configuration
├── middleware.ts              # Route protection middleware
└── package.json               # Dependencies

```

## Database Schema

### weeks table

- `id` - Primary key
- `week_number` - Week number in the year
- `start_date` - Week start date
- `end_date` - Week end date
- `status` - 'Completed', 'Incomplete', or 'Missing'
- `total_hours` - Total hours logged in the week
- `user_id` - User reference

### timesheet_entries table

- `id` - Primary key
- `week_id` - Foreign key to weeks table
- `date` - Entry date
- `project_name` - Project name
- `type_of_work` - Work type (Development, Testing, etc.)
- `description` - Optional description
- `hours` - Hours worked

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Install dependencies:

```bash
npm install
```

2. Initialize the database:

```bash
npm run db:init
```

3. Create `.env.local` file (already created with defaults):

```
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
```

4. Start the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Demo Credentials

- **Email**: admin@gmail.com
- **Password**: admin

These credentials are pre-filled in the login form for easy testing.

## API Endpoints

### Authentication

- `POST /api/auth/callback/credentials` - Login

### Weeks

- `GET /api/weeks` - Get all weeks (with optional filters)
- `POST /api/weeks` - Create a new week
- `GET /api/weeks/[id]` - Get week details with entries
- `PUT /api/weeks/[id]` - Update week status and hours

### Timesheet Entries

- `GET /api/timesheet` - Get entries for a week
- `POST /api/timesheet` - Create new entry
- `GET /api/timesheet/[id]` - Get single entry
- `PUT /api/timesheet/[id]` - Update entry
- `DELETE /api/timesheet/[id]` - Delete entry

## Features in Detail

### Dashboard

- Displays all weeks in a data table
- Sort by clicking column headers
- Filter by date range and status
- Pagination (10 items per page)
- Action buttons to View/Update/Create depending on week status

### Week Details

- Shows week date range (e.g., "21 - 26 Jan 2026")
- Visual progress bar toward 40-hour goal
- Grouped daily entries view
- Add, edit, or delete entries per day
- Real-time validation and feedback

### Entry Management

- Select project from dropdown
- Choose work type (Development, Testing, Documentation, Meeting, Support, Other)
- Add optional description
- Increment/decrement hours with +/- buttons
- Automatic weekly hour limit enforcement (max 40 hours)

### Status Logic

- **Completed**: 40 hours logged
- **Incomplete**: Between 0 and 39 hours logged
- **Missing**: 0 hours logged

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:init` - Initialize database with seed data

## Production Considerations

For production deployment:

1. Change `NEXTAUTH_SECRET` to a strong random value
2. Update `NEXTAUTH_URL` to your production domain
3. Implement proper password hashing (currently using plain text for demo)
4. Set up proper environment variables
5. Configure database backups
6. Enable HTTPS
7. Consider adding real user management

## License

MIT

## Support

For issues or questions, please check the project structure and ensure:

- Database is properly initialized (`data/timesheet.db` exists)
- All dependencies are installed (`node_modules` folder)
- Environment variables are set in `.env.local`
- Port 3000 is available for the development server
