import { Response } from 'express';
import { ShipmentsService } from './shipments.service';
import { CreateShipmentDto, QuoteRequestDto } from './dto';
export declare class ShipmentsController {
    private readonly shipmentsService;
    constructor(shipmentsService: ShipmentsService);
    quotes(body: QuoteRequestDto): Promise<{
        courier_id: string;
        courier_name: string;
        price: number;
    }[]>;
    create(body: CreateShipmentDto, res: Response): Promise<import("../../entities/shipment.entity").Shipment>;
    list(res: Response): Promise<import("../../entities/shipment.entity").Shipment[]>;
    getOne(id: string): Promise<import("../../entities/shipment.entity").Shipment | null>;
    label(tracking: string, res: Response): void;
}
