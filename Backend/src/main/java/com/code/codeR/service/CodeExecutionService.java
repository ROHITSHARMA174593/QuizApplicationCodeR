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
    private final CodeSecurityValidator securityValidator;
    private final MainMethodGenerator mainMethodGenerator;

    public SubmissionResponse executeJavaCode(Long problemId, String userCode, String userEmail) {
        CodingProblem problem = problemService.getProblemById(problemId);
        List<TestCase> testCases = problem.getTestCases();

        if (testCases.isEmpty()) {
            return SubmissionResponse.builder().success(false).message("No test cases found for this problem.").build();
        }

        // 1. Security Check
        try {
            securityValidator.validate(userCode);
        } catch (SecurityException e) {
            return SubmissionResponse.builder().success(false).message(e.getMessage()).build();
        }

        String tempDir = System.getProperty("java.io.tmpdir") + File.separator + "codeR_" + UUID.randomUUID();
        File directory = new File(tempDir);
        if (!directory.mkdirs()) {
             return SubmissionResponse.builder().success(false).message("Internal Server Error: Could not create temp dir").build();
        }

        try {
            // 2. Generate Code
            String mainCode = mainMethodGenerator.generateMainClass(problem);
            String solutionCode;
            if (userCode.contains("class Solution")) {
                solutionCode = userCode;
            } else {
                solutionCode = "public class Solution {\n" + userCode + "\n}";
            }

            Files.writeString(new File(directory, "Main.java").toPath(), mainCode);
            Files.writeString(new File(directory, "Solution.java").toPath(), solutionCode);

            // 3. Compile
            ProcessBuilder compileProcessBuilder = new ProcessBuilder("javac", "Main.java", "Solution.java");
            compileProcessBuilder.directory(directory);
            Process compileProcess = compileProcessBuilder.start();
            boolean compiled = compileProcess.waitFor(10, TimeUnit.SECONDS);
            
            if (!compiled || compileProcess.exitValue() != 0) {
                 String error = new String(compileProcess.getErrorStream().readAllBytes());
                 return SubmissionResponse.builder()
                    .success(false)
                    .message("Compilation Failed")
                    .output(error.replace(tempDir, "")) // Hide path
                    .build();
            }

            // 4. Run against Test Cases
            // We use the first test case primarily as per MVP scope.
            TestCase testCase = testCases.get(0);
            String input = testCase.getInput(); 
            
            // Handle splitting input string into args safely
            // For simple int/string inputs, split by whitespace works.
            String[] inputArgs = input.split("\\s+"); 
            
            ProcessBuilder runProcessBuilder = new ProcessBuilder("java", "-cp", ".", "Main");
            runProcessBuilder.command().addAll(java.util.Arrays.asList(inputArgs));
            runProcessBuilder.directory(directory);
            
            Process runProcess = runProcessBuilder.start();

            boolean finished = runProcess.waitFor(2, TimeUnit.SECONDS); // 2s Time Limit
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

            // 5. Compare
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
            deleteDirectory(directory);
        }
    }

    private void updateUserProgress(String email) {
        com.code.codeR.model.User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        com.code.codeR.model.UserProgress progress = userProgressRepository.findByUserId(user.getId())
                .orElse(new com.code.codeR.model.UserProgress(null, user, 0, 0));
        
        progress.setProblemsSolved(progress.getProblemsSolved() + 1);
        userProgressRepository.save(progress);
    }

    private void deleteDirectory(File directoryToBeDeleted) {
        if (directoryToBeDeleted == null || !directoryToBeDeleted.exists()) return;
        File[] allContents = directoryToBeDeleted.listFiles();
        if (allContents != null) {
            for (File file : allContents) {
                deleteDirectory(file);
            }
        }
        directoryToBeDeleted.delete();
    }
}
