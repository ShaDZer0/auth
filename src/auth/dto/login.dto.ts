import{ EmailField, StringField,} from '../../common/decorators/field.decorators.js'
export class LoginDto {
  @EmailField()
  email: string;
  
  @StringField()
  password: string;
}
