import { Injectable } from '@nestjs/common';

@Injectable()
export class UserService {
  async authorize({
    token,
  }: {
    token: string | null;
  }): Promise<Authorized | UnAuthorized> {
    return { userId: '1', isAuthorized: true };
  }
}

export interface Authorized {
  userId: string;
  isAuthorized: true;
}

export interface UnAuthorized {
  userId: null;
  isAuthorized: false;
}
