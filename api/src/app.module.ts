import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { AdminModule } from './modules/admin/admin.module';
import { ProductModule } from './modules/product/product.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { join } from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { CartModule } from './modules/cart/cart.module';
import { PointRelaisModule } from './modules/PointRelaisModule/point-relais.module';
import { OrderModule } from './modules/order/order.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { PrestationsModule } from './modules/prestations/prestations.module';
import { ScheduleModule } from '@nestjs/schedule';
import { TrustpilotModule } from './modules/trustPilot/trustpilot.module';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        service: 'gmail',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      },
      defaults: {
        from: '"Reconcil Beauty Afro" <dipitay@gmail.com>',
      },
      template: {
        dir: join(__dirname, '..', 'src', 'templates'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    UserModule,
    AuthModule,
    AdminModule,
    ProductModule,
    CartModule,
    PointRelaisModule,
    OrderModule,
    PaymentsModule,
    PrestationsModule,
    TrustpilotModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
