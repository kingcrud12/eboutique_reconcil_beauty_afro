// src/user/dto/user.dto.ts
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IUser, IUserCreate, IUserUpdate } from '../Interfaces/user.interface';

export class CreateUserDto implements IUserCreate {
  @ApiProperty({ description: 'User first name', example: 'Yann' })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({ description: 'User last name', example: 'Dipita' })
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'User password (min 6 characters)',
    example: 'Pa$$w0rd',
  })
  @MinLength(6)
  @IsString()
  password: string;

  @ApiPropertyOptional({
    description: 'Optional delivery address',
    example: '123 rue de Paris',
  })
  @IsOptional()
  @IsString()
  adress?: string | null;
}

export class UserDto implements IUser {
  @ApiProperty()
  id!: number;

  @ApiProperty({ example: 'Yann' })
  firstName: string;

  @ApiProperty({ example: 'Dipita' })
  lastName: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiPropertyOptional({ example: '123 rue de Paris' })
  @IsOptional()
  adress?: string | null;

  @ApiPropertyOptional({ example: '0744576854' })
  @IsOptional()
  phone?: string | null;
}

export class UpdateUserDto implements IUserUpdate {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  id: number;

  @ApiPropertyOptional({ example: 'Yann' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Dipita' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ example: 'user@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 'N3wStrongP@ssw0rd' })
  @IsOptional()
  @MinLength(6)
  @IsString()
  password?: string;

  @ApiPropertyOptional({ example: '123 rue de Paris' })
  @IsOptional()
  @IsString()
  adress?: string | null;
}
