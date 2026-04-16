import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

export * from "@prisma/client";

const { Pool } = pg;

let prismaInstance: PrismaClient | null = null;

function getPrisma() {
  if (!prismaInstance) {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error("DATABASE_URL is not defined in environment variables");
    }

    const pool = new Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false,
      },
      // Important for Prisma compatibility: enforce IPv4 or IPv6 explicitly if needed,
      // but standard connection usually works if the URL is correct.
    });

    const adapter = new PrismaPg(pool);

    prismaInstance = new PrismaClient({
      adapter,
      log: ["error", "warn"],
    });
  }
  return prismaInstance;
}

// Export a proxy to maintain the external API while ensuring lazy initialization
export const prisma = new Proxy({} as PrismaClient, {
  get(target, prop) {
    const instance = getPrisma();
    const value = (instance as any)[prop];
    return typeof value === "function" ? value.bind(instance) : value;
  },
});
