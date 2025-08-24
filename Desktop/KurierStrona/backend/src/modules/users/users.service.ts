import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { Shipment } from '../../entities/shipment.entity';

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(User) private readonly usersRepo: Repository<User>,
		@InjectRepository(Shipment) private readonly shipmentsRepo: Repository<Shipment>,
	) {}

	async createUser(email: string, passwordHash: string): Promise<User> {
		const user = this.usersRepo.create({ email, password_hash: passwordHash });
		return this.usersRepo.save(user);
	}

	async findByEmail(email: string): Promise<User | null> {
		return this.usersRepo.findOne({ where: { email } });
	}

	async findById(id: string): Promise<User | null> {
		return this.usersRepo.findOne({ where: { id } });
	}

	async getProfile(userId: string) {
		const user = await this.usersRepo.findOne({ where: { id: userId } });
		const shipments = await this.shipmentsRepo.find({ where: { user: { id: userId } } });
		const totalDue = shipments.reduce((sum, s) => sum + (Number(s.price || 0) * 100), 0);
		const paid = user?.paid_cents || 0;
		return {
			full_name: user?.full_name || '',
			phone: user?.phone || '',
			company_name: user?.company_name || '',
			billing_address_line1: user?.billing_address_line1 || '',
			billing_address_line2: user?.billing_address_line2 || '',
			billing_city: user?.billing_city || '',
			billing_postcode: user?.billing_postcode || '',
			billing_country: user?.billing_country || (user?.billing_address ? 'Poland' : ''),
			email: user?.email || '',
			created_at: user?.created_at,
			stats: {
				totalShipments: shipments.length,
				totalDueCents: totalDue,
				paidCents: paid,
				balanceCents: Math.max(totalDue - paid, 0),
			},
		};
	}

	async updateProfile(userId: string, data: Partial<Pick<User, 'full_name'|'phone'|'company_name'|'billing_address_line1'|'billing_address_line2'|'billing_city'|'billing_postcode'|'billing_country'|'paid_cents'>>) {
		const legacy = [data.billing_address_line1, data.billing_address_line2].filter(Boolean).join(', ');
		const cityPart = [data.billing_postcode, data.billing_city].filter(Boolean).join(' ');
		const combined = [legacy, cityPart, data.billing_country].filter(Boolean).join(', ');
		await this.usersRepo.update({ id: userId }, { ...data, billing_address: combined || null });
		return this.getProfile(userId);
	}
}
