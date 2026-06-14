import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';

import { Conversation } from '../../conversations/entities/conversation.entity';

@Entity('users')
export class User {

  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    unique: true,
  })
  githubId!: string;

  @Column({
    unique: true,
  })
  githubUsername!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @OneToMany(
    () => Conversation,
    conversation => conversation.user,
  )
  conversations!: Conversation[];
}
