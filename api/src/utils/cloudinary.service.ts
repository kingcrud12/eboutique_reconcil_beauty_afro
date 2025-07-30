import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import toStream from 'buffer-to-stream';
import { Express } from 'express';

export const uploadToCloudinary = (
  file: Express.Multer.File, // ✅ Typage du fichier
  folder = 'uploads',
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) {
          return reject(new Error('Cloudinary upload failed')); // ✅ Utilise Error pour reject
        }

        return resolve(result);
      },
    );

    // ✅ file est bien typé, donc on peut utiliser .buffer sans souci
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    toStream(file.buffer).pipe(uploadStream);
  });
};
