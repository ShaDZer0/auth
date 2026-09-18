import {EmailField, PasswordField, StringField} from '../../common/decorators/field.decoratiors.js'
export class CreateUserDto {
  @EmailField()
  email: string;
  
  @StringField()
  name: string;

  @PasswordField()
  password: string;
}
