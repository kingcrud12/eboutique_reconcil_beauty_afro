import { Injectable, InternalServerErrorException } from '@nestjs/common';
import cloudinary from '../config/cloudinary.config';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
  async uploadToCloudinary(file: Express.Multer.File): Promise<string> {
    if (!file?.buffer) {
      throw new InternalServerErrorException(
        'Le fichier est vide ou mal formaté.',
      );
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'products' },
        (error, result) => {
          if (error) {
            console.error('❌ Erreur Cloudinary :', error);
            return reject(
              new Error(`Cloudinary upload error: ${error.message}`),
            );
          }

          if (!result?.secure_url) {
            return reject(new Error('Cloudinary n’a pas renvoyé d’URL.'));
          }

          resolve(result.secure_url);
        },
      );

      Readable.from(file.buffer).pipe(uploadStream);
    });
  }
}
