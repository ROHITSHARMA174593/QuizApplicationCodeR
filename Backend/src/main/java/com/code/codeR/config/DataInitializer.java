package com.code.codeR.config;

import com.code.codeR.model.CodingProblem;
import com.code.codeR.model.QuizQuestion;
import com.code.codeR.model.SkillCategory;
import com.code.codeR.repository.CodingProblemRepository;
import com.code.codeR.repository.QuizQuestionRepository;
import com.code.codeR.repository.SkillCategoryRepository;
import com.code.codeR.model.User;
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
    private final QuizQuestionRepository questionRepository;
    private final CodingProblemRepository problemRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (categoryRepository.count() == 0) {
            // 1. Create Categories
            SkillCategory html = new SkillCategory(null, "HTML", "HyperText Markup Language");
            SkillCategory css = new SkillCategory(null, "CSS", "Cascading Style Sheets");
            SkillCategory js = new SkillCategory(null, "JavaScript", "Logic for the web");
            SkillCategory java = new SkillCategory(null, "Java", "Object-oriented programming");

            categoryRepository.saveAll(Arrays.asList(html, css, js, java));

            // 2. Create Quiz Questions
            // HTML Questions
            createQuestion("What does HTML stand for?", "Hyper Text Markup Language", "High Text Markup Language", "Hyper Tabular Markup Language", "None of these", "A", "Easy", html);
            createQuestion("Which tag is used for the largest heading?", "<h6>", "<h1>", "<head>", "<header>", "B", "Easy", html);

            // Java Questions
            createQuestion("Which of these is not a primitive type in Java?", "int", "float", "String", "boolean", "C", "Easy", java);
            createQuestion("What is the size of int in Java?", "16 bit", "32 bit", "64 bit", "8 bit", "B", "Medium", java);

            // 3. Create Coding Problems
            createProblem("Hello World", "Write a program that prints 'Hello World'.", "Easy", java);
            createProblem("Sum of Two Numbers", "Write a function that takes two integers and returns their sum.", "Easy", java);

            // 4. Create Default User (Test User)
            if (!userRepository.existsByEmail("test@coder.com")) {
                User user = new User();
                user.setName("Test User");
                user.setEmail("test@coder.com");
                user.setPassword(passwordEncoder.encode("password"));
                user.setRole("USER");
                userRepository.save(user);
            }

            System.out.println("--- SAMPLE DATA INITIALIZED ---");
        }
    }

    private void createQuestion(String q, String a, String b, String c, String d, String ans, String diff, SkillCategory cat) {
        QuizQuestion question = new QuizQuestion(null, q, a, b, c, d, ans, diff, cat);
        questionRepository.save(question);
    }
    
    private void createProblem(String title, String desc, String diff, SkillCategory cat) {
        CodingProblem problem = new CodingProblem(null, title, desc, diff, cat, new java.util.ArrayList<>());
        problemRepository.save(problem);
    }
}
