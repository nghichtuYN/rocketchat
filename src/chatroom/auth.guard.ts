import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Socket } from 'socket.io';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient<Socket>();
    const token = this.extractTokenFromSocket(client);
    console.log(this.configService.get<string>('SECRET'));
    if (!token) {
      throw new UnauthorizedException('Missing token');
    }
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('SECRET'),
      });
      client['user'] = {
        _id: payload?._id,
        email: payload?.email,
        role: payload?.role,
      };
    } catch (error) {
      throw new HttpException({ status: 419, message: 'Token expired' }, 419);
    }
    return true;
  }

  private extractTokenFromSocket(client: Socket): string | undefined {
    const authHeader = client.handshake.headers.authorization;
    const [type, token] = authHeader ? authHeader.split(' ') : [];
    return type === 'Bearer' ? token : undefined;
  }
}
