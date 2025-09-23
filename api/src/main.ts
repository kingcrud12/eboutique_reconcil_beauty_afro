import { VercelRequest, VercelResponse } from '@vercel/node';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

type RequestWithRawBody = express.Request & { rawBody?: Buffer };

let cachedServer: express.Express;

async function bootstrapServer() {
  const server = express();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

  const expressApp = app.getHttpAdapter().getInstance() as express.Express;
  expressApp.set('trust proxy', 1);

  app.setGlobalPrefix('/reconcil/api/shop');

  // Swagger (optionnel, utile pour dev)
  const config = new DocumentBuilder()
    .setTitle('Eshop API')
    .setDescription('Eshop API built for Arcenciel Manwema')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Endpoints')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/reconcil/api/shop', app, document);

  app.use(
    '/reconcil/api/shop/webhooks/stripe',
    express.json({
      verify: (req: RequestWithRawBody, _res, buf) => {
        req.rawBody = buf;
      },
    }),
  );

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false,
      skipMissingProperties: true,
    }),
  );

  app.enableCors({
    origin: [process.env.FRONTEND_URL, process.env.BACKOFFICE_URL],
    credentials: true,
  });

  await app.init();
  return server;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!cachedServer) {
    cachedServer = await bootstrapServer();
  }
  cachedServer(req, res);
}
