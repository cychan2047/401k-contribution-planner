# 401(k) Contribution Planner

A modern, type-safe Next.js application for managing 401(k) contributions and projecting retirement savings.

## Features

- **Visualization**: Display current salary and year-to-date contributions
- **Flexible Controls**: Toggle between percentage-based and fixed-amount contributions
- **Real-time Projections**: Calculate retirement savings at age 65 with compound interest
- **Persistent Storage**: Save settings to local JSON database
- **Professional UI**: Clean, fintech-inspired design with smooth interactions

## Tech Stack

- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Database**: Local JSON file (`src/data/db.json`)
- **State Management**: React Hooks

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
401kPlanner/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── user/          # GET user data
│   │   │   └── contribution/  # POST update contribution
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ContributionCard.tsx
│   │   ├── ProjectionChart.tsx
│   │   └── Toast.tsx
│   ├── hooks/
│   │   └── useUserData.ts
│   ├── lib/
│   │   └── db.ts              # JSON database utilities
│   └── data/
│       └── db.json            # Local database file
├── package.json
└── README.md
```

## API Endpoints

### GET `/api/user`
Returns the current user data including salary, YTD contributions, and contribution settings.

### POST `/api/contribution`
Updates the contribution type and value.

**Request Body:**
```json
{
  "contributionType": "PERCENT" | "FIXED",
  "contributionValue": number
}
```

**Response:**
Returns the updated user data object.

## Data Model

```typescript
interface UserData {
  salary: number;
  ytd: number;
  contributionType: "PERCENT" | "FIXED";
  contributionValue: number;
}
```

## Features in Detail

### Contribution Settings
- Toggle between percentage-based (% of paycheck) and fixed-amount contributions
- Interactive slider and number input for precise control
- Real-time calculation of estimated annual contribution

### Retirement Projection
- Calculates projected savings at age 65 using compound interest
- Shows total contributions vs. estimated growth
- Displays key assumptions (age, return rate, contribution amount)

### Visual Feedback
- Toast notifications for successful saves and errors
- Smooth animations and transitions
- Professional fintech-inspired design

## Development Notes

- The database file (`src/data/db.json`) is created automatically if it doesn't exist
- Default seed data includes: $120,000 salary, $10,500 YTD, 5% contribution
- The projection assumes 7% annual return and bi-weekly paychecks (26 per year)

## License

This project is created for technical assessment purposes.

