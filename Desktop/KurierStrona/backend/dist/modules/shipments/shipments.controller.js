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
exports.ShipmentsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_guard_1 = require("../auth/jwt.guard");
const shipments_service_1 = require("./shipments.service");
const dto_1 = require("./dto");
let ShipmentsController = class ShipmentsController {
    constructor(shipmentsService) {
        this.shipmentsService = shipmentsService;
    }
    quotes(body) {
        return this.shipmentsService.getQuotes({
            weight: body.parcel_weight,
            length: body.parcel_length,
            width: body.parcel_width,
            height: body.parcel_height,
        });
    }
    create(body, res) {
        var _a;
        const anyReq = res.req;
        const userId = (_a = anyReq.user) === null || _a === void 0 ? void 0 : _a.userId;
        return this.shipmentsService.createShipment({
            userId,
            courierId: body.courier_id,
            recipient_name: body.recipient_name,
            recipient_address: body.recipient_address,
            parcel_weight: body.parcel_weight,
            parcel_length: body.parcel_length,
            parcel_width: body.parcel_width,
            parcel_height: body.parcel_height,
            price: body.price,
        });
    }
    list(res) {
        var _a;
        const anyReq = res.req;
        const userId = (_a = anyReq.user) === null || _a === void 0 ? void 0 : _a.userId;
        return this.shipmentsService.findByUser(userId);
    }
    getOne(id) {
        return this.shipmentsService.findOne(id);
    }
    label(tracking, res) {
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Content-Disposition', `attachment; filename=label-${tracking}.txt`);
        res.send(`NowaSolKurier\nTracking: ${tracking}\n`);
    }
};
exports.ShipmentsController = ShipmentsController;
__decorate([
    (0, common_1.Post)('quotes'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.QuoteRequestDto]),
    __metadata("design:returntype", void 0)
], ShipmentsController.prototype, "quotes", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateShipmentDto, Object]),
    __metadata("design:returntype", void 0)
], ShipmentsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ShipmentsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ShipmentsController.prototype, "getOne", null);
__decorate([
    (0, common_1.Get)('/label/:tracking.txt'),
    __param(0, (0, common_1.Param)('tracking')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ShipmentsController.prototype, "label", null);
exports.ShipmentsController = ShipmentsController = __decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('shipments'),
    __metadata("design:paramtypes", [shipments_service_1.ShipmentsService])
], ShipmentsController);
//# sourceMappingURL=shipments.controller.js.map