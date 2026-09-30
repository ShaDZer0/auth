import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Exclude } from 'class-transformer';
import { User } from '../../users/entities/user.entity.js';

@Entity()
export class Game {
    @PrimaryGeneratedColumn()
    id: number;

    @Column() 
    name: string;
}
