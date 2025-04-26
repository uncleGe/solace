import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const setup = () => {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }

  const queryClient = postgres(process.env.DATABASE_URL);

  try {
    const db = drizzle(queryClient);
    return db;
  } catch (error) {
    console.error("Failed to initialize database:", error);
    throw error;
  }
};

export const db = setup();