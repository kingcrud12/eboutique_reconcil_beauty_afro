import {
  Body,
  Controller,
  Post,
  Delete,
  Param,
  HttpStatus,
  HttpException,
  ParseIntPipe,
  Get,
  Req,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { CartService } from '../Services/cart.service';
import { CreateCartDto, UpdateCartDto } from '../Models/cart.dto';
import {
  ICart,
  ICartCreate,
  ICartCreateUpdate,
} from '../Interfaces/cart.interface';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/jwt/jwt-auth.guard';
import { JwtRequest } from '../../auth/jwt/Jwt-request.interface';
import { PrismaService } from 'src/prisma/prisma.service';

@ApiTags('Cart')
@Controller('carts')
export class CartController {
  constructor(
    private readonly cartService: CartService,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Créer un panier',
  })
  async create(@Body() createCartDto: CreateCartDto): Promise<ICartCreate> {
    try {
      const cart: ICartCreate = this.mapToCartCreate(createCartDto);
      return await this.cartService.create(cart);
    } catch {
      throw new HttpException(
        'Erreur lors de la création du panier',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('users/me')
  @ApiOperation({
    summary: 'récupérer tous mes paniers',
  })
  async getUserCarts(@Req() req: JwtRequest): Promise<ICart[]> {
    const userId = req.user.userId;

    const carts = await this.cartService.getCartsByUser(userId);

    if (!carts) {
      return [];
    }

    return carts;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('users/me/:id')
  @ApiOperation({
    summary: 'Modifier un panier',
  })
  @ApiResponse({ status: 200, description: 'Panier mis à jour avec succès' })
  async update(
    @Req() req: JwtRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCartDto: UpdateCartDto,
  ): Promise<ICart> {
    const userId = req.user.userId;
    const cart = await this.cartService.getCartById(id);

    if (!cart) {
      throw new HttpException('Panier introuvable', HttpStatus.NOT_FOUND);
    }

    if (cart.userId !== userId) {
      throw new HttpException(
        'Accès interdit à ce panier',
        HttpStatus.FORBIDDEN,
      );
    }

    try {
      const updateData: ICartCreateUpdate = this.mapToCartUpdate(updateCartDto);
      return await this.cartService.updateCart(id, updateData);
    } catch {
      throw new HttpException(
        'Erreur lors de la mise à jour du panier',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Supprimer un panier',
  })
  @Delete('users/me/:id')
  @ApiResponse({ status: 200, description: 'Panier supprimé avec succès' })
  async delete(
    @Req() req: JwtRequest,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ICart> {
    const userId = req.user.userId;
    const cart = await this.cartService.getCartById(id);

    if (!cart) {
      throw new HttpException('Panier introuvable', HttpStatus.NOT_FOUND);
    }

    if (cart.userId !== userId) {
      throw new HttpException(
        'Accès interdit à ce panier',
        HttpStatus.FORBIDDEN,
      );
    }

    try {
      return await this.cartService.deleteCart(id);
    } catch {
      throw new HttpException(
        'Erreur lors de la suppression du panier',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('users/me/:id')
  @ApiOperation({
    summary: 'Récupérer un panier',
  })
  async get(
    @Req() req: JwtRequest,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ICart> {
    const cart = await this.cartService.getCartById(id);

    if (!cart) {
      throw new HttpException('Panier introuvable', HttpStatus.NOT_FOUND);
    }

    return cart;
  }

  private mapToCartCreate(dto: CreateCartDto): ICartCreate {
    return {
      userId: dto.userId,
      guestId: dto.guestId,
      items: dto.items?.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
    };
  }

  private mapToCartUpdate(dto: UpdateCartDto): ICartCreateUpdate {
    return {
      userId: dto.userId,
      guestId: dto.guestId,
      items: dto.items?.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
    };
  }

  @Post(':guestId')
  async createGuestCart(
    @Param('guestId') guestId: string,
    @Body() data: ICartCreateUpdate,
  ) {
    // Vérifier si le guest existe
    let guest = await this.prisma.guest.findUnique({
      where: { id: Number(guestId) },
    });

    if (!guest) {
      guest = await this.prisma.guest.create({
        data: { id: Number(guestId) },
      });
    }

    // Filtrer les items valides
    const itemsForCreate = (data.items ?? [])
      .filter((item) => item.productId != null)
      .map((item) => ({
        productId: item.productId,
        quantity: item.quantity ?? 1,
      }));

    const cart = await this.cartService.create({
      guestId: guest.id,
      items: itemsForCreate,
    });

    return cart;
  }

  // Récupérer le panier par guestId
  @Get(':guestId')
  async getCart(@Param('guestId') guestId: string) {
    const cart = await this.prisma.cart.findFirst({
      where: { guestId: Number(guestId) },
      include: { items: { include: { product: true } } },
    });

    return cart || null;
  }

  @Patch(':guestId')
  async updateGuestCart(@Param('guestId') guestId: string) {
    const cart = await this.prisma.cart.findFirst({
      where: { guestId: Number(guestId) },
      include: { items: { include: { product: true } } },
    });

    // Normaliser userId/guestId pour TypeScript
    return {
      ...cart,
      userId: cart.userId ?? null,
      guestId: cart.guestId ?? null,
    };
  }
}
