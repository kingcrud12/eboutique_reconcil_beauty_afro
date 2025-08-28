import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as express from 'express';
import { join } from 'path';

type RequestWithRawBody = express.Request & { rawBody?: Buffer };

async function bootstrap() {
  // 👇 on type explicitement l'appli en NestExpressApplication
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: {
      origin: '*',
      credentials: true,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      allowedHeaders:
        'Origin, X-Requested-With, Content-Type, Accept, Authorization',
      exposedHeaders: 'Authorization, Content-Length',
      maxAge: 86400,
    },
  });

  // 👇 plus d'`any`: l'instance est bien typée Express
  app.getHttpAdapter().getInstance().set('trust proxy', 1);

  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));

  const API_PREFIX = 'reconcil/api/shop';
  app.setGlobalPrefix(API_PREFIX);

  app.use(
    `/${API_PREFIX}/webhooks/stripe`,
    express.json({
      verify: (req: RequestWithRawBody, _res, buf) => {
        req.rawBody = buf;
      },
    }),
  );
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  if (process.env.ENABLE_SWAGGER !== 'false') {
    const swaggerCfg = new DocumentBuilder()
      .setTitle('Eshop API')
      .setDescription('Eshop API built for arcenciel Manwema')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('Endpoints')
      .build();
    const document = SwaggerModule.createDocument(app, swaggerCfg);
    SwaggerModule.setup(`/${API_PREFIX}/docs`, app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
      },
      customSiteTitle: 'Eshop API Docs',
    });
  }

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
  console.log(`✅ Server: http://localhost:${port}/${API_PREFIX}`);
}
bootstrap().catch((err) => console.error(err));
