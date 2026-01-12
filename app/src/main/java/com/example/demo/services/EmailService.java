package com.example.demo.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendOrderConfirmation(String to, Long orderId, String status) {
        System.out.println("=== INICIANDO ENVIO DE EMAIL ===");
        System.out.println("From: " + fromEmail);
        System.out.println("To: " + to);
        System.out.println("Order ID: " + orderId);
        
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject("Confirmacion de Orden #" + orderId + " - GymWear");
            message.setText("Hola,\n\n" +
                    "Tu orden con ID " + orderId + " ha sido procesada exitosamente.\n" +
                    "Estado actual: " + status + "\n\n" +
                    "Gracias por tu compra.\n" +
                    "Atte: El equipo de GymWear.");

            System.out.println("Enviando email...");
            mailSender.send(message);
            System.out.println("=== EMAIL ENVIADO EXITOSAMENTE ===");
        } catch (Exception e) {
            System.out.println("=== ERROR AL ENVIAR EMAIL ===");
            System.out.println("Error: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
}
