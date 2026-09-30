import { StringField } from '../../common/decorators/field.decorators.js';

export class ChangePasswordDto {
  @StringField()
  currentPassword!: string;

  @StringField({ minLength: 6 })
  newPassword!: string;
}