import { NextResponse } from "next/server";
import { readData } from "@/lib/db";

export async function GET() {
  try {
    const data = await readData();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error reading user data:", error);
    return NextResponse.json(
      { error: "Failed to read user data" },
      { status: 500 }
    );
  }
}

