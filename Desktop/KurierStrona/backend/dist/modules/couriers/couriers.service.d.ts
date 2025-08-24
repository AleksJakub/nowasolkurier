import { OnModuleInit } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Courier } from '../../entities/courier.entity';
export declare class CouriersService implements OnModuleInit {
    private readonly courierRepo;
    constructor(courierRepo: Repository<Courier>);
    onModuleInit(): Promise<void>;
    findAll(): Promise<Courier[]>;
}
