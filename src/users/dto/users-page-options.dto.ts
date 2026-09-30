import { PageOptionsDto } from '../../common/dto/page-options.dto.js';
import { Order } from '../../common/constants/order.enum.js';
import { EnumFieldOptional, StringFieldOptional } from '../../common/decorators/field.decorators.js';
import { UserRole } from '../entities/user-role.enum.js';
import { UserOrderColumn } from '../entities/user-order-column.enum.js';

export class UsersPageOptionsDto extends PageOptionsDto {
  @StringFieldOptional({ description: 'Пошук по email, name' })
  search?: string;

  @EnumFieldOptional(UserRole, { description: 'Фільтр за роллю' })
  role?: UserRole;

  @EnumFieldOptional(UserOrderColumn, { default: UserOrderColumn.ID })
  orderByColumn: UserOrderColumn = UserOrderColumn.ID;

  @EnumFieldOptional(Order, { default: Order.ASC })
  orderBy: Order = Order.ASC;
}
