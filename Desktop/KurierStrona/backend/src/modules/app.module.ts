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
import { HealthController } from '../health.controller';



@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		TypeOrmModule.forRootAsync({
			useFactory: (): import('@nestjs/typeorm').TypeOrmModuleOptions => {
			  const base = {
				autoLoadEntities: true,   // 👈 instead of entities: [...]
				synchronize: true,
			  } as const;
		  
			  if (process.env.DATABASE_URL) {
				return {
				  type: 'postgres',
				  url: process.env.DATABASE_URL,
				  ssl: { rejectUnauthorized: false },
				  extra: { ssl: { rejectUnauthorized: false } },
				  ...base,
				};
			  }
		  
			  if (process.env.POSTGRES_HOST) {
				return {
				  type: 'postgres',
				  host: process.env.POSTGRES_HOST,
				  port: Number(process.env.POSTGRES_PORT || '5432'),
				  username: process.env.POSTGRES_USER || 'nsk',
				  password: process.env.POSTGRES_PASSWORD || 'nskpassword',
				  database: process.env.POSTGRES_DB || 'nsk_db',
				  ...(process.env.POSTGRES_SSL === 'true'
					? { ssl: { rejectUnauthorized: false }, extra: { ssl: { rejectUnauthorized: false } } }
					: {}),
				  ...base,
				};
			  }
		  
			  return {
				type: 'sqlite',
				database: 'dev.sqlite',
				...base,
			  };
			},
		}),
		  
		  
		TypeOrmModule.forFeature([User, Courier, Shipment]),
		UsersModule,
		AuthModule,
		CouriersModule,
		ShipmentsModule,
	],
	controllers: [TrackController, HealthController],
})
export class AppModule {}
