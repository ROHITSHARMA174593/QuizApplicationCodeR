package com.code.codeR.controller;

import com.code.codeR.model.CodingProblem;
import com.code.codeR.service.ProblemService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/problems")
@RequiredArgsConstructor
@CrossOrigin
public class ProblemController {

    private final ProblemService problemService;

    @GetMapping
    public ResponseEntity<List<CodingProblem>> getAllProblems() {
        return ResponseEntity.ok(problemService.getAllProblems());
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<CodingProblem>> getProblemsByCategory(@PathVariable Long categoryId) {
        return ResponseEntity.ok(problemService.getProblemsByCategory(categoryId));
    }

    @PostMapping
    public ResponseEntity<CodingProblem> createProblem(@RequestBody CodingProblem problem) {
        return ResponseEntity.ok(problemService.createProblem(problem));
    }
}
