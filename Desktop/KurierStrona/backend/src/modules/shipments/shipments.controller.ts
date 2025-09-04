// src/modules/shipments/shipments.controller.ts
import { Body, Controller, Get, Param, Post, Req, UseGuards, StreamableFile, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { ShipmentsService } from './shipments.service';
import { CreateShipmentDto, QuoteRequestDto } from './dto';

@UseGuards(JwtAuthGuard)
@Controller('shipments')
export class ShipmentsController {
  constructor(private readonly shipmentsService: ShipmentsService) {}

  private getUserId(req: Request): string {
    const uid = (req as any).user?.userId as string | undefined;
    if (!uid) throw new UnauthorizedException('Missing user in request');
    return uid;
  }

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
  create(@Body() body: CreateShipmentDto, @Req() req: Request) {
    const userId = this.getUserId(req);
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
  list(@Req() req: Request) {
    const userId = this.getUserId(req);
    return this.shipmentsService.findByUser(userId);
  }

  // Serve a plain-text label as a download without using Express Response typings
  @Get('/label/:tracking.txt')
  label(@Param('tracking') tracking: string) {
    const content = `NowaSolKurier
FakeKurier Label
Tracking: ${tracking}
`;
    // StreamableFile lets you set headers without importing Response
    return new StreamableFile(Buffer.from(content), {
      type: 'text/plain',
      disposition: `attachment; filename=label-${tracking}.txt`,
    });
  }
}
