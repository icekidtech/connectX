import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('user_photos')
export class UserPhoto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.photos)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  userId: string;

  @Column()
  photoUrl: string;

  @Column()
  publicId: string;

  @Column({ default: false })
  isProfilePhoto: boolean;

  @Column({ default: 0 })
  displayOrder: number;

  @Column({ type: 'enum', enum: ['clean', 'nsfw', 'pending'], default: 'pending' })
  contentClassification: 'clean' | 'nsfw' | 'pending';

  @Column({ default: false })
  isVerified: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
