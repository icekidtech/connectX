import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('matches')
export class Match {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_one_id' })
  userOne: User;

  @Column()
  userOneId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_two_id' })
  userTwo: User;

  @Column()
  userTwoId: string;

  @Column({ type: 'decimal', precision: 5, scale: 3, default: 0 })
  compatibilityScore: number;

  @Column({
    type: 'enum',
    enum: ['liked', 'matched', 'messaged', 'reported'],
    default: 'liked',
  })
  status: 'liked' | 'matched' | 'messaged' | 'reported';

  @Column({ type: 'jsonb', nullable: true })
  commonInterests: string[];

  @Column({ default: false })
  userOneLiked: boolean;

  @Column({ default: false })
  userTwoLiked: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
