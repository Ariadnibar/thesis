import { User } from '~/modules/users/entities/user.entity';

export interface ICurrentUser {
  user: Omit<User, 'password'>;
  session: string;
}
