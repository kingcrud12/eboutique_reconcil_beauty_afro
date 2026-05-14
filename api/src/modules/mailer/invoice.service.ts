import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';

@Injectable()
export class InvoiceService {
  async generateInvoicePdf(order: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        resolve(Buffer.concat(buffers));
      });
      doc.on('error', reject);

      // Header
      doc
        .fillColor('#444444')
        .fontSize(20)
        .text('Reconcil Afro Beauty', 50, 57)
        .fontSize(10)
        .text('Reconcil Afro Beauty', 200, 50, { align: 'right' })
        .text('23 allée de la résidence du bois pommier', 200, 65, { align: 'right' })
        .text('91390 Morsang-sur-Orge, France', 200, 80, { align: 'right' })
        .moveDown();

      // Horizontal line
      doc.moveTo(50, 100).lineTo(550, 100).stroke();

      // Invoice info
      doc
        .fontSize(12)
        .text(`Facture #INV-${order.orderId || order.id}`, 50, 120)
        .text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, 50, 135)
        .moveDown();

      // Customer info
      const firstName = order.customerFirstName || order.user?.firstName || '';
      const lastName = order.customerLastName || order.user?.lastName || '';
      const deliveryMode = order.deliveryMode === 'HOME' ? 'Livraison à domicile' : (order.deliveryMode === 'RELAY' ? 'Livraison en Point Relais' : order.deliveryMode);

      doc
        .fontSize(12)
        .text('Facturé à:', 50, 160)
        .fontSize(10)
        .text(`${firstName} ${lastName}`, 50, 175)
        .text(order.deliveryAddress || 'Adresse non spécifiée', 50, 190)
        .text(`Mode de livraison: ${deliveryMode || 'Non spécifié'}`, 50, 205)
        .moveDown();

      // Table Header
      const tableTop = 250;
      doc
        .font('Helvetica-Bold')
        .fontSize(10)
        .text('Article', 50, tableTop)
        .text('Qté', 280, tableTop, { width: 50, align: 'right' })
        .text('Prix Unit.', 340, tableTop, { width: 90, align: 'right' })
        .text('Total', 440, tableTop, { width: 100, align: 'right' });

      doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

      // Table Content
      let currentY = tableTop + 25;
      doc.font('Helvetica');
      const items = order.items || [];
      items.forEach((item: any) => {
        const unitPrice = Number(item.unitPrice || 0);
        const quantity = Number(item.quantity || 0);
        const lineTotal = Number(item.lineTotal || unitPrice * quantity);

        doc
          .fontSize(10)
          .text(item.name || item.product?.name || `Produit #${item.productId || '?'}`, 50, currentY)
          .text(quantity.toString(), 280, currentY, { width: 50, align: 'right' })
          .text(unitPrice.toFixed(2) + ' €', 340, currentY, { width: 90, align: 'right' })
          .text(lineTotal.toFixed(2) + ' €', 440, currentY, { width: 100, align: 'right' });

        currentY += 20;
      });

      // Totals
      doc.moveTo(50, currentY).lineTo(550, currentY).stroke();
      currentY += 10;

      const itemsSubtotal = Number(order.itemsSubtotal || 0);
      const shippingFee = Number(order.shippingFee || 0);
      const total = Number(order.total || 0);

      doc
        .fontSize(10)
        .text('Sous-total:', 340, currentY, { width: 90, align: 'right' })
        .text(itemsSubtotal.toFixed(2) + ' €', 440, currentY, { width: 100, align: 'right' });

      currentY += 15;
      doc
        .text('Frais de port:', 340, currentY, { width: 90, align: 'right' })
        .text(shippingFee.toFixed(2) + ' €', 440, currentY, { width: 100, align: 'right' });

      currentY += 20;
      doc
        .font('Helvetica-Bold')
        .fontSize(12)
        .text('TOTAL:', 340, currentY, { width: 90, align: 'right' })
        .text(total.toFixed(2) + ' €', 440, currentY, { width: 100, align: 'right' });

      // Footer
      doc
        .fontSize(10)
        .text('Merci pour votre confiance !', 50, 700, { align: 'center', width: 500 });

      doc.end();
    });
  }
}
