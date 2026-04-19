import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('product_cache')
export class ProductCache {
  @PrimaryColumn()
  barcode: string;

  @Column('text')
  data: string;

  @Column()
  source: string;

  @CreateDateColumn()
  cachedAt: Date;

  @Column()
  expiresAt: Date;
}
