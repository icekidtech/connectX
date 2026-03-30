import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { PostMedia } from './post-media.entity';
import { PostLike } from './post-like.entity';
import { PostComment } from './post-comment.entity';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.posts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'author_id' })
  author: User;

  @Column({ name: 'author_id' })
  authorId: string;

  @Column({ nullable: true })
  caption: string;

  @Column('simple-array', { nullable: true })
  hashtags: string[];

  @Column({ default: false })
  isNsfw: boolean;

  @Column({ default: 'public', type: 'enum', enum: ['public', 'private', 'friends'] })
  visibility: 'public' | 'private' | 'friends';

  @Column({ default: 0 })
  likeCount: number;

  @Column({ default: 0 })
  commentCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => PostMedia, (media) => media.post, { cascade: true })
  media: PostMedia[];

  @OneToMany(() => PostLike, (like) => like.post, { cascade: true })
  likes: PostLike[];

  @OneToMany(() => PostComment, (comment) => comment.post, { cascade: true })
  comments: PostComment[];
}
