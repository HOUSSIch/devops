import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: "postgresql://postgres:12345@localhost:5433/deepskyn?schema=public",

  },
});