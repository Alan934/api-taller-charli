import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuración de CORS
  app.enableCors({
    origin: ['http://localhost:3000', 'https://front-taller-charli.vercel.app'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Obtener variables de entorno
  const nodeEnv = process.env.NODE_ENV || 'development';
  const isProduction = nodeEnv === 'production';

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('API Taller Charli')
    .setDescription('API REST para el sistema de gestión del Taller Charli. Incluye autenticación, gestión de usuarios y operaciones CRUD completas.')
    .setVersion('1.0')
    .addTag('Usuarios', 'Operaciones CRUD para gestión de usuarios')
    .addTag('Autenticación', 'Endpoints para login y registro de usuarios')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'access-token',
    )
    .addServer('http://localhost:3000', 'Servidor de desarrollo local')
    .addServer('https://api-taller-charli.vercel.app', 'Servidor de producción')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Configurar Swagger con autenticación básica en producción
  const swaggerOptions = {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customSiteTitle: 'API Taller Charli - Documentación',
    customfavIcon: '/favicon.ico',
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info .title { color: #1976d2 }
    `,
  };

  // Solo agregar autenticación HTTP básica en producción
  if (isProduction) {
    const swaggerUsername = process.env.SWAGGER_USERNAME;
    const swaggerPassword = process.env.SWAGGER_PASSWORD;

    if (!swaggerUsername || !swaggerPassword) {
      console.warn('⚠️  SWAGGER_USERNAME y SWAGGER_PASSWORD deben estar definidos en producción');
    } else {
      // Middleware de autenticación básica para Swagger
      app.use('/api/docs', (req: any, res: any, next: any) => {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Basic ')) {
          res.setHeader('WWW-Authenticate', 'Basic realm="Swagger Documentation"');
          return res.status(401).json({ message: 'Autenticación requerida para acceder a la documentación' });
        }

        const credentials = Buffer.from(authHeader.split(' ')[1], 'base64').toString('ascii');
        const [username, password] = credentials.split(':');

        if (username !== swaggerUsername || password !== swaggerPassword) {
          res.setHeader('WWW-Authenticate', 'Basic realm="Swagger Documentation"');
          return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        next();
      });
    }
  }

  SwaggerModule.setup('api/docs', app, document, swaggerOptions);

  // Mostrar información del entorno
  console.log(`🚀 Aplicación iniciada en modo: ${nodeEnv}`);
  console.log(`📚 Documentación Swagger disponible en: /api/docs`);
  if (isProduction) {
    console.log(`🔒 Swagger protegido con autenticación básica en producción`);
  }

  await app.listen(process.env.PORT || 3000);
}
void bootstrap();
