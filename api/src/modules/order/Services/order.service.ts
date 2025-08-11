import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  DeliveryModeEnum,
  IOrder,
  IOrderCreate,
  IOrderUpdate,
} from '../Interfaces/order.interface';
import { IOrderItem } from '../Interfaces/order.interface';
import { Order, OrderItem, OrderStatus, Product } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

type PrismaOrderWithItems = Order & {
  items: (OrderItem & {
    product: Product;
  })[];
};

@Injectable()
export class OrderService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: IOrderCreate): Promise<IOrder | null> {
    if (!data.userId) return null;

    const cart = await this.prisma.cart.findFirst({
      where: { userId: data.userId },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    if (!cart || cart.items.length === 0) return null;

    const total = cart.items.reduce((sum, item) => {
      return sum + item.quantity * Number(item.product.price);
    }, 0);

    const order = await this.prisma.order.create({
      data: {
        userId: data.userId,
        deliveryAddress: data.deliveryAddress,
        deliveryMode: data.deliveryMode,
        total,
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.product.price,
          })),
        },
      },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    return this.exportToOrderInterface(order);
  }

  async getOrders(userId: number): Promise<IOrder[]> {
    const orders = await this.prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
    if (!orders) return [];

    return orders.map((order) => this.exportToOrderInterface(order));
  }

  async deleteOrder(orderId: number, userId: number): Promise<IOrder | null> {
    const existing = await this.prisma.order.findFirst({
      where: { id: orderId, userId },
      include: { items: { include: { product: true } } },
    });

    if (!existing) return null;
    const snapshot = this.exportToOrderInterface(existing);

    await this.prisma.orderItem.deleteMany({ where: { orderId } });
    await this.prisma.order.delete({ where: { id: orderId } });

    return snapshot;
  }

  async deleteAllForUser(
    userId: number,
  ): Promise<{ itemsDeleted: number; ordersDeleted: number }> {
    return this.prisma.$transaction(async (tx) => {
      // 1) Récupérer les IDs des commandes de l'utilisateur
      const orders = await tx.order.findMany({
        where: { userId },
        select: { id: true },
      });

      if (orders.length === 0) {
        return { itemsDeleted: 0, ordersDeleted: 0 };
      }

      const orderIds = orders.map((o) => o.id);

      // 2) Supprimer tous les items de ces commandes
      const itemsRes = await tx.orderItem.deleteMany({
        where: { orderId: { in: orderIds } },
      });

      // 3) Supprimer les commandes
      const ordersRes = await tx.order.deleteMany({
        where: { id: { in: orderIds }, userId },
      });

      return { itemsDeleted: itemsRes.count, ordersDeleted: ordersRes.count };
    });
  }

  async update(
    orderId: number,
    userId: number,
    data: IOrderUpdate,
  ): Promise<IOrder> {
    const existing = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: { include: { product: true } },
      },
    });

    if (!existing) {
      throw new NotFoundException('Commande introuvable');
    }
    if (existing.userId !== userId) {
      throw new ForbiddenException(
        'Vous ne pouvez pas modifier cette commande',
      );
    }

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: (data.status as OrderStatus) ?? undefined,
        deliveryAddress: data.deliveryAddress ?? undefined,
        paymentIntentId: data.paymentIntentId ?? undefined,
      },
      include: {
        items: { include: { product: true } },
      },
    });

    return this.exportToOrderInterface(updated);
  }

  private exportToOrderInterface(order: PrismaOrderWithItems): IOrder {
    return {
      id: order.id,
      deliveryAddress: order.deliveryAddress,
      userId: order.userId ?? undefined,
      total: Number(order.total),
      status: order.status,
      deliveryMode: order.deliveryMode as unknown as DeliveryModeEnum,
      items: order.items.map(
        (item): IOrderItem => ({
          id: item.id,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: Number(item.unitPrice),
          product: {
            id: item.product.id,
            name: item.product.name,
            description: item.product.description ?? '',
            price: Decimal(item.product.price),
            stock: item.product.stock,
            imageUrl: item.product.imageUrl ?? undefined,
            category: item.product.category ?? undefined,
          },
          orderId: item.orderId,
        }),
      ),
    };
  }
}
