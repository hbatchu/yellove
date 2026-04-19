import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { ScanHistory } from './scan-history.entity';
import { CommunityProduct } from './community-product.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  password: string | null;

  @Column({ nullable: true, unique: true })
  googleId: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => ScanHistory, (h) => h.user)
  scanHistory: ScanHistory[];

  @OneToMany(() => CommunityProduct, (p) => p.submittedBy)
  submittedProducts: CommunityProduct[];
}
