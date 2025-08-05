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

  async create(data: ICartCreate): Promise<ICartCreate | null> {
    if (!data.userId && !data.guestId) {
      return null;
    }

    const cart = await this.prisma.cart.create({
      data: {
        userId: data?.userId,
        guestId: data?.guestId,
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
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return this.exportToCartCreateInterface(cart);
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

  async updateCart(id: number, data: ICartCreateUpdate): Promise<ICart | null> {
    const existingCart = await this.prisma.cart.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!existingCart) return null;

    // Met à jour les infos user/guest si présentes
    await this.prisma.cart.update({
      where: { id },
      data: {
        userId: data.userId ?? undefined,
        guestId: data.guestId ?? undefined,
      },
    });

    // Gérer les produits à ajouter / modifier / supprimer
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
            // ❌ Supprimer si quantité à 0 ou moins
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
          // ✅ Création si pas encore dans le panier et quantité > 0
          if (item.quantity > 0) {
            await this.prisma.cartItem.create({
              data: {
                cartId: id,
                productId: item.productId,
                quantity: item.quantity,
              },
            });
          }
          // sinon : ignorer item.quantity <= 0 sur nouvel item
        }
      }
    }

    // 🔁 Rechargement du panier mis à jour
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
      createdAt: cart.createdAt as Date,
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
          imageUrl: item.product.imageUrl ?? undefined,
          category: item.product.category ?? undefined,
        },
      })),
    };
  }
}
