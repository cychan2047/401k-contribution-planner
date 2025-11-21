"use client";

import { useState } from "react";
import ContributionCard from "@/components/ContributionCard";
import ProjectionChart from "@/components/ProjectionChart";
import Toast, { ToastType } from "@/components/Toast";
import { useUserData } from "@/hooks/useUserData";
import { UserData } from "@/lib/db";
import { Loader2 } from "lucide-react";

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
    if (!localData) return;

    const result = await updateContribution(
      localData.contributionType,
      localData.contributionValue
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
      <main className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
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
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            401(k) Contribution Planner
          </h1>
          <p className="text-gray-600">
            Manage your contributions and project your retirement savings
          </p>
        </div>

        {/* Current Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">Current Salary</div>
            <div className="text-3xl font-bold text-gray-900">
              ${userData.salary.toLocaleString("en-US")}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">Year-to-Date Contributions</div>
            <div className="text-3xl font-bold text-blue-700">
              ${userData.ytd.toLocaleString("en-US")}
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
            <ProjectionChart userData={displayData} />
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
