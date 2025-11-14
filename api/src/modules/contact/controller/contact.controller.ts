import { Body, Controller, Post, BadRequestException } from '@nestjs/common';
import { ContactService } from '../service/contact.service';
import { IsEmail, IsNotEmpty, MaxLength } from 'class-validator';

class ContactDto {
  @IsNotEmpty() name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MaxLength(2000)
  message: string;
}

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  async sendMessage(@Body() dto: ContactDto) {
    // validation basique (si tu utilises ValidationPipe global, cette classe sert au typage/validation)
    if (!dto || !dto.name || !dto.email || !dto.message) {
      throw new BadRequestException('Missing contact fields');
    }
    return this.contactService.sendContactMessage(
      dto.name,
      dto.email,
      dto.message,
    );
  }
}
