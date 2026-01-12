package com.example.demo.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class EmailService {

    private static final String RESEND_API_URL = "https://api.resend.com/emails";

    @Value("${resend.api.key:}")
    private String resendApiKey;

    @Value("${resend.from.email:onboarding@resend.dev}")
    private String fromEmail;

    private final RestTemplate restTemplate = new RestTemplate();

    public void sendOrderConfirmation(String to, Long orderId, String status) {
        if (resendApiKey == null || resendApiKey.isEmpty()) {
            System.out.println("=== EMAIL (SIMULADO - Sin API Key) ===");
            System.out.println("To: " + to);
            System.out.println("Order ID: " + orderId);
            System.out.println("Status: " + status);
            System.out.println("======================================");
            return;
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + resendApiKey);

            String subject = "GymWear - Pedido #" + orderId + " - " + getStatusText(status);
            String htmlContent = buildEmailHtml(orderId, status);

            Map<String, Object> body = new HashMap<>();
            body.put("from", "GymWear Shop <" + fromEmail + ">");
            body.put("to", new String[]{to});
            body.put("subject", subject);
            body.put("html", htmlContent);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(
                    RESEND_API_URL, request, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                System.out.println("Email enviado exitosamente a: " + to);
            } else {
                System.out.println("Error al enviar email: " + response.getBody());
            }

        } catch (Exception e) {
            System.out.println("Error al enviar email via Resend: " + e.getMessage());
            throw new RuntimeException("Error enviando email: " + e.getMessage(), e);
        }
    }

    private String getStatusText(String status) {
        return switch (status.toLowerCase()) {
            case "pending" -> "Pendiente";
            case "processing" -> "En Proceso";
            case "shipped" -> "Enviado";
            case "delivered" -> "Entregado";
            case "cancelled" -> "Cancelado";
            default -> status;
        };
    }

    private String buildEmailHtml(Long orderId, String status) {
        String statusText = getStatusText(status);
        String statusColor = switch (status.toLowerCase()) {
            case "pending" -> "#FFA500";
            case "processing" -> "#2196F3";
            case "shipped" -> "#9C27B0";
            case "delivered" -> "#4CAF50";
            case "cancelled" -> "#F44336";
            default -> "#757575";
        };

        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; }
                    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                    .header { background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); color: white; padding: 30px; text-align: center; }
                    .header h1 { margin: 0; font-size: 28px; }
                    .content { padding: 30px; }
                    .order-info { background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; }
                    .status-badge { display: inline-block; background: %s; color: white; padding: 8px 16px; border-radius: 20px; font-weight: bold; }
                    .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>GymWear Shop</h1>
                    </div>
                    <div class="content">
                        <h2>Actualizacion de tu Pedido</h2>
                        <div class="order-info">
                            <p><strong>Numero de Pedido:</strong> #%d</p>
                            <p><strong>Estado:</strong> <span class="status-badge">%s</span></p>
                        </div>
                        <p>Gracias por tu compra. Te mantendremos informado sobre el estado de tu pedido.</p>
                    </div>
                    <div class="footer">
                        <p>GymWear Shop - Tu tienda de ropa deportiva</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(statusColor, orderId, statusText);
    }
}
