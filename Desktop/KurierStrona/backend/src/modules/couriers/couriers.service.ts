import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Courier } from '../../entities/courier.entity';

@Injectable()
export class CouriersService implements OnModuleInit {
	constructor(
		@InjectRepository(Courier) private readonly courierRepo: Repository<Courier>,
	) {}

	async onModuleInit() {
		const existing = await this.courierRepo.findOne({ where: { name: 'FakeKurier' } });
		if (!existing) {
			await this.courierRepo.save(
				this.courierRepo.create({ name: 'FakeKurier', api_base_url: 'https://fakekurier.local', api_key: null }),
			);
		}
	}

	findAll() {
		return this.courierRepo.find();
	}
}
