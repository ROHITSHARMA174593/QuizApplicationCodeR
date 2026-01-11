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
    private final com.code.codeR.service.CodeExecutionService codeExecutionService;

    @GetMapping
    public ResponseEntity<List<CodingProblem>> getAllProblems() {
        return ResponseEntity.ok(problemService.getAllProblems());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CodingProblem> getProblemById(@PathVariable Long id) {
        return ResponseEntity.ok(problemService.getProblemById(id));
    }

    @PostMapping("/solve")
    public ResponseEntity<com.code.codeR.dto.SubmissionResponse> solveProblem(
            @RequestBody com.code.codeR.dto.SubmissionRequest request,
            java.security.Principal principal
    ) {
        String email = (principal != null) ? principal.getName() : null;
        return ResponseEntity.ok(codeExecutionService.executeJavaCode(request.getProblemId(), request.getCode(), email));
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
