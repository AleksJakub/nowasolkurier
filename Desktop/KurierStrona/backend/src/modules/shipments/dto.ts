import { IsUUID, IsString, IsNumber, Min, IsOptional, IsIn } from 'class-validator';

export class QuoteRequestDto {
	@IsString()
	recipient_name!: string;
	@IsString()
	recipient_address!: string;
	@IsNumber()
	@Min(0.01)
	parcel_weight!: number;
	@IsNumber()
	@Min(1)
	parcel_length!: number;
	@IsNumber()
	@Min(1)
	parcel_width!: number;
	@IsNumber()
	@Min(1)
	parcel_height!: number;
	@IsOptional()
	@IsNumber()
	declared_value?: number;
	@IsOptional()
	@IsString()
	country?: string;
	@IsOptional()
	@IsIn(['pallet','half_pallet','industrial_pallet','non_standard'])
	pallet_type?: string;
	@IsOptional()
	@IsIn(['pickup','locker','facility'])
	handoff_method?: string;
	@IsOptional()
	@IsString()
	pickup_address?: string;
}

export class CreateShipmentDto extends QuoteRequestDto {
	@IsUUID()
	courier_id!: string;
	@IsOptional()
	@IsNumber()
	price?: number;
	@IsOptional()
	@IsString()
	service?: string;
}
