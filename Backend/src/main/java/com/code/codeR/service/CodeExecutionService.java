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
    private final S3Service s3Service;

    public SubmissionResponse runVisibleTest(Long problemId, String userCode, String userEmail) {
        CodingProblem problem = problemService.getProblemById(problemId);

        try {
            securityValidator.validate(userCode);
        } catch (SecurityException e) {
            return SubmissionResponse.builder().success(false).message(e.getMessage()).build();
        }

        return executeInternally(problem, userCode, userEmail, true);
    }

    public SubmissionResponse submitCode(Long problemId, String userCode, String userEmail) {
        CodingProblem problem = problemService.getProblemById(problemId);
        
        try {
            securityValidator.validate(userCode);
        } catch (SecurityException e) {
            return SubmissionResponse.builder().success(false).message(e.getMessage()).build();
        }

        return executeInternally(problem, userCode, userEmail, false);
    }

    private SubmissionResponse executeInternally(CodingProblem problem, String userCode, String userEmail, boolean visibleOnly) {
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
                    .output(error.replace(tempDir, "")) 
                    .build();
            }

            // 4. Run against Test Cases
            boolean allPassed = true;
            String lastOutput = "";
            String lastExpected = "";

            // A. Visible Test Case
            if (problem.getVisibleInput() != null && problem.getVisibleOutput() != null) {
                lastExpected = problem.getVisibleOutput().trim();
                lastOutput = runTestCase(directory, problem.getVisibleInput());
                
                if (lastOutput.startsWith("ERROR:")) {
                    return SubmissionResponse.builder()
                        .success(false)
                        .message(lastOutput.replace("ERROR:", "").trim())
                        .build();
                }

                if (!lastOutput.equals(lastExpected)) {
                     return SubmissionResponse.builder()
                        .success(false)
                        .message("Wrong Answer on Visible Test Case")
                        .output(lastOutput)
                        .expectedOutput(lastExpected)
                        .build();
                }
            }

            // B. Hidden Test Cases
            if (!visibleOnly) {
                 List<TestCase> hiddenTestCases = problem.getTestCases();
                 for (TestCase tc : hiddenTestCases) {
                      String inputKey = tc.getInput();
                      String outputKey = tc.getExpectedOutput();
                      
                      String inputContent = readStreamToString(s3Service.getFileStream(inputKey));
                      String expectedContent = readStreamToString(s3Service.getFileStream(outputKey)).trim();
                      
                      String outputContent = runTestCase(directory, inputContent);
                      
                      if (outputContent.startsWith("ERROR:")) {
                            return SubmissionResponse.builder()
                                .success(false)
                                .message(outputContent.replace("ERROR:", "").trim())
                                .build();
                      }
                      
                      if (!outputContent.equals(expectedContent)) {
                           return SubmissionResponse.builder()
                                .success(false)
                                .message("Wrong Answer on Hidden Test Case")
                                .output(outputContent)
                                .expectedOutput("Hidden")
                                .build();
                      }
                 }
            }

            if (userEmail != null) {
                updateUserProgress(userEmail);
            }

            return SubmissionResponse.builder()
                    .success(true)
                    .message("Accepted")
                    .output(lastOutput)
                    .expectedOutput(lastExpected)
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

    private String runTestCase(File directory, String input) throws IOException, InterruptedException {
        String[] inputArgs = input.split("\\s+"); 
        
        ProcessBuilder runProcessBuilder = new ProcessBuilder("java", "-cp", ".", "Main");
        runProcessBuilder.command().addAll(java.util.Arrays.asList(inputArgs));
        runProcessBuilder.directory(directory);
        
        Process runProcess = runProcessBuilder.start();

        boolean finished = runProcess.waitFor(2, TimeUnit.SECONDS); 
        if (!finished) {
            runProcess.destroy();
            return "ERROR: Time Limit Exceeded";
        }

        if (runProcess.exitValue() != 0) {
             String errorOutput;
             try (BufferedReader reader = new BufferedReader(new InputStreamReader(runProcess.getErrorStream()))) {
                 errorOutput = reader.lines().collect(Collectors.joining("\n")).trim();
             }
             return "ERROR: Runtime Error: " + errorOutput;
        }

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(runProcess.getInputStream()))) {
            return reader.lines().collect(Collectors.joining("\n")).trim();
        }
    }

    private String readStreamToString(InputStream inputStream) throws IOException {
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream))) {
             return reader.lines().collect(Collectors.joining("\n"));
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
