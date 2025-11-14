import { Module } from '@nestjs/common';
import { UserController } from './Controllers/user.controller';
import { UserService } from './Services/user.service';
import { JwtModule } from '@nestjs/jwt';
import { MailModule } from '../mailer/mail.module';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'dev-secret',
      signOptions: { expiresIn: '1d' },
    }),
    MailModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
