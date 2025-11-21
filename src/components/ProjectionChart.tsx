"use client";

import { UserData } from "@/lib/db";
import { TrendingUp, HelpCircle } from "lucide-react";
import {
  calculateProjectedYearEndUserContribution,
  calculateProjectedYearEndEmployerMatch,
  exceedsIRSLimitProjected,
  IRS_CONTRIBUTION_LIMIT,
  SECTION_415C_LIMIT,
} from "@/lib/calculations";
import { formatCurrency, formatPercentage } from "@/lib/format";

interface ProjectionChartProps {
  userData: UserData;
  currentAge: number;
  retirementAge?: number;
  annualReturn?: number;
}

export default function ProjectionChart({
  userData,
  currentAge,
  retirementAge = 65,
  annualReturn = 0.07, // 7% average annual return
}: ProjectionChartProps) {
  // Calculate projected year-end totals using time-aware logic
  const projectedUserTotal = calculateProjectedYearEndUserContribution(userData);
  const projectedEmployerMatch = calculateProjectedYearEndEmployerMatch(userData);
  // Apply Section 415(c) limit: Total (User + Employer) cannot exceed $70,000
  const projectedYearEndTotal = Math.min(
    projectedUserTotal + projectedEmployerMatch,
    SECTION_415C_LIMIT
  );
  
  // Check if projected total exceeds IRS limit
  const exceedsLimit = exceedsIRSLimitProjected(projectedUserTotal);
  
  // Calculate annualized contribution rate (for future years projection)
  // This is the standard annual rate, not the partial 2025 total
  const perPaycheckUserContribution = userData.contributionType === "PERCENT"
    ? (userData.grossPayPerPeriod * userData.contributionValue) / 100
    : userData.contributionValue;
  const annualizedUserContribution = perPaycheckUserContribution * userData.payFrequency;
  
  // Apply IRS limit to annualized rate for projection
  const annualContributionForProjection = Math.min(annualizedUserContribution, IRS_CONTRIBUTION_LIMIT);
  
  // Calculate annualized employer match based on the annualized contribution
  // This assumes the same contribution rate continues for future years
  const perPaycheckMatchCap = userData.grossPayPerPeriod * 0.04;
  const matchablePerPaycheck = Math.min(perPaycheckUserContribution, perPaycheckMatchCap);
  const annualEmployerMatchForProjection = matchablePerPaycheck * userData.payFrequency;
  
  // Apply Section 415(c) limit: Total (User + Employer) cannot exceed $70,000
  const annualTotalForProjection = Math.min(
    annualContributionForProjection + annualEmployerMatchForProjection,
    SECTION_415C_LIMIT
  );

  // Calculate years until retirement
  const yearsToRetirement = retirementAge - currentAge;

  // Calculate true current balance (includes YTD contributions and match)
  // Previous year-end balance + YTD user contributions + YTD employer match
  const previousYearBalance = userData.currentTotalBalance;
  const realCurrentBalance = previousYearBalance + userData.ytd + userData.ytdEmployerMatch;

  // Compound interest calculation with monthly contributions
  // Use realCurrentBalance as Present Value (includes YTD contributions)
  const presentValue = realCurrentBalance;
  const monthlyReturn = annualReturn / 12;
  const totalMonths = yearsToRetirement * 12;
  const monthlyContribution = annualTotalForProjection / 12;

  // Future value of present value
  const futureValueOfPV = presentValue * Math.pow(1 + annualReturn, yearsToRetirement);

  // Future value of annuity (monthly contributions)
  const futureValueOfAnnuity =
    monthlyContribution *
    ((Math.pow(1 + monthlyReturn, totalMonths) - 1) / monthlyReturn);

  const totalAtRetirement = futureValueOfPV + futureValueOfAnnuity;

  // Calculate breakdown - 4-part additive model
  // 1. Current Balance (includes previous year-end + YTD contributions + YTD match)
  const currentBalance = realCurrentBalance;
  
  // 2. Future User Contributions
  // Remaining 2025 contributions + full years 2026-2060
  const remaining2025UserContributions = projectedUserTotal - userData.ytd;
  const futureYearsUserContributions = annualContributionForProjection * (yearsToRetirement - 1);
  const totalFutureUserContributions = remaining2025UserContributions + futureYearsUserContributions;
  
  // 3. Future Employer Match
  // Remaining 2025 match + full years 2026-2060
  const remaining2025EmployerMatch = projectedEmployerMatch - userData.ytdEmployerMatch;
  const futureYearsEmployerMatch = annualEmployerMatchForProjection * (yearsToRetirement - 1);
  const totalFutureEmployerMatch = remaining2025EmployerMatch + futureYearsEmployerMatch;
  
  // 4. Estimated Market Growth (residual - whatever is left over)
  const totalGrowth = totalAtRetirement - (currentBalance + totalFutureUserContributions + totalFutureEmployerMatch);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-[#1C3F5E] p-2 rounded-lg">
          <TrendingUp className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-2xl font-semibold text-slate-800">
          Retirement Projection
        </h2>
      </div>

      <div className="space-y-4 mb-6">
        {/* Main Projection - Hero Number */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="text-sm text-slate-500 mb-2">Projected Savings at Age {retirementAge}</div>
          <div className="text-4xl font-bold text-[#1C3F5E]">
            {formatCurrency(totalAtRetirement)}
          </div>
          {exceedsLimit && (
            <div className="mt-3 text-xs text-amber-700 italic">
              * Projection based on IRS maximum ({formatCurrency(IRS_CONTRIBUTION_LIMIT)})
            </div>
          )}
        </div>

        {/* Breakdown - Equation Style */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 space-y-3">
          <div className="text-xs font-semibold text-slate-600 mb-3 uppercase tracking-wide">
            How Your Savings Grow
          </div>
          
          {/* Item 1: Current Balance */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">Current Balance</span>
              <div className="group relative">
                <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-help hover:text-slate-600 transition-colors" />
                <div className="absolute bottom-full left-0 mb-3 hidden group-hover:block z-50 pointer-events-none">
                  <div className="bg-slate-900 text-white text-sm rounded-lg p-4 shadow-xl whitespace-normal w-96">
                    <div className="font-semibold mb-3 text-base">Calculation:</div>
                    <div className="space-y-2">
                      <div className="flex items-start">
                        <span className="text-slate-300 mr-2">Previous Year-End:</span>
                        <span className="font-semibold">{formatCurrency(previousYearBalance)}</span>
                      </div>
                      <div className="flex items-start">
                        <span className="text-slate-300 mr-2">+ YTD User Contrib:</span>
                        <span className="font-semibold">{formatCurrency(userData.ytd)}</span>
                      </div>
                      <div className="flex items-start">
                        <span className="text-slate-300 mr-2">+ YTD Employer Match:</span>
                        <span className="font-semibold">{formatCurrency(userData.ytdEmployerMatch)}</span>
                      </div>
                    </div>
                    <div className="absolute top-full left-6 -mt-1">
                      <div className="border-8 border-transparent border-t-slate-900"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-lg font-semibold text-slate-900">
              {formatCurrency(currentBalance)}
            </div>
          </div>

          {/* Item 2: Future User Contributions */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-3">
            <div className="flex items-center gap-2">
              <span className="text-lg text-slate-400 mr-1">+</span>
              <span className="text-sm text-slate-600">Future Contributions</span>
              <div className="group relative">
                <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-help hover:text-slate-600 transition-colors" />
                <div className="absolute bottom-full left-0 mb-3 hidden group-hover:block z-50 pointer-events-none">
                  <div className="bg-slate-900 text-white text-sm rounded-lg p-4 shadow-xl whitespace-normal w-96">
                    <div className="font-semibold mb-3 text-base">Calculation:</div>
                    <div className="space-y-2">
                      <div className="flex items-start">
                        <span className="text-slate-300 mr-2">Remaining 2025:</span>
                        <span className="font-semibold">{formatCurrency(remaining2025UserContributions)}</span>
                      </div>
                      <div className="flex items-start">
                        <span className="text-slate-300 mr-2">+ Future Years:</span>
                        <span className="font-semibold">{formatCurrency(annualContributionForProjection)}/yr × {yearsToRetirement - 1} years</span>
                      </div>
                    </div>
                    <div className="absolute top-full left-6 -mt-1">
                      <div className="border-8 border-transparent border-t-slate-900"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-lg font-semibold text-slate-900">
              {formatCurrency(totalFutureUserContributions)}
            </div>
          </div>

          {/* Item 3: Future Employer Match */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-3">
            <div className="flex items-center gap-2">
              <span className="text-lg text-slate-400 mr-1">+</span>
              <span className="text-sm text-slate-600">Future Employer Match</span>
              <div className="group relative">
                <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-help hover:text-slate-600 transition-colors" />
                <div className="absolute bottom-full left-0 mb-3 hidden group-hover:block z-50 pointer-events-none">
                  <div className="bg-slate-900 text-white text-sm rounded-lg p-4 shadow-xl whitespace-normal w-96">
                    <div className="font-semibold mb-3 text-base">Calculation:</div>
                    <div className="space-y-2">
                      <div className="flex items-start">
                        <span className="text-slate-300 mr-2">Remaining 2025:</span>
                        <span className="font-semibold">{formatCurrency(remaining2025EmployerMatch)}</span>
                      </div>
                      <div className="flex items-start">
                        <span className="text-slate-300 mr-2">+ Future Years:</span>
                        <span className="font-semibold">{formatCurrency(annualEmployerMatchForProjection)}/yr × {yearsToRetirement - 1} years</span>
                      </div>
                    </div>
                    <div className="absolute top-full left-6 -mt-1">
                      <div className="border-8 border-transparent border-t-slate-900"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-lg font-semibold text-emerald-600">
              {formatCurrency(totalFutureEmployerMatch)}
            </div>
          </div>

          {/* Item 4: Estimated Market Growth */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-3">
            <div className="flex items-center gap-2">
              <span className="text-lg text-slate-400 mr-1">+</span>
              <span className="text-sm text-slate-600">Estimated Market Growth</span>
              <div className="group relative">
                <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-help hover:text-slate-600 transition-colors" />
                <div className="absolute bottom-full left-0 mb-3 hidden group-hover:block z-50 pointer-events-none">
                  <div className="bg-slate-900 text-white text-sm rounded-lg p-4 shadow-xl whitespace-normal w-96">
                    <div className="leading-relaxed">
                      Estimated investment returns assuming a 7% annual growth rate based on historical market performance.
                    </div>
                    <div className="absolute top-full left-6 -mt-1">
                      <div className="border-8 border-transparent border-t-slate-900"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-lg font-semibold text-emerald-600">
              {formatCurrency(totalGrowth)}
            </div>
          </div>

          {/* Equals Sign and Total */}
          <div className="flex items-center justify-between border-t-2 border-slate-300 pt-3 mt-3">
            <div className="text-sm font-semibold text-slate-700">Total at Retirement</div>
            <div className="text-xl font-bold text-[#1C3F5E]">
              {formatCurrency(totalAtRetirement)}
            </div>
          </div>
        </div>
      </div>

      {/* Market Assumption Disclaimer */}
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
        <p className="text-xs text-slate-400 italic">
          *Projection assumes a conservative 7% estimated annual return based on historical market performance. Actual returns will vary.*
        </p>
      </div>
    </div>
  );
}
