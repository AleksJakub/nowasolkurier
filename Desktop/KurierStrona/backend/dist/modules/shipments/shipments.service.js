"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShipmentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const shipment_entity_1 = require("../../entities/shipment.entity");
const courier_entity_1 = require("../../entities/courier.entity");
let ShipmentsService = class ShipmentsService {
    constructor(shipmentsRepo, couriersRepo) {
        this.shipmentsRepo = shipmentsRepo;
        this.couriersRepo = couriersRepo;
    }
    calculateQuote(weight, length, width, height, courier) {
        const volumetric = (length * width * height) / 5000;
        const billable = Math.max(weight, volumetric);
        const base = courier.name.includes('Fast') ? 12 : 9;
        const price = base + billable * (courier.name.includes('Eco') ? 1.2 : 1.6);
        return Number(price.toFixed(2));
    }
    async getQuotes(params) {
        const couriers = await this.couriersRepo.find();
        return couriers.map((c) => ({
            courier_id: c.id,
            courier_name: c.name,
            price: this.calculateQuote(params.weight, params.length, params.width, params.height, c),
        }));
    }
    async createShipment({ userId, courierId, recipient_name, recipient_address, parcel_weight, parcel_length, parcel_width, parcel_height, price, }) {
        const courier = await this.couriersRepo.findOne({ where: { id: courierId } });
        if (!courier)
            throw new Error('Courier not found');
        const tracking = 'TRK-' + Math.random().toString(36).slice(2, 10).toUpperCase();
        const labelUrl = `/api/shipments/label/${tracking}.txt`;
        const shipment = this.shipmentsRepo.create({
            courier,
            user: { id: userId },
            recipient_name,
            recipient_address,
            parcel_weight,
            parcel_length,
            parcel_width,
            parcel_height,
            tracking_number: tracking,
            label_url: labelUrl,
            price: price !== null && price !== void 0 ? price : this.calculateQuote(parcel_weight, parcel_length, parcel_width, parcel_height, courier),
        });
        return this.shipmentsRepo.save(shipment);
    }
    findByUser(userId) {
        return this.shipmentsRepo.find({ where: { user: { id: userId } } });
    }
    findOne(id) {
        return this.shipmentsRepo.findOne({ where: { id } });
    }
};
exports.ShipmentsService = ShipmentsService;
exports.ShipmentsService = ShipmentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(shipment_entity_1.Shipment)),
    __param(1, (0, typeorm_1.InjectRepository)(courier_entity_1.Courier)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], ShipmentsService);
//# sourceMappingURL=shipments.service.js.map