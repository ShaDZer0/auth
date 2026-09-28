import { EmailField, PasswordField, StringField, StringFieldOptional } from '../../common/decorators/field.decorators.js';

export class CreateUserDto {
  @EmailField()
  email: string;

  @StringField()
  name: string;

  @PasswordField()
  password: string;
}