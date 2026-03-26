import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, Column } from 'typeorm';
import { Stream } from './stream.entity';
import { User } from '../../users/entities/user.entity';

@Entity('stream_viewers')
export class StreamViewer {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Stream, (stream) => stream.viewers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'stream_id' })
  stream!: Stream;

  @Column()
  streamId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'viewer_id' })
  viewer!: User;

  @Column()
  viewerId!: string;

  @CreateDateColumn()
  joinedAt!: Date;

  @Column({ nullable: true })
  leftAt!: Date;
}
