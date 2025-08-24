import { CouriersService } from './couriers.service';
export declare class CouriersController {
    private readonly couriersService;
    constructor(couriersService: CouriersService);
    list(): Promise<import("../../entities/courier.entity").Courier[]>;
}
