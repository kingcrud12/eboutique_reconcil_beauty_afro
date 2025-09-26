import { Injectable, Logger } from '@nestjs/common';

export interface ITPReview {
  name: string | null;
  rating: number | null;
  date?: string | null;
  text?: string | null;
  id?: string | null;
}

interface JsonReviewRating {
  ratingValue?: string | number;
}

interface JsonAuthor {
  name?: string;
}

interface JsonReviewNode {
  '@type'?: string;
  '@id'?: string;
  author?: JsonAuthor;
  reviewRating?: JsonReviewRating;
  datePublished?: string;
  reviewBody?: string;
  headline?: string;
  review?: JsonReviewNode[];
}

interface JsonLd {
  '@graph'?: JsonReviewNode[];
  '@type'?: string;
  [key: string]: unknown;
}

@Injectable()
export class TrustpilotService {
  private readonly logger = new Logger(TrustpilotService.name);

  private cache: { ts: number; data: ITPReview[] } | null = null;
  private readonly TTL_MS = 5 * 60 * 1000;

  private readonly TRUSTPILOT_URL =
    'https://fr.trustpilot.com/review/eboutique-reconcil-beauty-afro.vercel.app';

  async getAuthorsAndRatings(forceRefresh = false): Promise<ITPReview[]> {
    const now = Date.now();
    if (!forceRefresh && this.cache && now - this.cache.ts < this.TTL_MS) {
      return this.cache.data;
    }

    try {
      const response = await fetch(this.TRUSTPILOT_URL, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; NestServer/1.0)',
          Accept: 'text/html',
        },
      });

      if (!response.ok) {
        this.logger.error(`Failed to fetch page: ${response.status}`);
        return [];
      }

      const html = await response.text();
      const reviews = this.parseReviewsFromHtml(html);

      this.cache = { ts: now, data: reviews };
      return reviews;
    } catch (err: unknown) {
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

      this.logger.error('Error fetching Trustpilot page', message);
      return [];
    }
  }

  private parseReviewsFromHtml(html: string): ITPReview[] {
    const results: ITPReview[] = [];
    const regex =
      /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(html)) !== null) {
      try {
        const data: unknown = JSON.parse(match[1]);
        const nodes: JsonReviewNode[] = (data as JsonLd)['@graph'] ?? [
          data as JsonReviewNode,
        ];

        nodes.forEach((node) => {
          // ✅ On ne garde que les vrais Review nodes
          if (node['@type'] === 'Review') {
            results.push(this.mapNodeToReview(node));
          }
        });
      } catch {
        // ignore JSON parse errors
      }
    }

    // Dé-duplication
    const deduped: ITPReview[] = [];
    const seen = new Set<string>();
    results.forEach((r) => {
      const key =
        r.id ??
        `${r.name ?? 'n'}|${r.date ?? 'd'}|${(r.text ?? '').slice(0, 40)}`;
      if (!seen.has(key)) {
        seen.add(key);
        deduped.push(r);
      }
    });

    return deduped;
  }

  private mapNodeToReview(node: JsonReviewNode): ITPReview {
    return {
      name: node.author?.name ?? null,
      rating: node.reviewRating?.ratingValue
        ? Number(node.reviewRating.ratingValue)
        : null,
      date: node.datePublished ?? null,
      text: node.reviewBody ?? node.headline ?? null,
      id: node['@id'] ?? null,
    };
  }

  clearCache() {
    this.cache = null;
  }
}
