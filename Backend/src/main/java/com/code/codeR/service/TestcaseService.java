package com.code.codeR.service;

import com.code.codeR.model.CodingProblem;
import com.code.codeR.model.TestCase;
import com.code.codeR.repository.CodingProblemRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TestcaseService {

    private final FileStorageService fileStorageService;
    private final CodingProblemRepository codingProblemRepository;
    // Assuming you might need a TestCaseRepository if you want to manage them directly
    // If not present, I'll rely on cascading or create it.
    // For now, I'll assume it exists or I'll implement logic via CodingProblem if possible,
    // but direct repository is better for delete/find operations on TestCases.
    private final com.code.codeR.repository.TestCaseRepository testCaseRepository; 

    public TestCase addTestCase(Long problemId, MultipartFile inputFile, MultipartFile outputFile) throws IOException {
        CodingProblem problem = codingProblemRepository.findById(problemId)
                .orElseThrow(() -> new RuntimeException("Problem not found with id: " + problemId));

        String inputKey = fileStorageService.saveInputFile(inputFile);
        String outputKey = fileStorageService.saveOutputFile(outputFile);

        TestCase testCase = new TestCase();
        testCase.setInput(inputKey);  // Storing local file name
        testCase.setExpectedOutput(outputKey); // Storing local file name
        testCase.setCodingProblem(problem);
        
        return testCaseRepository.save(testCase);
    }

    public TestCase addHiddenTestCase(Long problemId, MultipartFile input, MultipartFile output) throws IOException {
        CodingProblem problem = codingProblemRepository.findById(problemId)
                .orElseThrow(() -> new RuntimeException("Problem not found"));

        if (input.isEmpty() || output.isEmpty()) {
             throw new IllegalArgumentException("Input and Output files cannot be empty");
        }

        String inputKey = fileStorageService.saveInputFile(input);
        String outputKey = fileStorageService.saveOutputFile(output);

        TestCase testCase = new TestCase();
        testCase.setInput(inputKey); 
        testCase.setExpectedOutput(outputKey);
        testCase.setCodingProblem(problem);

        return testCaseRepository.save(testCase);
    }
    
    public List<TestCase> getTestCasesByProblemId(Long problemId) {
       CodingProblem problem = codingProblemRepository.findById(problemId)
                .orElseThrow(() -> new RuntimeException("Problem not found with id: " + problemId));
       return problem.getTestCases();
    }
    
    public InputStream getTestCaseFileStream(Long testCaseId, boolean isInput) {
        TestCase testCase = testCaseRepository.findById(testCaseId)
                .orElseThrow(() -> new RuntimeException("Testcase not found"));
        
        String key = isInput ? testCase.getInput() : testCase.getExpectedOutput();
        try {
            return fileStorageService.getFileInputStream(key, isInput);
        } catch (IOException e) {
            throw new RuntimeException("Could not read file: " + key, e);
        }
    }

    public void deleteTestCase(Long testCaseId) {
        TestCase testCase = testCaseRepository.findById(testCaseId)
                .orElseThrow(() -> new RuntimeException("Testcase not found"));

        // Delete files from Local Storage
        try {
            if (testCase.getInput() != null) fileStorageService.deleteInputFile(testCase.getInput());
            if (testCase.getExpectedOutput() != null) fileStorageService.deleteOutputFile(testCase.getExpectedOutput());
        } catch (Exception e) {
            // Log error but continue to delete from DB or rethrow
            System.err.println("Failed to delete local files: " + e.getMessage());
        }

        testCaseRepository.delete(testCase);
    }

    public void deleteAllTestCases(Long problemId) {
        CodingProblem problem = codingProblemRepository.findById(problemId)
                 .orElseThrow(() -> new RuntimeException("Problem not found with id: " + problemId));
        
        List<TestCase> testCases = problem.getTestCases();
        // Create a copy list to iterate or use repository delete
        // Using repository logic one by one to ensure local storage cleanup
        // Note: JPA might have issue if we iterate the list mapped by problem while deleting.
        // Better to fetch IDs first or use repository.findAllByProblemId if exists.
        // But since we have the list in memory:
        for (TestCase tc : List.copyOf(testCases)) {
             deleteTestCase(tc.getId());
        }
    }

    public TestCase replaceTestCase(Long problemId, MultipartFile input, MultipartFile output) throws IOException {
        deleteAllTestCases(problemId);
        return addTestCase(problemId, input, output);
    }
}
