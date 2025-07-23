import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

const PORT: number = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

const bootstrap = async () => {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('shop');

  const config = new DocumentBuilder()
    .setTitle('Your API')
    .setDescription('Your API description')
    .setVersion('1.0')
    .addBearerAuth() // si tu utilises JWT Bearer
    .addTag('Projects')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/shop', app, document);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false,
      skipMissingProperties: true,
    }),
  );

  app.enableCors();
  await app.listen(PORT);
};

bootstrap()
  .then(() => console.log(`Server is running: http://localhost:${PORT}/shop`))

  .catch((err) => console.error(err));
