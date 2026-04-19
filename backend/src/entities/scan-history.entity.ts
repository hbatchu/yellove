import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('scan_history')
export class ScanHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, (u) => u.scanHistory)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  barcode: string;

  @Column()
  productName: string;

  @Column({ nullable: true })
  productBrand: string;

  @Column({ nullable: true })
  productImage: string;

  @Column('float')
  healthScore: number;

  @Column()
  grade: string;

  @Column({ nullable: true })
  source: string;

  @CreateDateColumn()
  scannedAt: Date;
}
