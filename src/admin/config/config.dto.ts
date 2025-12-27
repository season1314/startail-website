import { IsEmail, IsNotEmpty, MinLength, IsOptional, IsString, ValidateIf, IsIn } from 'class-validator';

export class CreatePermissionDto {
    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    url: string;

    @IsNotEmpty()
    @IsIn(['POST', 'PUT', 'DELETE', 'GET'], { message: 'Method must be one of: POST, PUT, DELETE, GET' })
    method: string

    @IsOptional()
    des?: string;
}


export class editPermissionDto {
    @IsNotEmpty()
    id: string;

    @IsNotEmpty()
    name: string;

    @IsOptional()
    des?: string;

}

export class configDto {
    @IsNotEmpty()
    name: string;

    @IsOptional()
    property: any

    @IsNotEmpty()
    key: string
}