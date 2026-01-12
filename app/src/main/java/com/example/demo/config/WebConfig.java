package com.example.demo.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // Permitir CORS para desarrollo y produccion
        registry.addMapping("/api/**")
                .allowedOrigins(
                    "http://localhost:4200", 
                    "http://localhost:8080",
                    "https://*.railway.app",
                    "https://*.up.railway.app"
                )
                .allowedOriginPatterns("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Servir archivos estaticos del frontend desde /static/
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/")
                .resourceChain(true);
    }

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        // Redirigir rutas del SPA a index.html (excepto /api/*)
        registry.addViewController("/").setViewName("forward:/index.html");
        registry.addViewController("/categories").setViewName("forward:/index.html");
        registry.addViewController("/products").setViewName("forward:/index.html");
        registry.addViewController("/users").setViewName("forward:/index.html");
        registry.addViewController("/orders").setViewName("forward:/index.html");
        registry.addViewController("/login").setViewName("forward:/index.html");
    }
}
