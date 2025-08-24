import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CouriersModule } from './couriers/couriers.module';
import { ShipmentsModule } from './shipments/shipments.module';
import { User } from '../entities/user.entity';
import { Courier } from '../entities/courier.entity';
import { Shipment } from '../entities/shipment.entity';
import { TrackController } from './shipments/track.controller';

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		TypeOrmModule.forRootAsync({
			useFactory: () => ({
				type: process.env.POSTGRES_HOST ? 'postgres' : 'sqlite',
				host: process.env.POSTGRES_HOST || undefined,
				port: process.env.POSTGRES_HOST ? Number(process.env.POSTGRES_PORT || '5432') : undefined,
				username: process.env.POSTGRES_HOST ? (process.env.POSTGRES_USER || 'nsk') : undefined,
				password: process.env.POSTGRES_HOST ? (process.env.POSTGRES_PASSWORD || 'nskpassword') : undefined,
				database: process.env.POSTGRES_HOST ? (process.env.POSTGRES_DB || 'nsk_db') : 'dev.sqlite',
				entities: [User, Courier, Shipment],
				synchronize: true,
			}),
		}),
		TypeOrmModule.forFeature([User, Courier, Shipment]),
		UsersModule,
		AuthModule,
		CouriersModule,
		ShipmentsModule,
	],
	controllers: [TrackController],
})
export class AppModule {}
