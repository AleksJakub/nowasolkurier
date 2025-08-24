import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Shipment } from './shipment.entity';

@Entity()
export class Courier {
	@PrimaryGeneratedColumn('uuid')
	id!: string;

	@Column({ unique: true })
	name!: string;

	@Column()
	api_base_url!: string;

	@Column({ type: 'text', nullable: true })
	api_key!: string | null;

	@OneToMany(() => Shipment, (shipment) => shipment.courier)
	shipments!: Shipment[];
}
