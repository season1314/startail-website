
import { UsersModel } from '../models/users.model';

export interface IUsersQueryRepository {
    getUserInfoByEmail(email: string): Promise<UsersModel | null>;
    createUser(user: UsersModel): Promise<UsersModel | null | undefined>;
    updateUser(user: UsersModel): Promise<UsersModel | null | undefined>;
    getUserInfoById(id: string): Promise<UsersModel | null>
}

