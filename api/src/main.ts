import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';
import { join } from 'path';
import './config/cloudinary.config';

type RequestWithRawBody = express.Request & { rawBody?: Buffer };

const bootstrap = async () => {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: '*',
      credentials: true,
    },
  });

  app.use(
    express.json({
      verify: (req: RequestWithRawBody, _res, buf) => {
        req.rawBody = buf;
      },
    }),
  );
  app.use(express.urlencoded({ extended: true }));

  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));
  app.setGlobalPrefix('/reconcil/api/shop');

  const config = new DocumentBuilder()
    .setTitle('Eshop API')
    .setDescription('Eshop API built for arcenciel Manwema')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/reconcil/api/shop', app, document);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false,
      skipMissingProperties: true,
    }),
  );

  app.enableCors();

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(
    `✅ Server is running: http://localhost:${port}/reconcil/api/shop`,
  );
  console.log('Template path resolved:', join(__dirname, 'templates'));
};

bootstrap().catch((err) => console.error(err));
