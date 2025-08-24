import { Body, Controller, Post } from '@nestjs/common';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { AuthService } from './auth.service';

class AuthDto {
	@IsEmail()
	email!: string;
	@IsString()
	@MinLength(6)
	password!: string;
}

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('register')
	register(@Body() body: AuthDto) {
		return this.authService.register(body.email, body.password);
	}

	@Post('login')
	login(@Body() body: AuthDto) {
		return this.authService.login(body.email, body.password);
	}
}
