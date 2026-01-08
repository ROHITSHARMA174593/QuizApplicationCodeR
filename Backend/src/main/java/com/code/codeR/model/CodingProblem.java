package com.code.codeR.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CodingProblem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(nullable = false)
    private String difficulty; // Easy, Medium, Hard

    @ManyToOne
    @JoinColumn(name = "category_id", nullable = false)
    private SkillCategory category;

    @OneToMany(mappedBy = "codingProblem", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.List<TestCase> testCases = new java.util.ArrayList<>();
}
