import { NextResponse } from "next/server";
import { readData, writeData, UserData } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { contributionType, contributionValue } = body;

    // Validate input
    if (!contributionType || (contributionType !== "PERCENT" && contributionType !== "FIXED")) {
      return NextResponse.json(
        { error: "Invalid contributionType. Must be 'PERCENT' or 'FIXED'" },
        { status: 400 }
      );
    }

    if (typeof contributionValue !== "number" || contributionValue < 0) {
      return NextResponse.json(
        { error: "contributionValue must be a non-negative number" },
        { status: 400 }
      );
    }

    // Additional validation
    if (contributionType === "PERCENT" && contributionValue > 100) {
      return NextResponse.json(
        { error: "Percentage cannot exceed 100%" },
        { status: 400 }
      );
    }

    // Read current data
    const currentData = await readData();

    // Update with new values
    const updatedData: UserData = {
      ...currentData,
      contributionType,
      contributionValue,
    };

    // Write back to file
    await writeData(updatedData);

    return NextResponse.json(updatedData);
  } catch (error) {
    console.error("Error updating contribution:", error);
    return NextResponse.json(
      { error: "Failed to update contribution" },
      { status: 500 }
    );
  }
}

