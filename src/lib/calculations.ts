import { UserData } from "./db";

// IRS 2025 401(k) contribution limit
export const IRS_CONTRIBUTION_LIMIT = 23500;

// IRS Section 415(c) total annual contribution limit (User + Employer combined)
export const SECTION_415C_LIMIT = 70000; // 2025 limit

// Employer match: 100% of contributions up to 4% of salary
export const EMPLOYER_MATCH_RATE = 0.04; // 4% of salary
export const EMPLOYER_MATCH_MULTIPLIER = 1.0; // 100% match

/**
 * Calculate annual contribution based on user data
 */
export function calculateAnnualContribution(userData: UserData): number {
  if (userData.contributionType === "PERCENT") {
    return (userData.salary * userData.contributionValue) / 100;
  } else {
    // Fixed amount per paycheck, multiplied by pay frequency
    return userData.contributionValue * userData.payFrequency;
  }
}

/**
 * Apply IRS contribution limit cap
 */
export function applyIRSLimit(
  annualContribution: number
): { capped: number; isCapped: boolean } {
  if (annualContribution > IRS_CONTRIBUTION_LIMIT) {
    return {
      capped: IRS_CONTRIBUTION_LIMIT,
      isCapped: true,
    };
  }
  return {
    capped: annualContribution,
    isCapped: false,
  };
}

/**
 * Calculate employer match amount
 * Rule: 100% match up to 4% of salary
 */
export function calculateEmployerMatch(
  userContribution: number,
  salary: number
): number {
  const maxMatchableContribution = salary * EMPLOYER_MATCH_RATE;
  const matchableAmount = Math.min(userContribution, maxMatchableContribution);
  return matchableAmount * EMPLOYER_MATCH_MULTIPLIER;
}

/**
 * Get maximum allowed contribution value for UI slider/input
 * Allows values above IRS limit for educational/simulation purposes
 */
export function getMaxContributionValue(
  contributionType: "PERCENT" | "FIXED",
  salary: number,
  payFrequency: number = 26
): number {
  if (contributionType === "PERCENT") {
    // Allow up to 100% for simulation purposes
    return 100;
  } else {
    // Allow up to salary/payFrequency (full paycheck) for simulation purposes
    return Math.floor(salary / payFrequency);
  }
}

/**
 * Check if annual contribution exceeds IRS limit (for warning display)
 */
export function exceedsIRSLimit(annualContribution: number): boolean {
  return annualContribution > IRS_CONTRIBUTION_LIMIT;
}

/**
 * Calculate equivalent fixed amount from percentage
 * Used for smart defaults when switching modes
 */
export function percentToFixedAmount(percent: number, salary: number, payFrequency: number = 26): number {
  const annualContribution = (salary * percent) / 100;
  return Math.round(annualContribution / payFrequency); // Round to nearest dollar
}

/**
 * Calculate equivalent percentage from fixed amount
 * Used for smart defaults when switching modes
 */
export function fixedAmountToPercent(fixedAmount: number, salary: number, payFrequency: number = 26): number {
  const annualContribution = fixedAmount * payFrequency;
  return Math.round((annualContribution / salary) * 100 * 10) / 10; // Round to 1 decimal place
}

/**
 * Calculate per-paycheck contribution amount
 */
export function calculatePerPaycheckContribution(
  userData: UserData
): number {
  if (userData.contributionType === "PERCENT") {
    return (userData.grossPayPerPeriod * userData.contributionValue) / 100;
  } else {
    return userData.contributionValue;
  }
}

/**
 * Calculate projected year-end total user contribution
 * Formula: YTD + (Per-Paycheck Amount * Remaining Paychecks)
 */
export function calculateProjectedYearEndUserContribution(
  userData: UserData
): number {
  const perPaycheckAmount = calculatePerPaycheckContribution(userData);
  const futureContributions = perPaycheckAmount * userData.remainingPaychecks;
  return userData.ytd + futureContributions;
}

/**
 * Calculate per-paycheck employer match cap
 * Formula: grossPayPerPeriod * 0.04
 */
export function calculatePerPaycheckMatchCap(
  grossPayPerPeriod: number
): number {
  return grossPayPerPeriod * EMPLOYER_MATCH_RATE;
}

/**
 * Calculate projected year-end employer match
 * Formula: YTD Match + (Min(UserAmount, MatchCap) * remainingPaychecks)
 */
export function calculateProjectedYearEndEmployerMatch(
  userData: UserData
): number {
  const perPaycheckUserContribution = calculatePerPaycheckContribution(userData);
  const perPaycheckMatchCap = calculatePerPaycheckMatchCap(
    userData.grossPayPerPeriod
  );
  const matchablePerPaycheck = Math.min(
    perPaycheckUserContribution,
    perPaycheckMatchCap
  );
  const futureMatch = matchablePerPaycheck * userData.remainingPaychecks;
  return userData.ytdEmployerMatch + futureMatch;
}

/**
 * Check if projected year-end contribution exceeds IRS limit
 */
export function exceedsIRSLimitProjected(
  projectedTotal: number
): boolean {
  return projectedTotal > IRS_CONTRIBUTION_LIMIT;
}

