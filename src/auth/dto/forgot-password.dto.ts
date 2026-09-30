import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ForgotPasswordDto {
  @IsEmail({}, { message: 'Введіть коректну електронну адресу' })
  @IsNotEmpty()
  email!: string;
}

export class ResetPasswordDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  resetCode!: string;

  @IsString()
  @MinLength(6, { message: 'Пароль має містити щонайменше 6 символів' })
  newPassword!: string;
}