import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  Query,
} from '@nestjs/common';
import { TrustpilotService, ITPReview } from '../service/trutpilot.service';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('Trustpilot')
@Controller('trustpilot')
export class TrustpilotController {
  private readonly logger = new Logger(TrustpilotController.name);

  constructor(private readonly trustpilotService: TrustpilotService) {}

  @Get('reviews')
  @ApiOperation({ summary: 'Récupérer les avis Trustpilot' })
  @ApiQuery({ name: 'forceRefresh', required: false, type: Boolean })
  async getReviews(
    @Query('forceRefresh') forceRefresh?: string,
  ): Promise<ITPReview[]> {
    try {
      const force = forceRefresh === 'true';
      return await this.trustpilotService.getAuthorsAndRatings(force);
    } catch (err: unknown) {
      // Gestion safe de l'erreur
      let message: string;

      if (err instanceof Error) {
        message = err.message;
      } else if (typeof err === 'string') {
        message = err;
      } else {
        try {
          message = JSON.stringify(err);
        } catch {
          message = '[unknown error]';
        }
      }

      this.logger.error(
        'Erreur lors de la récupération des avis Trustpilot',
        message,
      );
      throw new HttpException(
        'Impossible de récupérer les avis Trustpilot',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
