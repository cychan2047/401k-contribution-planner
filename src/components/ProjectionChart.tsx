"use client";

import { UserData } from "@/lib/db";
import { TrendingUp } from "lucide-react";

interface ProjectionChartProps {
  userData: UserData;
  currentAge?: number;
  retirementAge?: number;
  annualReturn?: number;
}

export default function ProjectionChart({
  userData,
  currentAge = 30,
  retirementAge = 65,
  annualReturn = 0.07, // 7% average annual return
}: ProjectionChartProps) {
  // Calculate annual contribution
  const annualContribution =
    userData.contributionType === "PERCENT"
      ? (userData.salary * userData.contributionValue) / 100
      : userData.contributionValue * 26; // Assuming bi-weekly paychecks

  // Calculate years until retirement
  const yearsToRetirement = retirementAge - currentAge;

  // Compound interest calculation: FV = PV(1+r)^n + PMT[((1+r)^n - 1)/r]
  // Where:
  // PV = Present Value (current YTD)
  // PMT = Annual Payment (annual contribution)
  // r = Annual return rate
  // n = Number of years

  const presentValue = userData.ytd;
  const monthlyReturn = annualReturn / 12;
  const totalMonths = yearsToRetirement * 12;
  const monthlyContribution = annualContribution / 12;

  // Future value of present value
  const futureValueOfPV = presentValue * Math.pow(1 + annualReturn, yearsToRetirement);

  // Future value of annuity (monthly contributions)
  const futureValueOfAnnuity =
    monthlyContribution *
    ((Math.pow(1 + monthlyReturn, totalMonths) - 1) / monthlyReturn);

  const totalAtRetirement = futureValueOfPV + futureValueOfAnnuity;

  // Calculate total contributions over time
  const totalContributions = presentValue + annualContribution * yearsToRetirement;

  // Calculate growth (earnings)
  const totalGrowth = totalAtRetirement - totalContributions;

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-lg p-6 border border-blue-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-600 p-2 rounded-lg">
          <TrendingUp className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-900">
          Retirement Projection
        </h2>
      </div>

      <div className="space-y-4 mb-6">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="text-sm text-gray-600 mb-1">Projected Savings at Age {retirementAge}</div>
          <div className="text-3xl font-bold text-blue-700">
            {formatCurrency(totalAtRetirement)}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-xs text-gray-600 mb-1">Total Contributions</div>
            <div className="text-xl font-semibold text-gray-900">
              {formatCurrency(totalContributions)}
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-xs text-gray-600 mb-1">Estimated Growth</div>
            <div className="text-xl font-semibold text-green-600">
              {formatCurrency(totalGrowth)}
            </div>
          </div>
        </div>
      </div>

      {/* Assumptions */}
      <div className="bg-white/60 rounded-lg p-4 text-xs text-gray-600">
        <div className="font-semibold mb-2">Assumptions:</div>
        <ul className="space-y-1">
          <li>• Current age: {currentAge} years</li>
          <li>• Retirement age: {retirementAge} years</li>
          <li>• Annual return: {(annualReturn * 100).toFixed(1)}%</li>
          <li>• Annual contribution: {formatCurrency(annualContribution)}</li>
        </ul>
      </div>
    </div>
  );
}

