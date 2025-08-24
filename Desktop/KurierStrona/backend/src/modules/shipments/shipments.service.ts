import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shipment } from '../../entities/shipment.entity';
import { Courier } from '../../entities/courier.entity';

@Injectable()
export class ShipmentsService {
	constructor(
		@InjectRepository(Shipment) private readonly shipmentsRepo: Repository<Shipment>,
		@InjectRepository(Courier) private readonly couriersRepo: Repository<Courier>,
	) {}

	private computeFakeKurierOptions(weight: number, length: number, width: number, height: number, opts?: { country?: string, pallet_type?: string, handoff_method?: string }) {
		const vol = (length * width * height) / 5000;
		const billable = Math.max(weight, vol);
		const sizeMax = Math.max(length, width, height);
		const girth = length + width + height;
		const baseOptions = [
			{ code: 'FK-ECONOMY', name: 'FakeKurier Economy', factor: 1.0, eta: '2-3 dni' },
			{ code: 'FK-STANDARD', name: 'FakeKurier Standard', factor: 1.2, eta: '1-2 dni' },
			{ code: 'FK-EXPRESS', name: 'FakeKurier Express', factor: 1.5, eta: '1 dzień' },
		];
		const surcharge = (sizeMax > 120 ? 8 : 0) + (girth > 220 ? 6 : 0) + (billable > 10 ? 5 : 0) + (billable > 20 ? 10 : 0);
		const countryMultiplier = opts?.country && opts.country !== 'Poland' ? 1.35 : 1.0;
		const palletAdd = opts?.pallet_type === 'pallet' ? 20 : opts?.pallet_type === 'half_pallet' ? 12 : opts?.pallet_type === 'industrial_pallet' ? 35 : opts?.pallet_type === 'non_standard' ? 18 : 0;
		const handoffAdd = opts?.handoff_method === 'pickup' ? 10 : opts?.handoff_method === 'locker' ? 0 : 0;
		return baseOptions.map((opt) => {
			const base = 9 + billable * 1.8;
			const price = (base * opt.factor + surcharge + palletAdd + handoffAdd) * countryMultiplier;
			return { courierId: 'fakekurier', courierName: opt.name, service: opt.code, price: Number(price.toFixed(2)), eta: opt.eta };
		});
	}

	async getQuotes(params: { weight: number; length: number; width: number; height: number; country?: string; pallet_type?: string; handoff_method?: string }) {
		return { quotes: this.computeFakeKurierOptions(params.weight, params.length, params.width, params.height, { country: params.country, pallet_type: params.pallet_type, handoff_method: params.handoff_method }) };
	}

	async createShipment({
		userId,
		courierId,
		recipient_name,
		recipient_address,
		parcel_weight,
		parcel_length,
		parcel_width,
		parcel_height,
		price,
		service,
		pallet_type,
		handoff_method,
		pickup_address,
		country,
	}: {
		userId: string;
		courierId: string;
		recipient_name: string;
		recipient_address: string;
		parcel_weight: number;
		parcel_length: number;
		parcel_width: number;
		parcel_height: number;
		price?: number;
		service?: string;
		pallet_type?: string;
		handoff_method?: string;
		pickup_address?: string;
		country?: string;
	}) {
		const courier = await this.couriersRepo.findOne({ where: { name: 'FakeKurier' } });
		const tracking = 'FK-' + Math.random().toString(36).slice(2, 10).toUpperCase();
		const labelUrl = `/api/shipments/label/${tracking}.txt`;
		const computed = this.computeFakeKurierOptions(parcel_weight, parcel_length, parcel_width, parcel_height, { country, pallet_type, handoff_method })
		const finalPrice = price ?? (computed[0]?.price || 14.99);
		const shipment = this.shipmentsRepo.create({
			courier: courier as Courier,
			user: { id: userId } as any,
			recipient_name,
			recipient_address,
			parcel_weight,
			parcel_length,
			parcel_width,
			parcel_height,
			pallet_type: pallet_type ?? null,
			handoff_method: handoff_method ?? null,
			pickup_address: pickup_address ?? null,
			tracking_number: tracking,
			label_url: labelUrl,
			price: finalPrice,
		});
		return this.shipmentsRepo.save(shipment);
	}

	findByUser(userId: string) {
		return this.shipmentsRepo.find({ where: { user: { id: userId } } });
	}

	findOne(id: string) {
		return this.shipmentsRepo.findOne({ where: { id } });
	}
}
