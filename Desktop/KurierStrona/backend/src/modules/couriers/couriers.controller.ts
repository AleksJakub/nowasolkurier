import { Controller, Get, UseGuards } from '@nestjs/common';
import { CouriersService } from './couriers.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('couriers')
export class CouriersController {
	constructor(private readonly couriersService: CouriersService) {}

	@UseGuards(JwtAuthGuard)
	@Get()
	list() {
		return this.couriersService.findAll();
	}
}
