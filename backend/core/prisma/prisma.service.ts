import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    // Configuration pour Railway (avec SSL obligatoire)
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      throw new Error("DATABASE_URL is not defined in environment variables");
    }
    
    // Ajouter ?sslmode=require si pas déjà présent (OBLIGATOIRE pour Railway PostgreSQL)
    let sslUrl = databaseUrl;
    if (!databaseUrl.includes('sslmode=require') && !databaseUrl.includes('sslmode=verify')) {
      const separator = databaseUrl.includes('?') ? '&' : '?';
      sslUrl = `${databaseUrl}${separator}sslmode=require`;
    }
    
    console.log(`📦 Connecting to database with SSL enabled`);
    
    const pool = new Pool({ 
      connectionString: sslUrl,
      ssl: {
        rejectUnauthorized: false // Nécessaire pour Railway PostgreSQL
      }
    });
    
    const adapter = new PrismaPg(pool);
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
    console.log('✅ Prisma connected to PostgreSQL database');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log('🔌 Prisma disconnected from database');
  }
}
