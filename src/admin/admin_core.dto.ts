import { IsOptional, IsInt, Min,IsString} from 'class-validator';
import { Type } from 'class-transformer';

export class GetListDto{
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  entries: number = 20;

  @IsOptional()
  keyword?: string;

  @IsOptional()
  @IsString()
  type?: string;
}