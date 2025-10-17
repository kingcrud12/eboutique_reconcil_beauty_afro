// src/user/user.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  IUser,
  IUserCreate,
  IUserprivate,
  IUserUpdate,
} from '../Interfaces/user.interface';
import { User as PrismaUser } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async get(id: number): Promise<IUser | null> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: id,
      },
    });

    return user ? this.exportToUserInterface(user) : null;
  }

  async getByEmail(email: string): Promise<IUserprivate | null> {
    const user = await this.verifyUser({ email });
    return user ? this.exportToUserprivateInterface(user) : null;
  }

  async update(id: number, updateUser: IUserUpdate): Promise<IUser> {
    const existing = await this.verifyUser({ id });
    if (!existing) {
      return null;
    }

    const data = { ...updateUser };

    if (updateUser.password) {
      data.password = await bcrypt.hash(updateUser.password, 10);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data,
    });

    return this.exportToUserInterface(updatedUser);
  }

  async create(createUser: IUserCreate): Promise<IUser> {
    const hashedPassword = await bcrypt.hash(createUser.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: createUser.email,
        firstName: createUser.firstName,
        lastName: createUser.lastName,
        password: hashedPassword,
        adress: createUser.adress,
      },
    });

    return this.exportToUserInterface(user);
  }

  async getUsers(): Promise<IUser[]> {
    const users = await this.prisma.user.findMany();
    return users.map((user) => this.exportToUserInterface(user));
  }

  private exportToUserInterface(user: PrismaUser): IUser {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      adress: user.adress,
      phone: user.phone,
    };
  }

  private exportToUserprivateInterface(user: PrismaUser): IUserprivate {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: user.password,
      adress: user.adress,
      role: user.role,
    };
  }

  private exportToUserUpdatedInterface(user: PrismaUser): IUserUpdate {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: user.password,
      adress: user.adress,
    };
  }
  // src/modules/user/Services/user.service.ts (ou fichier équivalent)
  async verifyUser(params: {
    id?: number;
    email?: string;
  }): Promise<PrismaUser | null> {
    const { id, email } = params;

    if (!id && !email) {
      // Aucun identifiant -> pas d'appel à Prisma
      return null;
    }

    const where = id ? { id } : { email };

    return this.prisma.user.findUnique({
      where,
      select: {
        id: true,
        email: true,
        password: true,
        isConfirmed: true,
        firstName: true,
        lastName: true,
        adress: true,
        phone: true,
        role: true,
      },
    });
  }
}
