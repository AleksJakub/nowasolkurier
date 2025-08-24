import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../entities/user.entity';
import { Shipment } from '../../entities/shipment.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
	imports: [TypeOrmModule.forFeature([User, Shipment])],
	providers: [UsersService],
	exports: [UsersService],
	controllers: [UsersController],
})
export class UsersModule {}
