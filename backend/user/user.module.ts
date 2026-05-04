import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaModule } from '../core/prisma/prisma.module';
import { CloudinaryService } from '../core/cloudinary/cloudinary.service';
import { GeminiService } from '../core/ai/gemini.service';
import { KeycloakAdminService } from '../auth/keycloak-admin.service';
@Module({
  imports: [PrismaModule],
  providers: [UserService, CloudinaryService,GeminiService,KeycloakAdminService],
  controllers: [UserController]
})
export class UserModule {}
