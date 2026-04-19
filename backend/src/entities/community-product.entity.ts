import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('community_products')
export class CommunityProduct {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  barcode: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, (u) => u.submittedProducts)
  @JoinColumn({ name: 'userId' })
  submittedBy: User;

  @Column()
  name: string;

  @Column({ nullable: true })
  brand: string;

  @Column({ nullable: true })
  imagePath: string;

  @Column('text', { nullable: true })
  nutritionJson: string;

  @Column('text', { nullable: true })
  ingredients: string;

  @Column({ default: false })
  verified: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
