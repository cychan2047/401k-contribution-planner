"use client";

import { useState, useEffect } from "react";
import { UserData } from "@/lib/db";

export function useUserData() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/user");
      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }
      const data = await response.json();
      setUserData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const updateContribution = async (
    contributionType: "PERCENT" | "FIXED",
    contributionValue: number
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch("/api/contribution", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contributionType,
          contributionValue,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update contribution");
      }

      const updatedData = await response.json();
      setUserData(updatedData);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      };
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  return {
    userData,
    loading,
    error,
    updateContribution,
    refetch: fetchUserData,
  };
}

