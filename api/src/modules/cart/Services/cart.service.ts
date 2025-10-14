import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Cart, CartItem } from '@prisma/client';
import {
  ICart,
  ICartCreate,
  ICartCreateUpdate,
} from '../Interfaces/cart.interface';
import { IProduct } from 'src/modules/product/Interfaces/product.interface';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: ICartCreate): Promise<ICart | null> {
    if (!data.userId && !data.guestId) return null;

    const cart = await this.prisma.cart.create({
      data: {
        userId: data?.userId ?? null,
        guestId: data?.guestId ?? null,
        uuid: data?.uuid ?? null,
        items: data.items?.length
          ? {
              create: data.items.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
              })),
            }
          : undefined,
      },
      include: {
        items: { include: { product: true } },
      },
    });

    return this.exportToCartInterface(cart); // retourne ICart complet
  }

  async getCartById(id: number): Promise<ICart | null> {
    const cart = await this.prisma.cart.findUnique({
      where: { id },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    if (!cart) return null;

    return this.exportToCartInterface(cart);
  }

  async getCarts(): Promise<ICart[] | null> {
    const carts = await this.prisma.cart.findMany({
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!carts) return null;

    return carts.map((cart) => this.exportToCartInterface(cart));
  }

  async getCartsByUser(userId: number): Promise<ICart[] | null> {
    const carts = await this.prisma.cart.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!carts || carts.length === 0) return null;

    return carts.map((cart) => this.exportToCartInterface(cart));
  }

  async updateCart(id: number, data: ICartCreateUpdate): Promise<ICart | null> {
    const existingCart = await this.prisma.cart.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!existingCart) return null;
    await this.prisma.cart.update({
      where: { id },
      data: {
        userId: data.userId ?? undefined,
        uuid: data.uuid ?? undefined,
        guestId: data.guestId ?? undefined,
      },
    });
    if (data.items && data.items.length > 0) {
      for (const item of data.items) {
        const existingItem = await this.prisma.cartItem.findFirst({
          where: {
            cartId: id,
            productId: item.productId,
          },
        });

        if (existingItem) {
          const newQuantity = Number(existingItem.quantity + item.quantity);

          if (newQuantity <= 0) {
            await this.prisma.cartItem.delete({
              where: { id: existingItem.id },
            });
          } else {
            // 🔁 Mise à jour de la quantité
            await this.prisma.cartItem.update({
              where: { id: existingItem.id },
              data: { quantity: newQuantity },
            });
          }
        } else {
          if (item.quantity > 0) {
            await this.prisma.cartItem.create({
              data: {
                cartId: id,
                productId: item.productId,
                quantity: item.quantity,
              },
            });
          }
        }
      }
    }

    const updatedCart = await this.prisma.cart.findUnique({
      where: { id },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    return this.exportToCartInterface(updatedCart);
  }

  async deleteCart(id: number): Promise<ICart | null> {
    const existingCart = await this.prisma.cart.findUnique({
      where: { id },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    if (!existingCart) return null;

    await this.prisma.cartItem.deleteMany({ where: { cartId: id } });

    const deleted = await this.prisma.cart.delete({
      where: { id },
    });

    return this.exportToCartInterface({
      ...deleted,
      items: existingCart.items,
    });
  }

  private exportToCartCreateInterface(
    cart: Cart & { items: (CartItem & { product: IProduct })[] },
  ): ICartCreate {
    return {
      userId: cart.userId ?? undefined,
      guestId: cart.guestId ?? undefined,
      uuid: cart.uuid ?? undefined,
      items: cart.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        quantity: Number(item.quantity),
        product: {
          id: item.product.id,
          name: String(item.product.name),
          description: item.product.description ?? '',
          price: item.product.price,
          stock: item.product.stock,
          weight: item.product.weight,
          imageUrl: item.product.imageUrl ?? undefined,
          category: item.product.category ?? undefined,
        },
      })),
    };
  }

  private exportToCartInterface(
    cart: Cart & { items: (CartItem & { product: IProduct })[] },
  ): ICart {
    return {
      id: cart.id,
      userId: cart.userId ?? undefined,
      guestId: cart.guestId ?? undefined,
      uuid: cart.uuid ?? undefined,
      createdAt: cart.createdAt,
      items: cart.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        quantity: Number(item.quantity),
        product: {
          id: item.product.id,
          name: String(item.product.name),
          description: item.product.description ?? '',
          price: item.product.price,
          stock: item.product.stock,
          weight: item.product.weight,
          imageUrl: item.product.imageUrl ?? undefined,
          category: item.product.category ?? undefined,
        },
      })),
    };
  }
}
