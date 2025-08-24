import { Shipment } from './shipment.entity';
export declare class Courier {
    id: string;
    name: string;
    api_base_url: string;
    api_key: string | null;
    shipments: Shipment[];
}
