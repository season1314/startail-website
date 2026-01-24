import { IsEmail, IsNotEmpty, MinLength, IsOptional, IsString, ValidateIf, IsArray, MaxLength } from 'class-validator';

export class sendMailDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsOptional()
    type: string
}


export class userRegDto {
    @IsNotEmpty()
    code: string;

    @IsNotEmpty()
    @MinLength(6)
    @MaxLength(20)
    password: string;

    @IsNotEmpty()
    @MinLength(6)
    @MaxLength(20)
    confirmPassword: string;

    @IsNotEmpty()
    @MinLength(4)
    @MaxLength(20)
    nickname: string
}

export class userResetPwd {
    @IsNotEmpty()
    code: string;

    @IsNotEmpty()
    @MinLength(6)
    @MaxLength(20)
    password: string;

    @IsNotEmpty()
    @MinLength(6)
    @MaxLength(20)
    confirmPassword: string;
}

export class userLoginDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsNotEmpty()
    password: string
}

export class updateUserDto {
    @IsNotEmpty()
    @MinLength(4)
    @MaxLength(20)
    nickname: string;

    @IsOptional()
    avatar:string
}
