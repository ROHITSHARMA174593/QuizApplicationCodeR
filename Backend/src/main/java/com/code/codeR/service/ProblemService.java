package com.code.codeR.service;

import com.code.codeR.model.CodingProblem;
import com.code.codeR.repository.CodingProblemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProblemService {

    private final CodingProblemRepository problemRepository;

    public List<CodingProblem> getProblemsByCategory(Long categoryId) {
        return problemRepository.findByCategoryId(categoryId);
    }

    public List<CodingProblem> getAllProblems() {
        return problemRepository.findAll();
    }

    public CodingProblem createProblem(CodingProblem problem) {
        return problemRepository.save(problem);
    }
}
