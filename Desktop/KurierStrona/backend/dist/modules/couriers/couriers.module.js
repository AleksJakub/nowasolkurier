"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CouriersModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const courier_entity_1 = require("../../entities/courier.entity");
const couriers_service_1 = require("./couriers.service");
const couriers_controller_1 = require("./couriers.controller");
let CouriersModule = class CouriersModule {
};
exports.CouriersModule = CouriersModule;
exports.CouriersModule = CouriersModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([courier_entity_1.Courier])],
        providers: [couriers_service_1.CouriersService],
        controllers: [couriers_controller_1.CouriersController],
        exports: [couriers_service_1.CouriersService],
    })
], CouriersModule);
//# sourceMappingURL=couriers.module.js.map