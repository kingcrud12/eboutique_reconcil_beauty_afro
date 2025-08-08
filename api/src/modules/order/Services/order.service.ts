import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { IOrder, IOrderCreate } from '../Interfaces/order.interface';
import { IOrderItem } from '../Interfaces/order.interface';
import { Order, OrderItem, Product } from '@prisma/client';
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

  async getOrders(userId: number): Promise<IOrder | null> {
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

    if (!orders) return null;

    return orders.map((order) => this.exportToOrderInterface(order));
  }

  private exportToOrderInterface(order: PrismaOrderWithItems): IOrder {
    return {
      id: order.id,
      deliveryAddress: order.deliveryAddress,
      userId: order.userId ?? undefined,
      total: Number(order.total),
      status: order.status,
      items: order.items.map(
        (item): IOrderItem => ({
          id: item.id,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: Decimal(item.unitPrice),
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
