import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('user_verifications')
export class UserVerification {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column()
  userId!: string;

  @Column({ nullable: true })
  photoVerificationImageUrl?: string;

  @Column({ nullable: true })
  photoVerificationPublicId?: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending',
  })
  photoVerificationStatus!: 'pending' | 'verified' | 'rejected';

  @Column({ nullable: true })
  photoVerificationRejectionReason?: string;

  @Column({ nullable: true })
  idVerificationImageUrl?: string;

  @Column({ nullable: true })
  idVerificationPublicId?: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending',
  })
  idVerificationStatus!: 'pending' | 'verified' | 'rejected';

  @Column({ nullable: true })
  idVerificationRejectionReason?: string;

  @Column({ default: 0 })
  verificationScore!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}