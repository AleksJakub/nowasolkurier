import { AuthService } from './auth.service';
declare class AuthDto {
    email: string;
    password: string;
}
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(body: AuthDto): Promise<{
        token: string;
    }>;
    login(body: AuthDto): Promise<{
        token: string;
    }>;
}
export {};
