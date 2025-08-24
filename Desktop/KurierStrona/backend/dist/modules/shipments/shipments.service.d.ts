import { Repository } from 'typeorm';
import { Shipment } from '../../entities/shipment.entity';
import { Courier } from '../../entities/courier.entity';
export declare class ShipmentsService {
    private readonly shipmentsRepo;
    private readonly couriersRepo;
    constructor(shipmentsRepo: Repository<Shipment>, couriersRepo: Repository<Courier>);
    calculateQuote(weight: number, length: number, width: number, height: number, courier: Courier): number;
    getQuotes(params: {
        weight: number;
        length: number;
        width: number;
        height: number;
    }): Promise<{
        courier_id: string;
        courier_name: string;
        price: number;
    }[]>;
    createShipment({ userId, courierId, recipient_name, recipient_address, parcel_weight, parcel_length, parcel_width, parcel_height, price, }: {
        userId: string;
        courierId: string;
        recipient_name: string;
        recipient_address: string;
        parcel_weight: number;
        parcel_length: number;
        parcel_width: number;
        parcel_height: number;
        price?: number;
    }): Promise<Shipment>;
    findByUser(userId: string): Promise<Shipment[]>;
    findOne(id: string): Promise<Shipment | null>;
}
