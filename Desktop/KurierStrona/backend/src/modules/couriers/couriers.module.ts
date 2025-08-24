import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Courier } from '../../entities/courier.entity';
import { CouriersService } from './couriers.service';
import { CouriersController } from './couriers.controller';

@Module({
	imports: [TypeOrmModule.forFeature([Courier])],
	providers: [CouriersService],
	controllers: [CouriersController],
	exports: [CouriersService],
})
export class CouriersModule {}
