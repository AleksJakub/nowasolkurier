import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Shipment } from './shipment.entity';

@Entity()
export class User {
	@PrimaryGeneratedColumn('uuid')
	id!: string;

	@Column({ unique: true })
	email!: string;

	@Column()
	password_hash!: string;

	@Column({ type: 'text', nullable: true })
	full_name!: string | null;
	@Column({ type: 'text', nullable: true })
	phone!: string | null;
	@Column({ type: 'text', nullable: true })
	company_name!: string | null;

	// Structured billing address
	@Column({ type: 'text', nullable: true })
	billing_address_line1!: string | null;
	@Column({ type: 'text', nullable: true })
	billing_address_line2!: string | null;
	@Column({ type: 'text', nullable: true })
	billing_city!: string | null;
	@Column({ type: 'text', nullable: true })
	billing_postcode!: string | null;
	@Column({ type: 'text', nullable: true })
	billing_country!: string | null;

	// Legacy concatenated address (kept for backward compatibility)
	@Column({ type: 'text', nullable: true })
	billing_address!: string | null;

	@Column('integer', { default: 0 })
	paid_cents!: number;

	@CreateDateColumn()
	created_at!: Date;

	@OneToMany(() => Shipment, (shipment) => shipment.user)
	shipments!: Shipment[];
}
