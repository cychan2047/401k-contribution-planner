"use client";

import { useState } from "react";
import ContributionCard from "@/components/ContributionCard";
import ProjectionChart from "@/components/ProjectionChart";
import Toast, { ToastType } from "@/components/Toast";
import { useUserData } from "@/hooks/useUserData";
import { UserData } from "@/lib/db";
import { formatCurrency } from "@/lib/format";
import { Loader2 } from "lucide-react";

// Default current age and retirement age - can be made configurable later
const DEFAULT_CURRENT_AGE = 30;
const DEFAULT_RETIREMENT_AGE = 65;

export default function Home() {
  const { userData, loading, updateContribution } = useUserData();
  const [localData, setLocalData] = useState<UserData | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: ToastType;
  } | null>(null);

  const handleUpdate = (data: UserData) => {
    setLocalData(data);
  };

  const handleSave = async () => {
    // Use localData if available, otherwise use current userData
    const dataToSave = localData || userData;
    if (!dataToSave) return;

    const result = await updateContribution(
      dataToSave.contributionType,
      dataToSave.contributionValue
    );

    if (result.success) {
      setToast({
        message: "Contribution settings saved successfully!",
        type: "success",
      });
      setLocalData(null);
    } else {
      setToast({
        message: result.error || "Failed to save contribution settings",
        type: "error",
      });
    }
  };

  const displayData = localData || userData;

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 p-4 sm:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-[#1C3F5E]" />
            <p className="text-sm text-slate-600">Loading your retirement data...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!userData) {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-800">Failed to load user data</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header with Logo */}
        <div className="mb-6 sm:mb-8">
          <div className="text-2xl sm:text-3xl font-bold text-[#1C3F5E] mb-2">
            401(k) Contribution Planner
          </div>
          <p className="text-sm sm:text-base text-slate-600">
            Manage your contributions and project your retirement savings
          </p>
        </div>

        {/* Current Status Cards - 2 Rows x 4 Columns */}
        <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-8">
          {/* Row 1 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-slate-200">
              <div className="text-xs sm:text-sm text-slate-500 mb-1">YTD User Contribution</div>
              <div className="text-2xl sm:text-3xl font-bold text-slate-900">
                {formatCurrency(userData.ytd)}
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-slate-200">
              <div className="text-xs sm:text-sm text-slate-500 mb-1">Current Age</div>
              <div className="text-2xl sm:text-3xl font-bold text-slate-900">
                {DEFAULT_CURRENT_AGE} years
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-slate-200">
              <div className="text-xs sm:text-sm text-slate-500 mb-1">Pay Frequency</div>
              <div className="text-2xl sm:text-3xl font-bold text-slate-900">
                Bi-weekly
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-slate-200">
              <div className="text-xs sm:text-sm text-slate-500 mb-1">Previous Year-End Balance</div>
              <div className="text-2xl sm:text-3xl font-bold text-slate-900">
                {formatCurrency(userData.currentTotalBalance)}
              </div>
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-slate-200">
              <div className="text-xs sm:text-sm text-slate-500 mb-1">YTD Employer Match</div>
              <div className="text-2xl sm:text-3xl font-bold text-slate-900">
                {formatCurrency(userData.ytdEmployerMatch)}
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-slate-200">
              <div className="text-xs sm:text-sm text-slate-500 mb-1">Target Retirement Age</div>
              <div className="text-2xl sm:text-3xl font-bold text-slate-900">
                {DEFAULT_RETIREMENT_AGE} years
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-slate-200">
              <div className="text-xs sm:text-sm text-slate-500 mb-1">Remaining Paychecks in 2025</div>
              <div className="text-2xl sm:text-3xl font-bold text-slate-900">
                {userData.remainingPaychecks}
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-slate-200">
              <div className="text-xs sm:text-sm text-slate-500 mb-1">Gross Pay per Check</div>
              <div className="text-2xl sm:text-3xl font-bold text-slate-900">
                {formatCurrency(userData.grossPayPerPeriod)}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Contribution Card */}
          <div>
            <ContributionCard
              userData={displayData}
              onUpdate={handleUpdate}
              onSave={handleSave}
            />
          </div>

          {/* Projection Chart */}
          <div>
            <ProjectionChart userData={displayData} currentAge={DEFAULT_CURRENT_AGE} retirementAge={DEFAULT_RETIREMENT_AGE} />
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </main>
  );
}
