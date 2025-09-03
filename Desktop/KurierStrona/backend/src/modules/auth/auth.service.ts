import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
	constructor(
		private readonly usersService: UsersService,
		private readonly jwtService: JwtService,
	) {}

	async register(email: string, password: string) {
		const existing = await this.usersService.findByEmail(email);
		if (existing) {
			throw new UnauthorizedException('Email already registered');
		}
		const passwordHash = await bcrypt.hash(password, 10);
		const user = await this.usersService.createUser(email, passwordHash);
		const token = await this.jwtService.signAsync({ sub: user.id, email: user.email });
		return { token };
	}

	async login(email: string, password: string) {
		const user = await this.usersService.findByEmail(email);
		if (!user) {
			throw new UnauthorizedException('Invalid credentials');
		}
		const ok = await bcrypt.compare(password, user.password_hash);
		if (!ok) {
			throw new UnauthorizedException('Invalid credentials');
		}
		const token = await this.jwtService.signAsync({ sub: user.id, email: user.email });
		return { token };
	}
}
