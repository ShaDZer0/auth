import { StringField } from '../../common/decorators/field.decorators.js';

export class CreateGameDto {
  @StringField()
  name: string;
}
