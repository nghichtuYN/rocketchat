import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');
  const config = new DocumentBuilder()
    .setTitle('Rocket.Chat API')
    .setDescription(
      'Danh sách tạo API mô phỏng Rocket.Chat bởi A42968-Đặng Việt Hoàng',
    )
    .setVersion('1.0')
    .addTag('Users')
    .addBearerAuth()
    .build();
  const documentBuilder = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentBuilder);
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
