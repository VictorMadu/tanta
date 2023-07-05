import {
  Injectable,
  CanActivate,
  ExecutionContext,
  forwardRef,
  Inject,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { UserService } from 'src/features/user/user.service';

@Injectable()
export class IdentityAccessGuard implements CanActivate {
  constructor(private userService: UserService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest();

      const headers = request['headers'];
      const token = headers['authorization'].split(' ')?.[0] ?? null;

      console.log('TOKEN', token);

      const authorization = await this.userService.authorize({ token });

      if (authorization.isAuthorized)
        request.auth = {
          userId: authorization.userId,
        };
      else {
        throw new HttpException('', HttpStatus.FORBIDDEN);
      }
      return true;
    } catch (error) {
      console.log('ERROR', error);
      return false;
    }
  }
}
