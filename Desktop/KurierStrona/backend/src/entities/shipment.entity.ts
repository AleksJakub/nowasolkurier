import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Courier } from './courier.entity';

@Entity()
export class Shipment {
	@PrimaryGeneratedColumn('uuid')
	id!: string;

	@ManyToOne(() => User, (user) => user.shipments, { eager: true })
	@JoinColumn({ name: 'user_id' })
	user!: User;

	@ManyToOne(() => Courier, (courier) => courier.shipments, { eager: true })
	@JoinColumn({ name: 'courier_id' })
	courier!: Courier;

	@Column()
	recipient_name!: string;

	@Column()
	recipient_address!: string;

	@Column('float')
	parcel_weight!: number;

	@Column('int')
	parcel_length!: number;

	@Column('int')
	parcel_width!: number;

	@Column('int')
	parcel_height!: number;

	@Column({ type: 'float', nullable: true })
	declared_value!: number | null;

	@Column({ type: 'text', nullable: true })
	pallet_type!: string | null; // pallet | half_pallet | industrial_pallet | non_standard

	@Column({ type: 'text', nullable: true })
	handoff_method!: string | null; // pickup | locker | facility

	@Column({ type: 'text', nullable: true })
	pickup_address!: string | null;

	@Column({ type: 'text', nullable: true })
	label_url!: string | null;

	@Column({ type: 'text', nullable: true })
	tracking_number!: string | null;

	@Column('float', { nullable: true })
	price!: number | null;

	@Column({ default: 'pending' })
	dropoff_status!: string;

	@CreateDateColumn()
	created_at!: Date;
}
