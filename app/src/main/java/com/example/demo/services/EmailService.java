package com.example.demo.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Value("${spring.mail.username:}")
    private String fromEmail;

    public void sendOrderConfirmation(String to, Long orderId, String status) {
        // Email desactivado temporalmente - Railway bloquea SMTP
        System.out.println("=== EMAIL (SIMULADO) ===");
        System.out.println("From: " + fromEmail);
        System.out.println("To: " + to);
        System.out.println("Order ID: " + orderId);
        System.out.println("Status: " + status);
        System.out.println("Nota: Email no enviado - SMTP bloqueado en Railway");
        System.out.println("========================");
    }
}
