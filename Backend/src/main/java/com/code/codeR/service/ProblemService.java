package com.code.codeR.service;

import com.code.codeR.model.CodingProblem;
import com.code.codeR.repository.CodingProblemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProblemService {

    private final CodingProblemRepository problemRepository;
    private final TestcaseService testcaseService;

    public List<CodingProblem> getProblemsByCategory(Long categoryId) {
        return problemRepository.findByCategoryId(categoryId);
    }

    public List<CodingProblem> getAllProblems() {
        return problemRepository.findAll();
    }

    public CodingProblem getProblemById(Long id) {
        return problemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Problem not found with id: " + id));
    }

    @Transactional
    public CodingProblem createProblem(CodingProblem problem) {
        if (problem.getTestCases() != null) {
            problem.getTestCases().forEach(tc -> tc.setCodingProblem(problem));
        }
        return problemRepository.save(problem);
    }

    public List<CodingProblem> getProblemsByTopic(Long topicId) {
        return problemRepository.findByTopicId(topicId);
    }

    @Transactional
    public CodingProblem updateProblem(Long id, CodingProblem problemDetails) {
        CodingProblem problem = getProblemById(id);
        
        problem.setTitle(problemDetails.getTitle());
        problem.setDescription(problemDetails.getDescription());
        problem.setDifficulty(problemDetails.getDifficulty());
        problem.setMethodName(problemDetails.getMethodName());
        problem.setReturnType(problemDetails.getReturnType());
        problem.setParameters(problemDetails.getParameters());
        problem.setVisibleInput(problemDetails.getVisibleInput());
        problem.setVisibleOutput(problemDetails.getVisibleOutput());
        problem.setCategory(problemDetails.getCategory());
        problem.setTopic(problemDetails.getTopic());
        
        return problemRepository.save(problem);
    }

    @Transactional
    public void deleteProblem(Long id) {
        // Use optimized batch deletion for test cases
        testcaseService.deleteAllTestCases(id);
        
        // Delete the problem itself
        problemRepository.deleteById(id);
    }
}
