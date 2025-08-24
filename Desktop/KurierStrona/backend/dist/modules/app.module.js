"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const users_module_1 = require("./users/users.module");
const auth_module_1 = require("./auth/auth.module");
const couriers_module_1 = require("./couriers/couriers.module");
const shipments_module_1 = require("./shipments/shipments.module");
const user_entity_1 = require("../entities/user.entity");
const courier_entity_1 = require("../entities/courier.entity");
const shipment_entity_1 = require("../entities/shipment.entity");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            typeorm_1.TypeOrmModule.forRootAsync({
                useFactory: () => {
                    const usePostgres = !!process.env.POSTGRES_HOST;
                    return usePostgres
                        ? {
                            type: 'postgres',
                            host: process.env.POSTGRES_HOST || 'localhost',
                            port: Number(process.env.POSTGRES_PORT || '5432'),
                            username: process.env.POSTGRES_USER || 'nsk',
                            password: process.env.POSTGRES_PASSWORD || 'nskpassword',
                            database: process.env.POSTGRES_DB || 'nsk_db',
                            entities: [user_entity_1.User, courier_entity_1.Courier, shipment_entity_1.Shipment],
                            synchronize: true,
                        }
                        : {
                            type: 'sqlite',
                            database: 'dev.sqlite',
                            entities: [user_entity_1.User, courier_entity_1.Courier, shipment_entity_1.Shipment],
                            synchronize: true,
                        };
                },
            }),
            typeorm_1.TypeOrmModule.forFeature([user_entity_1.User, courier_entity_1.Courier, shipment_entity_1.Shipment]),
            users_module_1.UsersModule,
            auth_module_1.AuthModule,
            couriers_module_1.CouriersModule,
            shipments_module_1.ShipmentsModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map