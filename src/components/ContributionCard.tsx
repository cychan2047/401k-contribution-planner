"use client";

import { useState, useEffect } from "react";
import { UserData } from "@/lib/db";
import {
  getMaxContributionValue,
  percentToFixedAmount,
  fixedAmountToPercent,
  calculateProjectedYearEndUserContribution,
  calculateProjectedYearEndEmployerMatch,
  calculatePerPaycheckContribution,
  calculatePerPaycheckMatchCap,
  exceedsIRSLimitProjected,
  IRS_CONTRIBUTION_LIMIT,
  SECTION_415C_LIMIT,
} from "@/lib/calculations";
import { formatCurrency, formatNumber, formatPercentage } from "@/lib/format";
import { AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";

interface ContributionCardProps {
  userData: UserData;
  onUpdate: (data: UserData) => void;
  onSave: () => void;
}

export default function ContributionCard({
  userData,
  onUpdate,
  onSave,
}: ContributionCardProps) {
  // Initialize saved values from userData with smart defaults
  const getInitialPercent = () => {
    if (userData.contributionType === "PERCENT") {
      return userData.contributionValue;
    }
    // Smart default: Calculate equivalent percentage from fixed amount
    return fixedAmountToPercent(userData.contributionValue, userData.salary);
  };

  const getInitialFixed = () => {
    if (userData.contributionType === "FIXED") {
      return userData.contributionValue;
    }
    // Smart default: Calculate equivalent fixed amount from percentage
    return percentToFixedAmount(userData.contributionValue, userData.salary);
  };

  const [contributionType, setContributionType] = useState<
    "PERCENT" | "FIXED"
  >(userData.contributionType);
  
  // Separate saved states for each mode
  const [savedPercent, setSavedPercent] = useState(getInitialPercent());
  const [savedFixedAmount, setSavedFixedAmount] = useState(getInitialFixed());
  
  // Collapsible matching rule state
  const [showMatchingRule, setShowMatchingRule] = useState(false);

  // Current displayed value based on active mode
  const contributionValue = contributionType === "PERCENT" ? savedPercent : savedFixedAmount;
  const [inputValue, setInputValue] = useState(() => {
    // Initialize with the correct value based on current type
    const initialValue = userData.contributionType === "PERCENT" ? getInitialPercent() : getInitialFixed();
    // Format percentage with one decimal place
    if (userData.contributionType === "PERCENT") {
      return initialValue.toFixed(1);
    }
    return initialValue.toString();
  });

  useEffect(() => {
    // Update type and corresponding saved value when userData changes
    setContributionType(userData.contributionType);
    
    if (userData.contributionType === "PERCENT") {
      // Set the active mode value
      setSavedPercent(userData.contributionValue);
      // Smart default: Calculate equivalent fixed amount
      const equivalentFixed = percentToFixedAmount(userData.contributionValue, userData.salary, userData.payFrequency);
      setSavedFixedAmount(equivalentFixed);
      // Format percentage with one decimal place
      setInputValue(userData.contributionValue.toFixed(1));
    } else {
      // Set the active mode value
      setSavedFixedAmount(userData.contributionValue);
      // Smart default: Calculate equivalent percentage
      const equivalentPercent = fixedAmountToPercent(userData.contributionValue, userData.salary, userData.payFrequency);
      setSavedPercent(equivalentPercent);
      // Format fixed amount as whole number
      setInputValue(userData.contributionValue.toString());
    }
  }, [userData]);

  const handleTypeChange = (type: "PERCENT" | "FIXED") => {
    setContributionType(type);
    // Use the saved value for the selected mode (don't reset)
    const valueToUse = type === "PERCENT" ? savedPercent : savedFixedAmount;
    // Format percentage with one decimal place, fixed amount as whole number
    if (type === "PERCENT") {
      setInputValue(valueToUse.toFixed(1));
    } else {
      setInputValue(valueToUse.toString());
    }
    onUpdate({
      ...userData,
      contributionType: type,
      contributionValue: valueToUse,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    // Don't trigger calculations while typing - only update on blur
  };

  const handleInputBlur = () => {
    // Format on blur: round to appropriate precision
    if (inputValue === "" || isNaN(parseFloat(inputValue))) {
      // If empty or invalid, use the current saved value
      const currentValue = contributionType === "PERCENT" ? savedPercent : savedFixedAmount;
      setInputValue(currentValue.toString());
      return;
    }

    const numValue = parseFloat(inputValue);
    let formattedValue: number;
    let formattedString: string;

    if (contributionType === "PERCENT") {
      // Round to 1 decimal place for percentages
      formattedValue = Math.round(numValue * 10) / 10;
      formattedString = formattedValue.toFixed(1);
      setSavedPercent(formattedValue);
    } else {
      // Round to nearest whole dollar for fixed amounts
      formattedValue = Math.round(numValue);
      formattedString = formattedValue.toString();
      setSavedFixedAmount(formattedValue);
    }

    // Update the input display with formatted value
    setInputValue(formattedString);
    
    // Update the parent component with the formatted value
    onUpdate({
      ...userData,
      contributionType,
      contributionValue: formattedValue,
    });
  };

  const handleSliderChange = (value: number) => {
    const maxValue = getMaxContributionValue(contributionType, userData.salary, userData.payFrequency);
    // Allow slider to go up to max, but don't prevent higher values if user types them
    const finalValue = Math.min(value, maxValue);
    
    // Update the appropriate saved state based on current mode
    if (contributionType === "PERCENT") {
      setSavedPercent(finalValue);
      // Format percentage with one decimal place
      setInputValue(finalValue.toFixed(1));
    } else {
      setSavedFixedAmount(finalValue);
      setInputValue(finalValue.toString());
    }
    
    onUpdate({
      ...userData,
      contributionType,
      contributionValue: finalValue,
    });
  };

  const maxValue = getMaxContributionValue(contributionType, userData.salary, userData.payFrequency);
  const minValue = 0;
  const step = contributionType === "PERCENT" ? 0.1 : 50;

  // Calculate projected year-end totals using time-aware logic
  const currentUserData = {
    ...userData,
    contributionType,
    contributionValue,
  };
  
  // Calculate per-paycheck amounts for breakdown display
  const perPaycheckContribution = calculatePerPaycheckContribution(currentUserData);
  const perPaycheckMatchCap = calculatePerPaycheckMatchCap(currentUserData.grossPayPerPeriod);
  const matchablePerPaycheck = Math.min(perPaycheckContribution, perPaycheckMatchCap);
  
  // Calculate future contributions
  const futureUserContributions = perPaycheckContribution * currentUserData.remainingPaychecks;
  const futureEmployerMatch = matchablePerPaycheck * currentUserData.remainingPaychecks;
  
  // Calculate projected year-end totals
  const projectedUserTotal = calculateProjectedYearEndUserContribution(currentUserData);
  const projectedEmployerMatch = calculateProjectedYearEndEmployerMatch(currentUserData);
  // Apply Section 415(c) limit: Total (User + Employer) cannot exceed $70,000
  const projectedTotal = Math.min(
    projectedUserTotal + projectedEmployerMatch,
    SECTION_415C_LIMIT
  );
  
  // Check if projected total exceeds IRS limit (for warning display)
  const exceedsLimit = exceedsIRSLimitProjected(projectedUserTotal);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
      <h2 className="text-2xl font-semibold mb-6 text-slate-800">
        Contribution Settings
      </h2>

      {/* Employer Matching Rule - Collapsible (Moved to Top) */}
      <div className="mb-6">
        <button
          onClick={() => setShowMatchingRule(!showMatchingRule)}
          className="flex items-center justify-between w-full text-left"
        >
          <label className="text-sm font-medium text-slate-700">
            Employer Matching Rule
          </label>
          {showMatchingRule ? (
            <ChevronUp className="w-4 h-4 text-slate-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-500" />
          )}
        </button>
        {showMatchingRule && (
          <div className="mt-2 text-sm text-slate-600 bg-slate-50 rounded-lg p-3 border border-slate-200">
            Employer matches 100% of contributions up to 4% of gross pay ({formatCurrency(perPaycheckMatchCap)} per paycheck).
          </div>
        )}
      </div>

      {/* Toggle between PERCENT and FIXED */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-700 mb-3">
          Contribution Type
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => handleTypeChange("PERCENT")}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              contributionType === "PERCENT"
                ? "bg-[#1C3F5E] text-white shadow-sm"
                : "bg-gray-100 text-slate-700 hover:bg-gray-200"
            }`}
          >
            % of Paycheck
          </button>
          <button
            onClick={() => handleTypeChange("FIXED")}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              contributionType === "FIXED"
                ? "bg-[#1C3F5E] text-white shadow-sm"
                : "bg-gray-100 text-slate-700 hover:bg-gray-200"
            }`}
          >
            Fixed Amount
          </button>
        </div>
      </div>

      {/* Slider and Input */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-slate-700">
            {contributionType === "PERCENT"
              ? "Contribution Percentage"
              : "Amount per Paycheck"}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={inputValue}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              min={minValue}
              step={step}
              className="w-24 px-3 py-2 bg-white border border-slate-300 rounded-md text-right font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1C3F5E] focus:border-[#1C3F5E]"
            />
            <span className="text-slate-600 font-medium">
              {contributionType === "PERCENT" ? "%" : "$"}
            </span>
          </div>
        </div>

        {/* Custom Slider Styling */}
        <div className="relative">
          <div 
            className="absolute h-2 rounded-lg bg-[#1C3F5E] pointer-events-none"
            style={{
              width: `${Math.min((contributionValue / maxValue) * 100, 100)}%`,
            }}
          />
          <input
            type="range"
            min={minValue}
            max={maxValue}
            step={step}
            value={Math.min(contributionValue, maxValue)}
            onChange={(e) => handleSliderChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider relative z-10"
          />
        </div>

        <div className="flex justify-between text-xs text-slate-500 mt-1">
          <span>{contributionType === "PERCENT" ? formatPercentage(minValue) : formatNumber(minValue)}</span>
          <span className="font-medium">
            {contributionType === "PERCENT" ? formatPercentage(maxValue) : formatNumber(maxValue)}
          </span>
        </div>
      </div>

      {/* IRS Limit Warning - Soft Warning */}
      {exceedsLimit && (
        <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-800">
              This exceeds the 2025 IRS limit of {formatCurrency(IRS_CONTRIBUTION_LIMIT)}. Excess amounts may be subject to double taxation.
            </p>
          </div>
        </div>
      )}

      {/* Projected Year-End Totals Display - With Breakdown */}
      <div className="bg-slate-50 rounded-xl p-4 mb-4 space-y-4 border border-slate-200">
        {/* Section 1: User Contribution */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm text-slate-500">
            <span>Year-to-Date Contributions:</span>
            <span>{formatCurrency(userData.ytd)}</span>
          </div>
          <div className="flex justify-between items-center text-sm text-slate-500">
            <span>+ Remaining 2025 Contributions:</span>
            <span>{formatCurrency(futureUserContributions)}</span>
          </div>
          <div className="text-xs text-slate-400 ml-auto">
            {contributionType === "PERCENT" ? (
              <>({formatPercentage(contributionValue)} × {formatCurrency(userData.grossPayPerPeriod)} per paycheck × {userData.remainingPaychecks} paychecks)</>
            ) : (
              <>({formatCurrency(perPaycheckContribution)} per paycheck × {userData.remainingPaychecks} paychecks)</>
            )}
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-slate-300">
            <span className="text-sm font-semibold text-slate-700">Projected 2025 User Contribution:</span>
            <span className="text-xl font-bold text-slate-900">
              {formatCurrency(projectedUserTotal)}
            </span>
          </div>
        </div>

        {/* Section 2: Employer Match */}
        <div className="space-y-2 pt-2 border-t border-slate-200">
          <div className="flex justify-between items-center text-sm text-slate-500">
            <span>Year-to-Date Employer Match:</span>
            <span>{formatCurrency(userData.ytdEmployerMatch)}</span>
          </div>
          <div className="flex justify-between items-center text-sm text-slate-500">
            <span>+ Remaining 2025 Employer Match:</span>
            <span>{formatCurrency(futureEmployerMatch)}</span>
          </div>
          <div className="text-xs text-slate-400 ml-auto">
            ({formatCurrency(matchablePerPaycheck)} per paycheck × {userData.remainingPaychecks} paychecks)
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-slate-300">
            <span className="text-sm font-semibold text-slate-700">Projected 2025 Employer Match:</span>
            <span className="text-xl font-bold text-emerald-600">
              {formatCurrency(projectedEmployerMatch)}
            </span>
          </div>
        </div>

        {/* Section 3: Grand Total */}
        <div className="flex justify-between items-center pt-2 border-t-2 border-[#1C3F5E]">
          <span className="text-sm font-semibold text-slate-700">Total Projected 2025 Contribution:</span>
          <span className="text-2xl font-bold text-[#1C3F5E]">
            {formatCurrency(projectedTotal)}
          </span>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={onSave}
        className="w-full bg-[#1C3F5E] hover:bg-[#0F2A3F] text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-sm hover:shadow-md"
      >
        Save Contribution Settings
      </button>
    </div>
  );
}
