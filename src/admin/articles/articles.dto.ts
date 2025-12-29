import { IsEmail, IsNotEmpty, MinLength, IsOptional, IsString, ValidateIf, IsArray } from 'class-validator';

export class TagsDto {
    @IsOptional()
    id:string

    @IsOptional()
    type:string

    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    lang: Record<string, any>;
}