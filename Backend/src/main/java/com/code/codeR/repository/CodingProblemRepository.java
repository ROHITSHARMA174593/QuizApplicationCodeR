package com.code.codeR.repository;

import com.code.codeR.model.CodingProblem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CodingProblemRepository extends JpaRepository<CodingProblem, Long> {
    List<CodingProblem> findByCategoryId(Long categoryId);
}
