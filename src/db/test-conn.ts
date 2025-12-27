import { db } from "./index";
import { vocabulary } from "./schema";
import { count } from "drizzle-orm";

async function main() {
  try {
    console.log("Testing database connection...");
    const result = await db.select({ count: count() }).from(vocabulary);
    console.log("Connection successful!");
    console.log("Vocabulary count:", result[0].count);
    process.exit(0);
  } catch (error) {
    console.error("Connection failed:", error);
    process.exit(1);
  }
}

main();
