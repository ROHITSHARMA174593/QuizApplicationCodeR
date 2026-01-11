package com.code.codeR.service;

import com.code.codeR.dto.SubmissionResponse;
import com.code.codeR.model.CodingProblem;
import com.code.codeR.model.TestCase;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.file.Files;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CodeExecutionService {

    private final ProblemService problemService;
    private final com.code.codeR.repository.UserRepository userRepository;
    private final com.code.codeR.repository.UserProgressRepository userProgressRepository;

    public SubmissionResponse executeJavaCode(Long problemId, String code, String userEmail) {
        CodingProblem problem = problemService.getProblemById(problemId);
        List<TestCase> testCases = problem.getTestCases();

        if (testCases.isEmpty()) {
            return SubmissionResponse.builder()
                    .success(false)
                    .message("No test cases found for this problem.")
                    .build();
        }

        // Use the first test case as requested ("only 1 test case")
        TestCase testCase = testCases.get(0);

        String tempDir = System.getProperty("java.io.tmpdir") + File.separator + "codeR_" + UUID.randomUUID();
        File directory = new File(tempDir);
        if (!directory.mkdirs()) {
             return SubmissionResponse.builder().success(false).message("Internal Server Error: Could not create temp dir").build();
        }

        try {
            // 1. Write Code to File
            // Java class name must match file name. Assuming user submits "public class Solution"
            if (!code.contains("class Solution")) {
                 return SubmissionResponse.builder()
                    .success(false)
                    .message("Compilation Error: Public class must be named 'Solution'")
                    .build();
            }
            
            File sourceFile = new File(directory, "Solution.java");
            Files.writeString(sourceFile.toPath(), code);

            // 2. Compile
            ProcessBuilder compileProcessBuilder = new ProcessBuilder("javac", sourceFile.getAbsolutePath());
            compileProcessBuilder.directory(directory);
            Process compileProcess = compileProcessBuilder.start();
            boolean compiled = compileProcess.waitFor(10, TimeUnit.SECONDS);
            
            if (!compiled || compileProcess.exitValue() != 0) {
                 String error = new String(compileProcess.getErrorStream().readAllBytes());
                 return SubmissionResponse.builder()
                    .success(false)
                    .message("Compilation Failed")
                    .output(error)
                    .build();
            }

            // 3. Run
            ProcessBuilder runProcessBuilder = new ProcessBuilder("java", "-cp", ".", "Solution");
            runProcessBuilder.directory(directory);
            Process runProcess = runProcessBuilder.start();

            // Pass input
            try (BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(runProcess.getOutputStream()))) {
                writer.write(testCase.getInput());
                writer.flush();
            }

            // Read output
            boolean finished = runProcess.waitFor(5, TimeUnit.SECONDS);
            if (!finished) {
                runProcess.destroy();
                return SubmissionResponse.builder().success(false).message("Time Limit Exceeded").build();
            }

            String output;
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(runProcess.getInputStream()))) {
                output = reader.lines().collect(Collectors.joining("\n")).trim();
            }
            
            String errorOutput;
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(runProcess.getErrorStream()))) {
                errorOutput = reader.lines().collect(Collectors.joining("\n")).trim();
            }

            if (runProcess.exitValue() != 0) {
                 return SubmissionResponse.builder()
                    .success(false)
                    .message("Runtime Error")
                    .output(errorOutput)
                    .build();
            }

            // 4. Compare
            String expected = testCase.getExpectedOutput().trim();
            boolean passed = output.equals(expected);

            if (passed && userEmail != null) {
                updateUserProgress(userEmail);
            }

            return SubmissionResponse.builder()
                    .success(passed)
                    .message(passed ? "Accepted" : "Wrong Answer")
                    .output(output)
                    .expectedOutput(expected)
                    .build();

        } catch (Exception e) {
            return SubmissionResponse.builder()
                    .success(false)
                    .message("System Error: " + e.getMessage())
                    .build();
        } finally {
            // Cleanup
            deleteDirectory(directory);
        }
    }

    private void updateUserProgress(String email) {
        com.code.codeR.model.User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        com.code.codeR.model.UserProgress progress = userProgressRepository.findByUserId(user.getId())
                .orElse(new com.code.codeR.model.UserProgress(null, user, 0, 0));
        
        // Simple increment logic. In a real app, track *unique* problems solved.
        progress.setProblemsSolved(progress.getProblemsSolved() + 1);
        userProgressRepository.save(progress);
    }

    private void deleteDirectory(File directoryToBeDeleted) {
        File[] allContents = directoryToBeDeleted.listFiles();
        if (allContents != null) {
            for (File file : allContents) {
                deleteDirectory(file);
            }
        }
        directoryToBeDeleted.delete();
    }
}
