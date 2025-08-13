import {
  Body,
  Controller,
  ForbiddenException,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { JwtRequest } from 'src/modules/auth/jwt/Jwt-request.interface';
import { PrismaService } from 'src/prisma/prisma.service';
import { Inject } from '@nestjs/common';
import { STRIPE_CLIENT } from './stripe.provider';
import Stripe from 'stripe';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';

class CreatePaymentIntentDto {
  @ApiProperty({ example: 123, description: 'ID de la commande' })
  @IsNotEmpty()
  @IsInt()
  orderId!: number;

  @ApiProperty({ example: 42, description: "ID de l'utilisateur propriétaire" })
  @IsNotEmpty()
  @IsInt()
  userId!: number;
}

@ApiTags('Payments')
@Controller('payments')
export class PaymentController {
  constructor(
    private readonly payments: PaymentService,
    private readonly prisma: PrismaService,
    @Inject(STRIPE_CLIENT) private readonly stripe: Stripe,
  ) {}

  @Post('intent')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Créer un PaymentIntent Stripe pour une commande (retourne client_secret)',
  })
  @ApiResponse({
    status: 200,
    description: 'PaymentIntent créé',
    schema: {
      type: 'object',
      properties: {
        clientSecret: { type: 'string' },
        paymentIntentId: { type: 'string' },
      },
    },
  })
  async createPaymentIntent(
    @Body() dto: CreatePaymentIntentDto,
  ): Promise<{ clientSecret: string | null; paymentIntentId: string }> {
    return this.payments.createPaymentIntent(dto.orderId, dto.userId);
  }

  @Post('checkout/:orderId')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary:
      'Créer une session Stripe Checkout pour la commande (retourne une URL de redirection)',
  })
  @ApiResponse({
    status: 201,
    description: 'Session Checkout créée',
    schema: {
      type: 'object',
      properties: { url: { type: 'string' } },
    },
  })
  @UseGuards(JwtAuthGuard)
  async createCheckoutSession(
    @Param('orderId', ParseIntPipe) orderId: number,
    @Req() req: JwtRequest,
  ): Promise<{ url: string }> {
    const userId = req.user?.userId;

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { product: true } } },
    });

    if (!order) throw new NotFoundException('Commande introuvable');
    if (order.userId !== userId) throw new ForbiddenException('Accès refusé');

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
      order.items.map((it) => ({
        price_data: {
          currency: 'eur',
          product_data: {
            name: it.product.name,
          },
          unit_amount: Math.round(Number(it.unitPrice) * 100), // centimes
        },
        quantity: it.quantity,
      }));

    const frontendUrl = process.env.FRONTEND_URL;
    if (!frontendUrl) {
      throw new Error(
        'FRONTEND_URL manquant dans les variables d’environnement',
      );
    }

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card', 'paypal'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${frontendUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/checkout/cancel`,
      customer_email: req.user.email,
      metadata: {
        orderId: String(order.id),
        userId: String(userId),
      },
      payment_intent_data: {
        metadata: { orderId: String(order.id), userId: String(userId) },
      },
    });

    if (!session.url) {
      throw new Error('Impossible de créer la session de paiement Stripe');
    }

    return { url: session.url };
  }

  @Post('slots/checkout/:slotId')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary:
      'Créer une session Stripe Checkout pour réserver un créneau (slot) avec acompte',
  })
  @ApiResponse({
    status: 201,
    description: 'Session Checkout créée pour le slot',
    schema: {
      type: 'object',
      properties: { url: { type: 'string' } },
    },
  })
  @UseGuards(JwtAuthGuard)
  async createSlotCheckoutSession(
    @Param('slotId', ParseIntPipe) slotId: number,
  ): Promise<{ url: string }> {
    return this.payments.createSlotCheckout(slotId);
  }
}
