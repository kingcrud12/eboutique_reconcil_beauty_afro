import { Category, Prisma, Subcategory } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library'; // selon ta version Prisma

// Suppose que patch est bien typé :
type ServicePatch = {
  name?: string;
  duration?: number;
  price?: string | number | Decimal;
  imageUrl?: string;
  category?: Category;
  subcategory?: Subcategory;
};

export function normalizePatch(patch: ServicePatch): ServicePatch {
  // duration → nombre strict
  if (patch.duration !== undefined && patch.duration !== null) {
    patch.duration = Number(patch.duration);
  }

  // price → Prisma.Decimal
  if (patch.price !== undefined && patch.price !== null) {
    const raw = patch.price; // ← reste typé (string | number | Decimal)

    if (raw instanceof Prisma.Decimal) {
      // déjà un Decimal → on garde
      patch.price = raw;
    } else if (typeof raw === 'number') {
      patch.price = new Prisma.Decimal(raw.toString());
    } else {
      // string: trim + validation simple optionnelle
      const s = raw.trim();
      // si tu veux, tu peux vérifier via regex/Number(s) avant
      patch.price = new Prisma.Decimal(s);
    }
  }

  return patch;
}
