import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Column,
} from 'typeorm';
import { User } from './user.entity';
import { Interest } from './interest.entity';

@Entity('user_interests')
export class UserInterest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.interests, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Interest, (interest) => interest.userInterests, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'interest_id' })
  interest: Interest;

  @Column()
  interestId: string;

  @Column({ default: 1 })
  proficiency: number;

  @CreateDateColumn()
  addedAt: Date;
}
