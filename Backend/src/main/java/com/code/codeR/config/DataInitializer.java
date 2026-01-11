package com.code.codeR.config;

import com.code.codeR.model.SkillCategory;
import com.code.codeR.model.User;
import com.code.codeR.repository.SkillCategoryRepository;
import com.code.codeR.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final SkillCategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (categoryRepository.count() == 0) {
            // 1. Create Categories (Keeping these as structural basics)
            SkillCategory html = new SkillCategory(null, "HTML", "HyperText Markup Language");
            SkillCategory css = new SkillCategory(null, "CSS", "Cascading Style Sheets");
            SkillCategory js = new SkillCategory(null, "JavaScript", "Logic for the web");
            SkillCategory java = new SkillCategory(null, "Java", "Object-oriented programming");

            categoryRepository.saveAll(Arrays.asList(html, css, js, java));
            System.out.println("--- SAMPLE CATEGORIES INITIALIZED ---");
        }

        // 4. Create Default User (Test User)
        if (!userRepository.existsByEmail("test@coder.com")) {
            User user = new User();
            user.setName("Test User");
            user.setEmail("test@coder.com");
            user.setPassword(passwordEncoder.encode("password"));
            user.setRole("USER");
            userRepository.save(user);
            System.out.println("--- TEST USER CREATED ---");
        }

        // 5. Create Default Admin
        if (!userRepository.existsByEmail("admin@coder.com")) {
            User admin = new User();
            admin.setName("Admin User");
            admin.setEmail("admin@coder.com");
            admin.setPassword(passwordEncoder.encode("admin"));
            admin.setRole("ADMIN");
            userRepository.save(admin);
            System.out.println("--- ADMIN USER CREATED ---");
        }
    }


}
