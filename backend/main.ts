import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
    
    // Configuration CORS pour PRODUCTION (Railway + Vercel)
    app.enableCors({
      origin: [
        'http://localhost:5173',           // Développement local
        'http://localhost:3000',           // Développement local
        'https://devops-jromy2oz4-houssichs-projects.vercel.app', // Votre frontend Vercel
        'https://keycloak-production-7ec8.up.railway.app'         // Keycloak Railway
      ],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      exposedHeaders: ['Content-Range', 'X-Total-Count'],
      credentials: true,
      preflightContinue: false,
      optionsSuccessStatus: 204,
    });
    
    // ⚠️ CRUCIAL: Railway utilise PORT, et il faut bind sur 0.0.0.0
    const port = process.env.PORT || 3000;
    await app.listen(port, '0.0.0.0'); // '0.0.0.0' est OBLIGATOIRE pour Railway
    
    console.log('✅ Backend démarré avec succès');
    console.log(`📡 Port: ${port}`);
    console.log(`🌐 Environnement: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔓 CORS activé pour les origines autorisées`);
    
  } catch (error) {
    console.error('❌ Erreur au démarrage:', error);
    process.exit(1);
  }
}

bootstrap();
