import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { IUsersQueryRepository } from '../domain/repositories/users-query.repository.interface';


@Injectable()
export class OptUserAuthService {
  constructor(
    private readonly configService: ConfigService,

    @Inject('IUsersQueryRepository')
    private readonly userQuery: IUsersQueryRepository

  ) { }

  /**
   * Get user (email)
   * @param email
   * @returns 
   */
  async userByEmail(email: string) {
    const user = await this.userQuery.getUserInfoByEmail(email)
    if (user) return { code: 0, data: user.toUserDto() }
    return { code: 0, data: null }
  }


  /**
 * Get user (id)
 * @param email
 * @returns 
 */
  async userById(id: string) {
    const user = await this.userQuery.getUserInfoById(id)
    if (user) return { code: 0, data: user.toUserDto() }
    return { code: 0, data: null }
  }



  /**
   * Create user
   * @param user 
   */
  async createUser(user: any) {
    const isUserExisted = await this.userQuery.getUserInfoByEmail(user.email)
    if (isUserExisted) { return { code: 1, messages: "This email is already registered." } }
    const result = await this.userQuery.createUser(user)
    if (result) return { code: 0, data: result.toUserDtoWithPass() }
    return { code: 1, messages: "Failed to create user" }
  }

  /**
   * Updata user
   * @param user 
   */
  async updataUser(user: any) {
    const isUserExisted = await this.userQuery.getUserInfoById(user.id)
    if (!isUserExisted) { return { code: 1, messages: "This User is not existed" } }
    const updataUserDate = isUserExisted.toUserDtoWithPass()
    user.password = user.password ? user.password : isUserExisted.password
    user.avatar = user.avatar ? user.avatar : isUserExisted.avatar
    user.nickname = user.nickname ? user.nickname : isUserExisted.nickname
    const result = await this.userQuery.updateUser(user)
  }


  /**
   * Get user with password(email)
   * @param email 
   * @returns 
   */
  async userByEmailWithPass(email: string) {
    const user = await this.userQuery.getUserInfoByEmail(email)
    if (user) return { code: 0, data: user.toUserDtoWithPass() }
    return { code: 0, data: null }
  }
}