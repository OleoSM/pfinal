package com.example.demo.controllers;

import com.example.demo.models.Order;
import com.example.demo.models.User;
import com.example.demo.repositories.OrderRepository;
import com.example.demo.repositories.UserRepository;
import com.example.demo.services.EmailService;
import com.example.demo.services.PdfService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayInputStream;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PdfService pdfService;

    @Autowired
    private EmailService emailService;

    // 1. OBTENER TODAS LAS ORDENES
    @GetMapping
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    // 2. OBTENER ORDEN POR ID
    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderById(@PathVariable Long id) {
        return orderRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 3. CREAR UNA ORDEN
    @PostMapping
    public Order createOrder(@RequestBody Order order) {
        return orderRepository.save(order);
    }

    // 4. ACTUALIZAR ORDEN
    @PutMapping("/{id}")
    public ResponseEntity<Order> updateOrder(@PathVariable Long id, @RequestBody Order orderDetails) {
        return orderRepository.findById(id)
                .map(order -> {
                    order.setUserId(orderDetails.getUserId());
                    order.setStatus(orderDetails.getStatus());
                    order.setGrandTotal(orderDetails.getGrandTotal());
                    if (orderDetails.getItems() != null) {
                        order.setItems(orderDetails.getItems());
                    }
                    return ResponseEntity.ok(orderRepository.save(order));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // 5. ELIMINAR ORDEN
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrder(@PathVariable Long id) {
        return orderRepository.findById(id)
                .map(order -> {
                    orderRepository.delete(order);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // 6. DESCARGAR PDF (Recibo)
    @GetMapping(value = "/{id}/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<InputStreamResource> downloadReceipt(@PathVariable Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Orden no encontrada"));

        ByteArrayInputStream bis = pdfService.generateOrderReceipt(order);

        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=recibo_orden_" + id + ".pdf");

        return ResponseEntity
                .ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_PDF)
                .body(new InputStreamResource(bis));
    }

    // 7. ENVIAR CORREO
    @PostMapping("/{id}/email")
    public ResponseEntity<String> sendOrderEmail(@PathVariable Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Orden no encontrada"));

        User user = userRepository.findById(order.getUserId())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        try {
            emailService.sendOrderConfirmation(user.getEmail(), order.getId(), order.getStatus());
            return ResponseEntity.ok("Correo enviado exitosamente a " + user.getEmail());
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body("Error al enviar correo: " + e.getMessage());
        }
    }
}
