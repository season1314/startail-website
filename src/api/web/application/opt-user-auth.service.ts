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
}