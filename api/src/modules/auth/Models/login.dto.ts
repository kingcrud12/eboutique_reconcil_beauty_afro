import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @IsEmail()
  @ApiProperty({
    description: 'Adresse email de l’utilisateur',
    example: 'john.doe@example.com',
  })
  email!: string;

  @IsString()
  @ApiProperty({
    description: 'Mot de passe de l’utilisateur',
    example: 'strongpassword123',
  })
  password!: string;
}
