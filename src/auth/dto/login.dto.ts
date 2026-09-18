import{ EmailField, StringField,} from '../../common/decorators/field.decoratiors.js'
export class LoginDto {
  @EmailField()
  email: string;
  
  @StringField()
  password: string;
}
