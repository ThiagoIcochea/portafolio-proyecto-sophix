import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne
} from 'typeorm';

import { Conversation } from '../../conversations/entities/conversation.entity';

@Entity('messages')
export class Message {

  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'text'
  })
  content!: string;

  @Column()
  role!: string;

  @ManyToOne(
    () => Conversation,
    {
      onDelete: 'CASCADE'
    }
  )
  conversation!: Conversation;

  @CreateDateColumn()
  createdAt!: Date;
}