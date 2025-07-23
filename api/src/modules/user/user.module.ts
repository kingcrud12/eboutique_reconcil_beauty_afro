import { Module } from '@nestjs/common';
import { UserController } from './Controllers/user.controller';
import { UserService } from './Services/user.service';

@Module({
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
