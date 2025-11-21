"use client";

import { useState, useEffect } from "react";
import { UserData } from "@/lib/db";

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
  const [contributionType, setContributionType] = useState<
    "PERCENT" | "FIXED"
  >(userData.contributionType);
  const [contributionValue, setContributionValue] = useState(
    userData.contributionValue
  );

  useEffect(() => {
    setContributionType(userData.contributionType);
    setContributionValue(userData.contributionValue);
  }, [userData]);

  const handleTypeChange = (type: "PERCENT" | "FIXED") => {
    setContributionType(type);
    // Reset value when switching types
    const newValue = type === "PERCENT" ? 5 : 500;
    setContributionValue(newValue);
    onUpdate({
      ...userData,
      contributionType: type,
      contributionValue: newValue,
    });
  };

  const handleValueChange = (value: number) => {
    setContributionValue(value);
    onUpdate({
      ...userData,
      contributionType,
      contributionValue: value,
    });
  };

  const maxValue = contributionType === "PERCENT" ? 100 : 50000;
  const minValue = 0;
  const step = contributionType === "PERCENT" ? 0.1 : 50;

  const annualContribution =
    contributionType === "PERCENT"
      ? (userData.salary * contributionValue) / 100
      : contributionValue * 26; // Assuming bi-weekly paychecks (26 per year)

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
      <h2 className="text-2xl font-semibold mb-6 text-gray-900">
        Contribution Settings
      </h2>

      {/* Toggle between PERCENT and FIXED */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Contribution Type
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => handleTypeChange("PERCENT")}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              contributionType === "PERCENT"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            % of Paycheck
          </button>
          <button
            onClick={() => handleTypeChange("FIXED")}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              contributionType === "FIXED"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Fixed Amount
          </button>
        </div>
      </div>

      {/* Slider and Input */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-gray-700">
            {contributionType === "PERCENT"
              ? "Contribution Percentage"
              : "Amount per Paycheck"}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={contributionValue}
              onChange={(e) =>
                handleValueChange(parseFloat(e.target.value) || 0)
              }
              min={minValue}
              max={maxValue}
              step={step}
              className="w-24 px-3 py-2 border border-gray-300 rounded-md text-right font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-gray-600 font-medium">
              {contributionType === "PERCENT" ? "%" : "$"}
            </span>
          </div>
        </div>

        <input
          type="range"
          min={minValue}
          max={maxValue}
          step={step}
          value={contributionValue}
          onChange={(e) => handleValueChange(parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />

        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{minValue}</span>
          <span>{maxValue}</span>
        </div>
      </div>

      {/* Annual Contribution Display */}
      <div className="bg-blue-50 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Estimated Annual Contribution</span>
          <span className="text-2xl font-bold text-blue-700">
            ${annualContribution.toLocaleString("en-US", {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
          </span>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={onSave}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-md hover:shadow-lg"
      >
        Save Contribution Settings
      </button>
    </div>
  );
}

