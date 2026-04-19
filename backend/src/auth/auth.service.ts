import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
import { User } from '../entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(name: string, email: string, password: string) {
    const existing = await this.userRepo.findOne({ where: { email } });
    if (existing) throw new ConflictException('Email already registered');

    const hashed = await bcrypt.hash(password, 10);
    const user = this.userRepo.create({ name, email, password: hashed });
    await this.userRepo.save(user);

    const token = this.jwtService.sign({ sub: user.id, email: user.email });
    return { token, user: { id: user.id, name: user.name, email: user.email } };
  }

  async login(email: string, password: string) {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user || !user.password) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const token = this.jwtService.sign({ sub: user.id, email: user.email });
    return { token, user: { id: user.id, name: user.name, email: user.email } };
  }

  async googleLogin(idToken: string) {
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload?.email) throw new UnauthorizedException('Invalid Google token');

    let user = await this.userRepo.findOne({
      where: [{ googleId: payload.sub }, { email: payload.email }],
    });

    if (!user) {
      user = this.userRepo.create({
        name: payload.name ?? payload.email,
        email: payload.email,
        googleId: payload.sub,
        password: null,
      });
      await this.userRepo.save(user);
    } else if (!user.googleId) {
      user.googleId = payload.sub;
      await this.userRepo.save(user);
    }

    const token = this.jwtService.sign({ sub: user.id, email: user.email });
    return { token, user: { id: user.id, name: user.name, email: user.email } };
  }
}
