import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { IConfigsQueryRepository } from '../domain/repositories/configs-query.repository.interface';


@Injectable()
export class GetWebConfigsService {
  constructor(
    private readonly configService: ConfigService,

    @Inject('IConfigsQueryRepository')
    private readonly configQuery: IConfigsQueryRepository
  ) { }


  /**
   * Get menu(categories)
   * @param lang 
   * @returns 
   */
  async menu(lang: string = 'en') {
    const menu = await this.configQuery.getConfigItem('categories')
    return { code: 0, data: menu.toConfigDto(lang) };
  }
}