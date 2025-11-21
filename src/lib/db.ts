import { promises as fs } from "fs";
import path from "path";

export interface UserData {
  salary: number;
  ytd: number;
  currentTotalBalance: number;
  contributionType: "PERCENT" | "FIXED";
  contributionValue: number;
  payFrequency: number;
  remainingPaychecks: number;
  ytdEmployerMatch: number;
  grossPayPerPeriod: number;
}

const DB_PATH = path.join(process.cwd(), "src/data/db.json");

/**
 * Read user data from the JSON database
 */
export async function readData(): Promise<UserData> {
  try {
    const fileContents = await fs.readFile(DB_PATH, "utf8");
    return JSON.parse(fileContents) as UserData;
  } catch (error) {
    // If file doesn't exist, return default data
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      const defaultData: UserData = {
        salary: 104000,
        ytd: 10500,
        currentTotalBalance: 58500,
        contributionType: "PERCENT",
        contributionValue: 5,
        payFrequency: 26,
        remainingPaychecks: 5,
        ytdEmployerMatch: 2000,
        grossPayPerPeriod: 4000,
      };
      // Create the file with default data
      await writeData(defaultData);
      return defaultData;
    }
    throw error;
  }
}

/**
 * Write user data to the JSON database
 */
export async function writeData(data: UserData): Promise<void> {
  try {
    // Ensure the directory exists
    const dir = path.dirname(DB_PATH);
    await fs.mkdir(dir, { recursive: true });
    
    // Write the data
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), "utf8");
  } catch (error) {
    throw new Error(`Failed to write data: ${error}`);
  }
}

