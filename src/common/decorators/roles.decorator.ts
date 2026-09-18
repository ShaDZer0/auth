import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../users/entities/user-role.enum.js';

export const ROLES_KEY = 'roles';

/** Позначає ендпоінт як доступний тільки для перелічених ролей */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
