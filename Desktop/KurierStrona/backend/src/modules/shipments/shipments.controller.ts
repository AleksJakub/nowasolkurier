import { Body, Controller, Get, Param, Post, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { ShipmentsService } from './shipments.service';
import { CreateShipmentDto, QuoteRequestDto } from './dto';

@UseGuards(JwtAuthGuard)
@Controller('shipments')
export class ShipmentsController {
	constructor(private readonly shipmentsService: ShipmentsService) {}

	@Post('quotes')
	quotes(@Body() body: QuoteRequestDto) {
		return this.shipmentsService.getQuotes({
			weight: body.parcel_weight,
			length: body.parcel_length,
			width: body.parcel_width,
			height: body.parcel_height,
			country: body.country,
			pallet_type: body.pallet_type,
			handoff_method: body.handoff_method,
		});
	}

	@Post()
	create(@Body() body: CreateShipmentDto, @Res({ passthrough: true }) res: Response) {
		const anyReq = (res as any).req as any;
		const userId: string = anyReq.user?.userId;
		return this.shipmentsService.createShipment({
			userId,
			courierId: body.courier_id,
			recipient_name: body.recipient_name,
			recipient_address: body.recipient_address,
			parcel_weight: body.parcel_weight,
			parcel_length: body.parcel_length,
			parcel_width: body.parcel_width,
			parcel_height: body.parcel_height,
			price: body.price,
			service: body.service,
			pallet_type: body.pallet_type,
			handoff_method: body.handoff_method,
			pickup_address: body.pickup_address,
			country: body.country,
		});
	}

	@Get()
	list(@Res({ passthrough: true }) res: Response) {
		const anyReq = (res as any).req as any;
		const userId: string = anyReq.user?.userId;
		return this.shipmentsService.findByUser(userId);
	}

	@Get(':id')
	getOne(@Param('id') id: string) {
		return this.shipmentsService.findOne(id);
	}

	@Get('/label/:tracking.txt')
	label(@Param('tracking') tracking: string, @Res() res: Response) {
		res.setHeader('Content-Type', 'text/plain');
		res.setHeader('Content-Disposition', `attachment; filename=label-${tracking}.txt`);
		res.send(`NowaSolKurier\nFakeKurier Label\nTracking: ${tracking}\n`);
	}
}
