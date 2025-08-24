import { User } from './user.entity';
import { Courier } from './courier.entity';
export declare class Shipment {
    id: string;
    user: User;
    courier: Courier;
    recipient_name: string;
    recipient_address: string;
    parcel_weight: number;
    parcel_length: number;
    parcel_width: number;
    parcel_height: number;
    label_url: string | null;
    tracking_number: string | null;
    price: number | null;
    dropoff_status: string;
    created_at: Date;
}
