import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Shipment } from '../../entities/shipment.entity';
import { Courier } from '../../entities/courier.entity';
import { ShipmentsService } from './shipments.service';
import { ShipmentsController } from './shipments.controller';

@Module({
	imports: [TypeOrmModule.forFeature([Shipment, Courier])],
	providers: [ShipmentsService],
	controllers: [ShipmentsController],
})
export class ShipmentsModule {}
