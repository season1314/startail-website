
import { UsersModel } from '../models/users.model';

export interface IUsersQueryRepository {
    getUserInfoByEmail(email: string): Promise<UsersModel | null>;
}

