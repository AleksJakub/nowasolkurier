import { Shipment } from './shipment.entity';
export declare class User {
    id: string;
    email: string;
    password_hash: string;
    created_at: Date;
    shipments: Shipment[];
}
