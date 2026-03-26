import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { UserProfile } from './user-profile.entity';
import { UserPhoto } from './user-photo.entity';
import { UserInterest } from './user-interest.entity';
import { Post } from '../../../modules/posts/entities/post.entity';
import { Message } from '../../../modules/chat/entities/message.entity';
import { Block } from './block.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  username!: string;

  @Column()
  passwordHash!: string;

  @Column({ default: false })
  isVerified!: boolean;

  @Column({ default: false })
  isEmailVerified!: boolean;

  @Column({ nullable: true })
  verificationToken?: string;

  @Column({ type: 'enum', enum: ['active', 'suspended', 'banned'], default: 'active' })
  status!: 'active' | 'suspended' | 'banned';

  @Column({ type: 'jsonb', nullable: true })
  privacySettings?: {
    showOnline: boolean;
    allowMessages: boolean;
    allowSearch: boolean;
  };

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToOne(() => UserProfile, (profile) => profile.user, { cascade: true })
  profile!: UserProfile;

  @OneToMany(() => UserPhoto, (photo) => photo.user, { cascade: true })
  photos!: UserPhoto[];

  @OneToMany(() => UserInterest, (interest) => interest.user, { cascade: true })
  interests!: UserInterest[];

  @OneToMany(() => Post, (post) => post.author, { cascade: true })
  posts!: Post[];

  @OneToMany(() => Message, (message) => message.sender, { cascade: true })
  sentMessages!: Message[];

  @OneToMany(() => Block, (block) => block.blocker, { cascade: true })
  blockedUsers!: Block[];

  @OneToMany(() => Block, (block) => block.blockedUser, { cascade: true })
  blockedByUsers!: Block[];
}
