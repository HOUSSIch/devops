import { Injectable, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const DATABASE_URL =
  process.env.DATABASE_URL ??
  "postgresql://postgres:12345@localhost:5433/deepskyn?schema=public";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    super({
      adapter: new PrismaPg(new Pool({ connectionString: DATABASE_URL })),
    });
  }

  async onModuleInit() {
    await this.$connect();
  }
}