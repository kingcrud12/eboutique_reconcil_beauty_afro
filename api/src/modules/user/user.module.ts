import { Module } from '@nestjs/common';
import { UserController } from './Controllers/user.controller';
import { UserService } from './Services/user.service';
import { Mailer } from '../mailer/mailer.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [Mailer, AuthModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
