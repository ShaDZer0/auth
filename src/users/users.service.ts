import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { UserResponseDto } from './dto/user-response.dto.js';
import { UsersPageOptionsDto } from './dto/users-page-options.dto.js';
import { User } from './entities/user.entity.js';
import { UserRole } from './entities/user-role.enum.js';
import { PageDto } from '../common/dto/page.dto.js';
import { PageMetaDto } from '../common/dto/page-meta.dto.js';
import { ChangePasswordDto } from './dto/change-password.dto.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const existing = await this.findByEmail(createUserDto.email);
    if (existing) {
      throw new ConflictException('Користувач з таким email вже існує');
    }

    const password = await bcrypt.hash(createUserDto.password, 10);
    const user = this.usersRepository.create({ ...createUserDto, password });
    const saved = await this.usersRepository.save(user);
    return this.toResponseDto(saved);
  }
  async changePassword(userId: number, dto: ChangePasswordDto): Promise<{ message: string }> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Користувача не знайдено');

    const isMatch = await bcrypt.compare(dto.currentPassword, user.password);
    if (!isMatch) {
      throw new BadRequestException('Поточний пароль введено невірно');
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(dto.newPassword, salt);
    await this.usersRepository.save(user);

    return { message: 'Пароль успішно змінено' };
  }
  async findAll(options: UsersPageOptionsDto): Promise<PageDto<UserResponseDto>> {
    const { search, role, orderByColumn, orderBy } = options;

    const query = this.usersRepository.createQueryBuilder('user');
    if (search) {
      query.andWhere(
        `(user.email ILIKE :search
          OR user.name ILIKE :search)`,
        { search: `%${search}%` },
      );
    }

    if (role) {
      query.andWhere('user.role = :role', { role });
    }

    query.orderBy(`user.${orderByColumn}`, orderBy);
    query.skip(options.skip).take(options.take);

    const [users, itemCount] = await query.getManyAndCount();
    const data = users.map((user) => this.toResponseDto(user));
    const meta = new PageMetaDto({ pageOptionsDto: options, itemCount });

    return new PageDto(data, meta);
  }

  async findOne(id: number): Promise<UserResponseDto> {
    const user = await this.findOneEntity(id);
    return this.toResponseDto(user);
  }

  findByEmail(email: string) {
    return this.usersRepository.findOneBy({ email });
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const user = await this.findOneEntity(id);

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existing = await this.findByEmail(updateUserDto.email);
      if (existing) {
        throw new ConflictException('Користувач з таким email вже існує');
      }
    }

    if (updateUserDto.password) {
      updateUserDto = {
        ...updateUserDto,
        password: await bcrypt.hash(updateUserDto.password, 10),
      };
    }

    Object.assign(user, updateUserDto);
    const saved = await this.usersRepository.save(user);
    return this.toResponseDto(saved);
  }

  async updateRole(id: number, role: UserRole): Promise<UserResponseDto> {
    const user = await this.findOneEntity(id);
    user.role = role;
    const saved = await this.usersRepository.save(user);
    return this.toResponseDto(saved);
  }

  async remove(id: number): Promise<void> {
    const result = await this.usersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Користувача з id ${id} не знайдено`);
    }
  }
  async updatePassword(userId: number, passwordHash: string): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Користувача не знайдено');
    }

    user.password = passwordHash;
    await this.usersRepository.save(user);
  }

  private async findOneEntity(id: number): Promise<User> {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`Користувача з id ${id} не знайдено`);
    }
    return user;
  }

  /** Явний мапінг User -> UserResponseDto. password сюди не копіюється. */
  private toResponseDto(user: User): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = user.id;
    dto.email = user.email;
    dto.name = user.name;
    dto.status = user.status;
    dto.role = user.role;
    return dto;
  }
}
