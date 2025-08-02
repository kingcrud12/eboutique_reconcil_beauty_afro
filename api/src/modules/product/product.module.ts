import { Module } from '@nestjs/common';
import { ProductController } from './Controllers/product.controller';
import { ProductService } from './Services/product.service';
import { UserModule } from '../user/user.module';
import { AdminModule } from '../admin/admin.module';
import { JwtModule } from '@nestjs/jwt';
import { AdminProductController } from './Controllers/admin-product.controller';
import { CloudinaryModule } from 'src/utils/cloudinary.module';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'dev-secret',
      signOptions: { expiresIn: '1d' },
    }),
    UserModule,
    AdminModule,
    CloudinaryModule,
  ],
  controllers: [ProductController, AdminProductController],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductModule {}
