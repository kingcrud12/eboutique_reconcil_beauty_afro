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
import {
  DeliveryMode,
  Order,
  OrderItem,
  OrderStatus,
  Product,
} from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

type PrismaOrderWithItems = Order & {
  items: (OrderItem & {
    product: Product;
  })[];
};

/* =========================
   Barèmes & helpers frais
   ========================= */

const SHIPPING_TABLES: Record<
  DeliveryMode,
  Array<[maxKg: number, priceEUR: number]>
> = {
  RELAY: [
    [0.25, 4.2],
    [0.5, 4.49],
    [0.75, 5.69],
    [1.0, 5.4],
    [2.0, 6.6],
    [3.0, 14.99],
    [4.0, 8.9],
    [5.0, 12.4],
    [7.0, 14.4],
    [10.0, 14.4],
    [15.0, 22.4],
    [20.0, 22.4],
    [25.0, 32.4],
  ],
  HOME: [
    [0.25, 5.25],
    [0.5, 7.35],
    [0.75, 8.65],
    [1.0, 9.4],
    [2.0, 10.7],
    [5.0, 16.6],
  ],
  LOCKER: [
    [0.25, 3.59],
    [0.5, 3.59],
    [0.75, 3.59],
    [1.0, 3.59],
    [2.0, 5.39],
    [3.0, 5.99],
    [4.0, 6.89],
    [5.0, 9.29],
    [7.0, 12.19],
    [10.0, 13.69],
    [15.0, 19.79],
    [20.0, 20.89],
    [25.0, 31.0],
  ],
  EXPRESS: [
    [0.25, 4.55],
    [0.5, 6.65],
    [0.75, 7.95],
    [1.0, 8.7],
    [2.0, 10.0],
    [5.0, 15.9],
  ],
};

function computeShippingFeeEUR(
  mode: DeliveryModeEnum,
  totalWeightKg: number,
): number {
  const table = SHIPPING_TABLES[mode] ?? SHIPPING_TABLES.RELAY;
  for (const [maxKg, price] of table) {
    if (totalWeightKg <= maxKg) return price;
  }
  const [, lastPrice] = table[table.length - 1];
  return lastPrice;
}

function computeTotalWeightKg(
  items: Array<{ quantity: number; product: { weight?: number | null } }>,
): number {
  return items.reduce((sum, it) => {
    const weightKg = Number.isFinite(Number(it.product?.weight))
      ? Number(it.product?.weight) / 1000
      : 0;
    return sum + weightKg * it.quantity;
  }, 0);
}

