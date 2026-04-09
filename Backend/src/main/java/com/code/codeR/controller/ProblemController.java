package com.code.codeR.controller;

import com.code.codeR.dto.SubmissionRequest;
import com.code.codeR.dto.SubmissionResponse;
import com.code.codeR.model.CodingProblem;
import com.code.codeR.service.ProblemService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/problems")
@RequiredArgsConstructor
@CrossOrigin
public class ProblemController {

    private final ProblemService problemService;
    private final com.code.codeR.service.CodeExecutionService codeExecutionService;

    @GetMapping
    public ResponseEntity<List<com.code.codeR.dto.ProblemDTO>> getAllProblems(Principal principal) {
        String email = (principal != null) ? principal.getName() : null;
        return ResponseEntity.ok(problemService.getAllProblemsWithStatus(email));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CodingProblem> getProblemById(@PathVariable Long id) {
        return ResponseEntity.ok(problemService.getProblemById(id));
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<SubmissionResponse> submitProblem(@PathVariable Long id, @RequestBody SubmissionRequest request, Principal principal) {
        String email = (principal != null) ? principal.getName() : null;
        return ResponseEntity.ok(codeExecutionService.submitCode(id, request.getCode(), email));
    }

    @PostMapping("/{id}/run")
    public ResponseEntity<SubmissionResponse> runProblem(@PathVariable Long id, @RequestBody SubmissionRequest request, Principal principal) {
        String email = (principal != null) ? principal.getName() : null;
        return ResponseEntity.ok(codeExecutionService.runVisibleTest(id, request.getCode(), email));
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<com.code.codeR.dto.ProblemDTO>> getProblemsByCategory(@PathVariable Long categoryId, Principal principal) {
        String email = (principal != null) ? principal.getName() : null;
        return ResponseEntity.ok(problemService.getProblemsByCategoryWithStatus(categoryId, email));
    }

    @PostMapping
    public ResponseEntity<CodingProblem> createProblem(@RequestBody CodingProblem problem) {
        return ResponseEntity.ok(problemService.createProblem(problem));
    }

    @GetMapping("/topic/{topicId}")
    public ResponseEntity<List<CodingProblem>> getProblemsByTopic(@PathVariable Long topicId) {
        return ResponseEntity.ok(problemService.getProblemsByTopic(topicId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CodingProblem> updateProblem(@PathVariable Long id, @RequestBody CodingProblem problem) {
        return ResponseEntity.ok(problemService.updateProblem(id, problem));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProblem(@PathVariable Long id) {
        problemService.deleteProblem(id);
        return ResponseEntity.noContent().build();
    }
}
