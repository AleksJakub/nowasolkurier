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
			useFactory: () => {
			  const hasUrl = !!process.env.DATABASE_URL;
			  const hasDiscrete = !!process.env.POSTGRES_HOST;
		  
			  // Common entities & options
			  const base = {
				entities: [User, Courier, Shipment],
				synchronize: true, // TODO: disable in prod and use migrations
			  } as const;
		  
			  // 1) DATABASE_URL (Render, Railway, etc.)
			  if (hasUrl) {
				// Render’s managed Postgres usually requires SSL.
				// You can either append "?sslmode=require" to DATABASE_URL
				// OR configure ssl in the driver options like below.
				return {
				  type: 'postgres' as const,
				  url: process.env.DATABASE_URL,
				  ssl: { rejectUnauthorized: false }, // required on many PaaS
				  extra: { ssl: { rejectUnauthorized: false } }, // pg driver
				  ...base,
				};
			  }
		  
			  // 2) Discrete POSTGRES_* vars
			  if (hasDiscrete) {
				return {
				  type: 'postgres' as const,
				  host: process.env.POSTGRES_HOST,
				  port: Number(process.env.POSTGRES_PORT || '5432'),
				  username: process.env.POSTGRES_USER || 'nsk',
				  password: process.env.POSTGRES_PASSWORD || 'nskpassword',
				  database: process.env.POSTGRES_DB || 'nsk_db',
				  ssl: process.env.POSTGRES_SSL === 'true'
					? { rejectUnauthorized: false }
					: undefined,
				  extra: process.env.POSTGRES_SSL === 'true'
					? { ssl: { rejectUnauthorized: false } }
					: undefined,
				  ...base,
				};
			  }
		  
			  // 3) Local dev fallback: SQLite
			  return {
				type: 'sqlite' as const,
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
	controllers: [TrackController],
})
export class AppModule {}
