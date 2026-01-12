package com.example.demo.services;

import com.example.demo.models.Order;
import com.example.demo.models.OrderItem;
import com.itextpdf.text.*;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;

@Service
public class PdfService {

    public ByteArrayInputStream generateOrderReceipt(Order order) {
        Document document = new Document();
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // 1. Titulo
            Font fontTitle = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20);
            Paragraph title = new Paragraph("Comprobante de Compra - GymWear", fontTitle);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);
            document.add(Chunk.NEWLINE);

            // 2. Info de la Orden
            Font fontBold = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);
            Font fontNormal = FontFactory.getFont(FontFactory.HELVETICA, 12);
            
            document.add(new Paragraph("Orden ID: " + order.getId(), fontBold));
            document.add(new Paragraph("Estado: " + (order.getStatus() != null ? order.getStatus() : "N/A"), fontNormal));
            document.add(new Paragraph("Total: $" + (order.getGrandTotal() != null ? order.getGrandTotal() : "0.00"), fontBold));
            document.add(Chunk.NEWLINE);

            // 3. Tabla de Productos
            PdfPTable table = new PdfPTable(3);
            table.setWidthPercentage(100);
            table.setSpacingBefore(10f);
            
            // Headers con estilo
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, BaseColor.WHITE);
            PdfPCell header1 = new PdfPCell(new Phrase("Producto ID", headerFont));
            header1.setBackgroundColor(new BaseColor(79, 70, 229)); // Indigo
            header1.setPadding(8f);
            table.addCell(header1);
            
            PdfPCell header2 = new PdfPCell(new Phrase("Cantidad", headerFont));
            header2.setBackgroundColor(new BaseColor(79, 70, 229));
            header2.setPadding(8f);
            table.addCell(header2);
            
            PdfPCell header3 = new PdfPCell(new Phrase("Precio Unitario", headerFont));
            header3.setBackgroundColor(new BaseColor(79, 70, 229));
            header3.setPadding(8f);
            table.addCell(header3);

            // Filas de items
            if (order.getItems() != null && !order.getItems().isEmpty()) {
                for (OrderItem item : order.getItems()) {
                    String productId = item.getProductVariantId() != null 
                        ? item.getProductVariantId().toString() 
                        : "N/A";
                    String quantity = item.getQuantity() != null 
                        ? item.getQuantity().toString() 
                        : "0";
                    String price = item.getUnitPrice() != null 
                        ? "$" + item.getUnitPrice().toString() 
                        : "$0.00";
                    
                    PdfPCell cell1 = new PdfPCell(new Phrase(productId, fontNormal));
                    cell1.setPadding(6f);
                    table.addCell(cell1);
                    
                    PdfPCell cell2 = new PdfPCell(new Phrase(quantity, fontNormal));
                    cell2.setPadding(6f);
                    table.addCell(cell2);
                    
                    PdfPCell cell3 = new PdfPCell(new Phrase(price, fontNormal));
                    cell3.setPadding(6f);
                    table.addCell(cell3);
                }
            } else {
                PdfPCell noItems = new PdfPCell(new Phrase("No hay items en esta orden", fontNormal));
                noItems.setColspan(3);
                noItems.setPadding(10f);
                noItems.setHorizontalAlignment(Element.ALIGN_CENTER);
                table.addCell(noItems);
            }
            
            document.add(table);
            
            // 4. Pie de pagina
            document.add(Chunk.NEWLINE);
            Font footerFont = FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 10, BaseColor.GRAY);
            Paragraph footer = new Paragraph("Gracias por tu compra - GymWear", footerFont);
            footer.setAlignment(Element.ALIGN_CENTER);
            document.add(footer);

            document.close();

        } catch (DocumentException e) {
            e.printStackTrace();
        }

        return new ByteArrayInputStream(out.toByteArray());
    }
}
