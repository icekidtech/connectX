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

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reporter_id' })
  reporter: User;

  @Column()
  reporterId: string;

  @Column()
  reportedUserId: string;

  @Column({ nullable: true })
  reportedPostId: string;

  @Column({
    type: 'enum',
    enum: [
      'inappropriate_content',
      'harassment',
      'catfishing',
      'spam',
      'fake_profile',
      'underage',
      'illegal_activity',
      'other',
    ],
  })
  category: string;

  @Column()
  description: string;

  @Column('simple-array', { nullable: true })
  evidence: string[];

  @Column({
    type: 'enum',
    enum: ['pending', 'under_review', 'resolved', 'dismissed'],
    default: 'pending',
  })
  status: 'pending' | 'under_review' | 'resolved' | 'dismissed';

  @Column({ nullable: true })
  resolution: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'moderator_id' })
  moderator: User;

  @Column({ nullable: true })
  moderatorId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
