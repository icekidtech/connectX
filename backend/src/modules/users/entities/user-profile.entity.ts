import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('user_profiles')
export class UserProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, (user) => user.profile)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  userId: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  dateOfBirth: Date;

  @Column()
  gender: string;

  @Column({ nullable: true })
  bio: string;

  @Column('simple-array', { nullable: true })
  pronouns: string[];

  @Column()
  location: string;

  @Column('decimal', { precision: 10, scale: 6 })
  latitude: number;

  @Column('decimal', { precision: 10, scale: 6 })
  longitude: number;

  @Column({ nullable: true })
  relationshipStatus: string;

  @Column('simple-array', { nullable: true })
  lookingFor: string[];

  @Column({ type: 'jsonb', nullable: true })
  preferences: {
    minAge: number;
    maxAge: number;
    maxDistance: number;
    genderPreference: string[];
  };

  @Column({ type: 'jsonb', nullable: true })
  kinks: string[];

  @Column({ nullable: true })
  occupation: string;

  @Column({ nullable: true })
  education: string;

  @Column({ type: 'enum', enum: ['public', 'private', 'verified_only'], default: 'public' })
  profileVisibility: 'public' | 'private' | 'verified_only';

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
