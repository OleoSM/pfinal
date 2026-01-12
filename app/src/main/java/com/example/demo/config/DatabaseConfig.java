package com.example.demo.config;

import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import javax.sql.DataSource;
import java.net.URI;
import java.net.URISyntaxException;

@Configuration
public class DatabaseConfig {

    @Bean
    public DataSource dataSource() throws URISyntaxException {
        String databaseUrl = System.getenv("DATABASE_URL");
        
        if (databaseUrl != null && databaseUrl.startsWith("postgres://")) {
            // Railway/Heroku format: postgres://user:password@host:port/database
            URI dbUri = new URI(databaseUrl);
            
            String username = dbUri.getUserInfo().split(":")[0];
            String password = dbUri.getUserInfo().split(":")[1];
            String jdbcUrl = "jdbc:postgresql://" + dbUri.getHost() + ":" + dbUri.getPort() + dbUri.getPath();
            
            // Agregar SSL si es necesario para Railway
            if (!jdbcUrl.contains("?")) {
                jdbcUrl += "?sslmode=require";
            }
            
            return DataSourceBuilder.create()
                    .url(jdbcUrl)
                    .username(username)
                    .password(password)
                    .driverClassName("org.postgresql.Driver")
                    .build();
        }
        
        // Local development - usar valores por defecto
        String localUrl = System.getenv("JDBC_DATABASE_URL");
        if (localUrl == null) {
            localUrl = "jdbc:postgresql://localhost:5433/gymwear";
        }
        
        return DataSourceBuilder.create()
                .url(localUrl)
                .username(System.getenv().getOrDefault("DB_USERNAME", "postgres"))
                .password(System.getenv().getOrDefault("DB_PASSWORD", "postgres"))
                .driverClassName("org.postgresql.Driver")
                .build();
    }
}
