import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, Column } from 'typeorm';
import { Post } from './post.entity';
import { PostComment } from './post-comment.entity';
import { User } from '../../users/entities/user.entity';

@Entity('post_likes')
export class PostLike {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Post, (post) => post.likes, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'post_id' })
  post: Post;

  @Column({ name: 'post_id', nullable: true })
  postId: string;

  @ManyToOne(() => PostComment, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'comment_id' })
  comment: PostComment;

  @Column({ name: 'comment_id', nullable: true })
  commentId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  @CreateDateColumn()
  createdAt: Date;
}