function computeTotalWeightGrams(
  items: Array<{ quantity: number; product: { weight?: number | null } }>,
): number {
  return items.reduce((sum, it) => {
    const unitG = Number(it.product?.weight ?? 0);
    const safe = Number.isFinite(unitG) ? Math.max(0, unitG) : 0;
    return sum + safe * it.quantity;
  }, 0);
}

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

    const totalWeightKg = computeTotalWeightKg(cart.items);
    const shippingFee = computeShippingFeeEUR(data.deliveryMode, totalWeightKg);

    /** ✅ NEW: calcule et persiste le poids total en grammes */
    const totalWeightGrams = computeTotalWeightGrams(cart.items);

    const order = await this.prisma.order.create({
      data: {
        userId: data.userId,
        deliveryAddress: data.deliveryAddress,
        deliveryMode: data.deliveryMode,
        shippingFee,
        total: +(total + shippingFee).toFixed(2),

        /** ✅ NEW: enregistrement en BDD (le champ doit exister côté Prisma) */
        totalWeightGrams,

        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.product.price,
            weight: Number(item.product.weight), // on ne touche pas à l’existant
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
      include: { items: { include: { product: true } } },
    });
    if (!orders) return [];
    return orders.map((order) => this.exportToOrderInterface(order));
  }

  async getOrder(orderId: number): Promise<IOrder | null> {
    const existing = await this.prisma.order.findFirst({
      where: { id: orderId },
      include: { items: { include: { product: true } } },
    });
    return this.exportToOrderInterface(existing);
  }

  async updateOrder(
    orderId: number,
    userId: number,
    data: IOrderUpdate,
  ): Promise<IOrder> {
    if (!data?.items?.length) {
      return this.update(orderId, userId, data);
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const existing = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: { include: { product: true } } },
      });

      if (!existing) throw new NotFoundException('Commande introuvable');
      if (existing.userId !== userId)
        throw new ForbiddenException(
          'Vous ne pouvez pas modifier cette commande',
        );
      if (existing.status !== 'pending')
        throw new ForbiddenException('Commande déjà payée ou non modifiable');

      const itemByProduct = new Map<number, { id: number; quantity: number }>();
      for (const it of existing.items) {
        itemByProduct.set(it.productId, { id: it.id, quantity: it.quantity });
      }

      for (const newItem of data.items) {
        const productId = Number(newItem.productId);
        const qtyToAdd = Number(newItem.quantity);
        if (
          !Number.isFinite(productId) ||
          !Number.isFinite(qtyToAdd) ||
          qtyToAdd === 0
        ) {
          continue;
        }

        const product = await tx.product.findUnique({
          where: { id: productId },
          select: { id: true, price: true },
        });
        if (!product)
          throw new NotFoundException(`Produit #${productId} introuvable`);

        const current = itemByProduct.get(productId);
        if (!current) {
          if (qtyToAdd > 0) {
            const created = await tx.orderItem.create({
              data: {
                orderId: existing.id,
                productId,
                quantity: qtyToAdd,
                unitPrice: product.price,
              },
            });
            itemByProduct.set(productId, {
              id: created.id,
              quantity: created.quantity,
            });
          }
        } else {
          const newQty = current.quantity + qtyToAdd;
          if (newQty <= 0) {
            await tx.orderItem.delete({ where: { id: current.id } });
            itemByProduct.delete(productId);
          } else {
            await tx.orderItem.update({
              where: { id: current.id },
              data: { quantity: newQty },
            });
            itemByProduct.set(productId, { id: current.id, quantity: newQty });
          }
        }
      }

      const refreshedItems = await tx.orderItem.findMany({
        where: { orderId: existing.id },
        include: { product: true },
      });

      const newTotal = refreshedItems.reduce((sum, it) => {
        const unit = Number(it.unitPrice);
        return sum + unit * it.quantity;
      }, 0);

      const mode = existing.deliveryMode as unknown as DeliveryModeEnum;
      const totalWeightKg = computeTotalWeightKg(refreshedItems);
      const shippingFee = computeShippingFeeEUR(mode, totalWeightKg);

      const totalWeightGrams = computeTotalWeightGrams(refreshedItems);

      const updatedOrder = await tx.order.update({
        where: { id: existing.id },
        data: {
          total: +(newTotal + shippingFee).toFixed(2),
          shippingFee,
          totalWeightGrams, // ✅ NEW
        },
        include: { items: { include: { product: true } } },
      });

      return updatedOrder;
    });

    return this.exportToOrderInterface(updated);
  }

  async getAllOrders(): Promise<IOrder[]> {
    const orders = await this.prisma.order.findMany({
      include: { items: { include: { product: true } } },
    });
    if (!orders) return [];
    return orders.map((order) => this.exportToOrderInterface(order));
  }

  async getUserOrder(orderId: number, userId: number): Promise<IOrder | null> {
    const existing = await this.prisma.order.findFirst({
      where: { id: orderId, userId },
      include: { items: { include: { product: true } } },
    });
    if (!existing) return null;
    return this.exportToOrderInterface(existing);
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
      const orders = await tx.order.findMany({
        where: { userId },
        select: { id: true },
      });
      if (orders.length === 0) {
        return { itemsDeleted: 0, ordersDeleted: 0 };
      }
      const orderIds = orders.map((o) => o.id);
      const itemsRes = await tx.orderItem.deleteMany({
        where: { orderId: { in: orderIds } },
      });
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
      include: { items: { include: { product: true } } },
    });

    if (!existing) throw new NotFoundException('Commande introuvable');
    if (existing.userId !== userId)
      throw new ForbiddenException(
        'Vous ne pouvez pas modifier cette commande',
      );

    const items = existing.items;
    const itemsSum = items.reduce(
      (s, it) => s + Number(it.unitPrice) * it.quantity,
      0,
    );
    const mode = existing.deliveryMode as unknown as DeliveryModeEnum;
    const totalWeightKg = computeTotalWeightKg(items);
    const shippingFee = computeShippingFeeEUR(mode, totalWeightKg);
    const grandTotal = +(itemsSum + shippingFee).toFixed(2);

    /** ✅ NEW: recalcul du poids total en grammes pour persistance */
    const totalWeightGrams = computeTotalWeightGrams(items);

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: (data.status as OrderStatus) ?? undefined,
        deliveryAddress: data.deliveryAddress ?? undefined,
        paymentIntentId: data.paymentIntentId ?? undefined,
        shippingFee,
        total: grandTotal,
        totalWeightGrams, // ✅ NEW
      },
      include: { items: { include: { product: true } } },
    });

    return this.exportToOrderInterface(updated);
  }

  private exportToOrderInterface(order: PrismaOrderWithItems): IOrder {
    return {
      id: order.id,
      deliveryAddress: order.deliveryAddress,
      userId: order.userId ?? undefined,
      total: Number(order.total),
      shippingFee: order.shippingFee,
      totalWeightGrams: Number(order.totalWeightGrams),
      status: order.status,
      createdAt: order.createdAt ?? undefined,
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
            weight: Number(item.product.weight),
            imageUrl: item.product.imageUrl ?? undefined,
            category: item.product.category ?? undefined,
          },
          orderId: item.orderId,
        }),
      ),
    };
  }
}
