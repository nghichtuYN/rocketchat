import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getInfo(): object {
    return { version: '7.2.3', success: true };
  }
}
