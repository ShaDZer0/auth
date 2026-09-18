import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import {UserRole} from './user-role.enum.js';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column()
  password: string;

  @Column({type: 'enum', enum: UserRole, default: UserRole.USER})
  role: UserRole;
}
