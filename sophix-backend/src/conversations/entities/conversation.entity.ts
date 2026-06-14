import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne
} from 'typeorm';

import { User } from '../../users/entities/user.entity';
import { OneToMany } from 'typeorm';
import { Message } from '../../messages/entities/message.entity';



@Entity('conversations')
export class Conversation {

  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column({
    default: 'foundry'
  })
  model!: string;

  @ManyToOne(
    () => User,
    {
      onDelete: 'CASCADE'
    }
  )
  user!: User;

  @OneToMany(
  () => Message,
  message => message.conversation
)
messages!: Message[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}