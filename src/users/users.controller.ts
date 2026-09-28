import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { UpdateRoleDto } from './dto/update-role.dto.js';
import { UserResponseDto } from './dto/user-response.dto.js';
import { UsersPageOptionsDto } from './dto/users-page-options.dto.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { ApiIdParam } from '../common/decorators/api-id-param.decorator.js';
import { ApiPaginatedResponse } from '../common/decorators/api-paginated-response.decorator.js';
import { UserRole } from './entities/user-role.enum.js';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { ChangePasswordDto } from './dto/change-password.dto.js';

@ApiBearerAuth('JWT')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiCreatedResponse({ type: UserResponseDto, description: 'Юзера створено' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @ApiPaginatedResponse(UserResponseDto, 'Список юзерів з пошуком, фільтром за роллю і сортуванням')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get()
  findAll(@Query() options: UsersPageOptionsDto) {
    return this.usersService.findAll(options);
  }

  @ApiOkResponse({ type: UserResponseDto, description: 'Дані поточного залогіненого юзера' })
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@CurrentUser() currentUser: { userId: number }) {
    return this.usersService.findOne(currentUser.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('change-password')
  changePassword(
    @CurrentUser() currentUser: { userId: number },
    @Body() dto: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(currentUser.userId, dto);
  }

  @ApiIdParam('ID юзера')
  @ApiOkResponse({ type: UserResponseDto, description: 'Дані юзера за id' })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @ApiIdParam('ID юзера')
  @ApiOkResponse({ type: UserResponseDto, description: 'Оновлені дані юзера' })
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @ApiIdParam('ID юзера')
  @ApiOkResponse({ type: UserResponseDto, description: 'Юзер з оновленою роллю' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id/role')
  updateRole(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRoleDto) {
    return this.usersService.updateRole(id, dto.role);
  }

  @ApiIdParam('ID юзера')
  @ApiOkResponse({ description: 'Юзера видалено' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}