export declare class QuoteRequestDto {
    recipient_name: string;
    recipient_address: string;
    parcel_weight: number;
    parcel_length: number;
    parcel_width: number;
    parcel_height: number;
}
export declare class CreateShipmentDto extends QuoteRequestDto {
    courier_id: string;
    price?: number;
}
