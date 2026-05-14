import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { MailService } from '../src/modules/mailer/mail.service';
import { AdminMailService } from '../src/modules/mailer/admin-mail.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const prisma = app.get(PrismaService);
  const mailService = app.get(MailService);
  const adminMailService = app.get(AdminMailService);

  const orderId = 164;

  const fullOrder = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: true,
      items: { include: { product: true } },
    },
  });

  if (!fullOrder) {
    console.error(`Order ${orderId} not found`);
    await app.close();
    return;
  }

  const user = fullOrder.user;
  if (!user || !user.email) {
    console.error(`User or user email not found for order ${orderId}`);
    await app.close();
    return;
  }

  // Formatting logic
  const items = fullOrder.items.map((it) => {
    const unit = Number(it.unitPrice);
    const qty = it.quantity;
    const lineTotalNum = Number.isFinite(unit) ? unit * qty : 0;
    return {
      name: it.product?.name ?? `Produit #${it.productId}`,
      quantity: qty,
      unitPrice: Number.isFinite(unit) ? unit.toFixed(2) : '0.00',
      lineTotal: lineTotalNum.toFixed(2),
    };
  });

  const itemsSubtotalNum = items.reduce((s, i) => s + Number(i.lineTotal), 0);
  const itemsSubtotal = itemsSubtotalNum.toFixed(2);

  const shippingFeeRaw = fullOrder.shippingFee as Decimal | number;
  const shippingFeeNum = Number(shippingFeeRaw ?? 0);
  const shippingFee = shippingFeeNum.toFixed(2);

  const totalRaw = typeof fullOrder.total === 'number' ? fullOrder.total : Number(fullOrder.total ?? 0);
  const totalNum = Number.isFinite(totalRaw) ? totalRaw : itemsSubtotalNum + shippingFeeNum;
  const total = totalNum.toFixed(2);

  console.log(`Sending emails for order ${orderId} to ${user.email} and admins...`);

  try {
    // Send to client
    await mailService.sendOrderPaidEmail(user.email, {
      orderId: fullOrder.id,
      customerFirstName: user.firstName ?? undefined,
      customerLastName: user.lastName ?? undefined,
      deliveryMode: fullOrder.deliveryMode as any,
      deliveryAddress: fullOrder.deliveryAddress ?? undefined,
      items,
      itemsSubtotal,
      shippingFee,
      total,
    });
    console.log('Client email sent.');

    // Send to admins
    await adminMailService.sendOrderPaidToAdmins({
      orderId: fullOrder.id,
      customerFirstName: user.firstName ?? undefined,
      customerLastName: user.lastName ?? undefined,
      deliveryMode: fullOrder.deliveryMode as any,
      deliveryAddress: fullOrder.deliveryAddress ?? undefined,
      items,
      itemsSubtotal,
      shippingFee,
      total,
      adress: user.adress ?? undefined,
      phone: user.phone ?? undefined,
    });
    console.log('Admin emails sent.');

    console.log('All emails sent successfully!');
  } catch (error) {
    console.error('Error sending emails:', error);
  } finally {
    await app.close();
  }
}

bootstrap().catch((err) => {
  console.error('Error running script:', err);
  process.exit(1);
});
