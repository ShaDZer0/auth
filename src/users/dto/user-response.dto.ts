import { ApiProperty } from "@nestjs/swagger";
import { UserRole } from "../entities/user-role.enum.js";

export class UserResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 'Іван Іванов' })
  name: string;

  @ApiProperty({ example: 'active', required: false })
  status: string;

  @ApiProperty({ enum: UserRole, example: UserRole.USER })
  role: UserRole;
}