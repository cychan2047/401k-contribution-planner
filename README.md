# 401(k) Contribution Planner

A modern, type-safe Next.js application for managing 401(k) contributions and projecting retirement savings with time-aware calculations and comprehensive financial modeling.

## Features

### Core Functionality
- **Time-Aware Projections**: Accurate year-end calculations based on remaining paychecks in the current year
- **Flexible Contribution Modes**: Toggle between percentage-based (% of paycheck) and fixed-amount contributions
- **Real-Time Calculations**: Instant updates as you adjust contribution settings
- **Comprehensive Breakdown**: Detailed breakdown showing YTD + future contributions with transparent math
- **IRS Compliance**: Automatic enforcement of IRS contribution limits ($23,500 for 2025) and Section 415(c) total limit ($70,000)
- **Employer Match Modeling**: Accurate employer match calculations (100% match up to 4% of gross pay)
- **Retirement Projections**: Compound interest calculations projecting savings to retirement age

### User Experience
- **Professional UI**: Clean, fintech-inspired design with consistent styling
- **Interactive Tooltips**: Detailed calculation breakdowns for transparency
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Toast Notifications**: Visual feedback for save operations
- **Smart Defaults**: Automatic conversion between percentage and fixed amount modes

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

1. Clone the repository:
```bash
git clone https://github.com/cychan2047/401k-contribution-planner.git
cd 401k-contribution-planner
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
401k-contribution-planner/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── user/          # GET user data endpoint
│   │   │   └── contribution/  # POST update contribution endpoint
│   │   ├── layout.tsx
│   │   ├── page.tsx           # Main application page
│   │   └── globals.css
│   ├── components/
│   │   ├── ContributionCard.tsx    # Contribution settings UI
│   │   ├── ProjectionChart.tsx     # Retirement projection display
│   │   └── Toast.tsx               # Notification component
│   ├── hooks/
│   │   └── useUserData.ts          # Custom hook for data management
│   ├── lib/
│   │   ├── calculations.ts         # Financial calculation logic
│   │   ├── db.ts                   # JSON database utilities
│   │   └── format.ts               # Number formatting utilities
│   └── data/
│       └── db.json                 # Local database file
├── package.json
└── README.md
```

## API Endpoints

### GET `/api/user`
Returns the current user data including salary, YTD contributions, contribution settings, and pay period information.

**Response:**
```json
{
  "salary": 104000,
  "ytd": 10500,
  "currentTotalBalance": 58500,
  "contributionType": "PERCENT",
  "contributionValue": 2.6,
  "payFrequency": 26,
  "remainingPaychecks": 5,
  "ytdEmployerMatch": 2000,
  "grossPayPerPeriod": 4000
}
```

### POST `/api/contribution`
Updates the contribution type and value.

**Request Body:**
```json
{
  "contributionType": "PERCENT",
  "contributionValue": 2.6
}
```

**Note:** `contributionType` must be either `"PERCENT"` or `"FIXED"`. `contributionValue` should be a number (percentage 0-100 for PERCENT mode, or dollar amount for FIXED mode).

**Response:**
Returns the updated user data object.

## Data Model

```typescript
interface UserData {
  salary: number;                    // Annual salary
  ytd: number;                       // Year-to-date user contributions
  currentTotalBalance: number;       // Previous year-end account balance
  contributionType: "PERCENT" | "FIXED";
  contributionValue: number;         // Percentage (0-100) or fixed amount per paycheck
  payFrequency: number;             // Number of pay periods per year (typically 26)
  remainingPaychecks: number;        // Remaining paychecks in current year
  ytdEmployerMatch: number;          // Year-to-date employer match
  grossPayPerPeriod: number;         // Gross pay per paycheck
}
```

## Key Features in Detail

### Time-Aware Calculations
The application uses sophisticated time-aware logic to accurately project year-end totals:
- **Projected Year-End User Contribution**: YTD + (Per-Paycheck Amount × Remaining Paychecks)
- **Projected Year-End Employer Match**: YTD Match + (Matchable Amount × Remaining Paychecks)
- **Annualized Rates**: For retirement projections, uses full annual rates (not partial year totals)

### Contribution Settings
- Toggle between percentage-based (% of paycheck) and fixed-amount contributions
- Interactive slider and number input for precise control
- Real-time calculation of projected year-end totals
- Smart conversion between modes (maintains equivalent contribution amount)
- IRS limit warnings when contributions exceed $23,500

### Retirement Projection
- **4-Part Breakdown**:
  1. Current Balance (includes YTD contributions and match)
  2. Future User Contributions (remaining 2025 + future years)
  3. Future Employer Match (remaining 2025 + future years)
  4. Estimated Market Growth (compound interest earnings)
- Compound interest calculation using 7% annual return
- Monthly contribution modeling for accuracy
- Transparent tooltips showing calculation formulas

### Financial Compliance
- **IRS Contribution Limit**: $23,500 (2025 limit) for user contributions
- **Section 415(c) Limit**: $70,000 (2025 limit) for total contributions (user + employer)
- Automatic capping in calculations
- Visual warnings for limit exceedances

### Employer Match Logic
- 100% match of user contributions
- Cap: 4% of gross pay per paycheck
- Formula: `min(userContribution, grossPayPerPeriod × 0.04)`

## Development Notes

- The database file (`src/data/db.json`) is created automatically if it doesn't exist
- Default seed data: $104,000 salary, $10,500 YTD user contributions, $2,000 YTD employer match
- The projection assumes 7% annual return and bi-weekly paychecks (26 per year)
- Current age: 30, Target retirement age: 65 (configurable)
- All calculations respect IRS limits and Section 415(c) regulations

## Code Quality

- **Type Safety**: Full TypeScript implementation with strict type checking
- **Code Organization**: Clear separation of concerns (calculations, formatting, UI)
- **Error Handling**: Comprehensive error handling in API routes and hooks
- **Performance**: Optimized calculations and efficient React rendering
- **Accessibility**: Semantic HTML and proper ARIA labels

## License

This project is created for technical assessment purposes.
