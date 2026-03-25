import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { StreamViewer } from './stream-viewer.entity';

@Entity('streams')
export class Stream {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'broadcaster_id' })
  broadcaster: User;

  @Column()
  broadcasterId: string;

  @Column({ nullable: true })
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column('simple-array', { nullable: true })
  hashtags: string[];

  @Column({ default: 0 })
  viewerCount: number;

  @Column({ type: 'enum', enum: ['live', 'ended', 'scheduled'], default: 'scheduled' })
  status: 'live' | 'ended' | 'scheduled';

  @Column({ nullable: true })
  thumbnailUrl: string;

  @Column({ nullable: true })
  streamUrl: string;

  @Column({ nullable: true })
  scheduledStartTime: Date;

  @CreateDateColumn()
  startedAt: Date;

  @Column({ nullable: true })
  endedAt: Date;

  @Column({ default: false })
  isNsfw: boolean;

  @OneToMany(() => StreamViewer, (viewer) => viewer.stream)
  viewers: StreamViewer[];
}
