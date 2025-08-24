import { Controller, Get, Param } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shipment } from '../../entities/shipment.entity';

@Controller('public/track')
export class TrackController {
	constructor(
		@InjectRepository(Shipment) private readonly shipmentsRepo: Repository<Shipment>,
	) {}

	@Get(':tracking')
	async track(@Param('tracking') tracking: string) {
		const shipment = await this.shipmentsRepo.findOne({ where: { tracking_number: tracking } as any });
		if (!shipment) {
			return { found: false };
		}
		return {
			found: true,
			tracking: shipment.tracking_number,
			status: shipment.dropoff_status,
			courier: shipment.courier?.name,
			recipient: shipment.recipient_name,
			created_at: shipment.created_at,
		};
	}
}

