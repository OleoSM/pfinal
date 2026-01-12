package com.example.demo.repositories;


import com.example.demo.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // Aquí puedes agregar métodos mágicos como:
    // User findByEmail(String email);
}