import { Module } from '@nestjs/common';
import { RoomsController } from './rooms.controller';
import { RoomsService } from './rooms.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Rooms, RoomsSchema } from './rooms.schema';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Rooms.name, schema: RoomsSchema }]),
    ConfigModule,
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads/rooms',
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
    UsersModule,
    // MessagesModule,
  ],
  exports: [MongooseModule],
  controllers: [RoomsController],
  providers: [RoomsService],
})
export class RoomsModule {}
