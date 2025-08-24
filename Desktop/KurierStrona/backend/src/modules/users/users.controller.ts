import { Body, Controller, Get, Put, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@UseGuards(JwtAuthGuard)
	@Get('profile')
	profile(@Req() req: any) {
		return this.usersService.getProfile(req.user.userId)
	}

	@UseGuards(JwtAuthGuard)
	@Put('profile')
	update(@Req() req: any, @Body() body: any) {
		const allowed: any = {}
		if (typeof body.full_name === 'string') allowed.full_name = body.full_name
		if (typeof body.phone === 'string') allowed.phone = body.phone
		if (typeof body.company_name === 'string') allowed.company_name = body.company_name
		if (typeof body.billing_address_line1 === 'string') allowed.billing_address_line1 = body.billing_address_line1
		if (typeof body.billing_address_line2 === 'string') allowed.billing_address_line2 = body.billing_address_line2
		if (typeof body.billing_city === 'string') allowed.billing_city = body.billing_city
		if (typeof body.billing_postcode === 'string') allowed.billing_postcode = body.billing_postcode
		if (typeof body.billing_country === 'string') allowed.billing_country = body.billing_country
		if (typeof body.paid_cents === 'number') allowed.paid_cents = Math.max(0, Math.floor(body.paid_cents))
		return this.usersService.updateProfile(req.user.userId, allowed)
	}
}
