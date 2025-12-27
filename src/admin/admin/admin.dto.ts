import { IsEmail, IsNotEmpty, MinLength, IsOptional, IsString, ValidateIf, IsArray } from 'class-validator';

export class CreateAdminDto {
  @IsNotEmpty()
  @MinLength(6)
  username: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsNotEmpty()
  confirmPassword: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  nickname?: string;

  @IsOptional()
  avatar?: string;
}

export class ValidateAdminDto {
  @IsNotEmpty()
  @MinLength(6)
  username: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;
}


export class UpdateInfoAdminDto {
  @IsNotEmpty()
  id: string

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsOptional()
  username: string;

  @IsOptional()
  @IsString()
  @ValidateIf(o => o.nickname !== '')
  @MinLength(3)
  nickname?: string;
}

export class ResetPasswordDto {
  @IsNotEmpty()
  id: string

  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsNotEmpty()
  confirmPassword: string;
}