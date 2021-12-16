import { Injectable } from '@nestjs/common';
import { User, UserModel } from './users.schema';
import { hashSync, genSaltSync, compareSync } from 'bcryptjs';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) public users: UserModel) {}

  checkPw(user: User, password: string) {
    return compareSync(password, user.providerId);
  }

  hashPw(password: string) {
    return hashSync(password, genSaltSync(12));
  }
}
