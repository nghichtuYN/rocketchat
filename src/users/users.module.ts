import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UsersSchema } from './users.schema';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UsersSchema }]),
    ConfigModule,
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads/avatar',
        filename: (req, file, cb) => {
          const filename = `${Date.now()}-${file.originalname}`;
          cb(null, filename);
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
      fileFilter: (req, file, cb) => {
        const fileSize = parseInt(req.headers['content-length']);
        if (fileSize > 1024 * 1024 * 5) {
          req.fileValidationError = 'Kích thước hình ảnh quá lớn, file < 5MB ';
          cb(null, false);
        }
        const ext = extname(file.originalname).toLowerCase();
        if (!['.jpg', '.jpeg', '.png'].includes(ext)) {
          return cb(new Error('Invalid file type'), false); // Reject invalid file types
        }
        cb(null, true);
      },
    }),
  ],
  exports: [MongooseModule],
  providers: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
