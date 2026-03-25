import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn } from 'typeorm';
import { UserInterest } from './user-interest.entity';

@Entity('interests')
export class Interest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'enum', enum: ['general', 'dating', 'hookup', 'bdsm', 'relationship', 'experience'], default: 'general' })
  category: string;

  @Column({ default: 0 })
  popularity: number;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => UserInterest, (userInterest) => userInterest.interest)
  userInterests: UserInterest[];
}
