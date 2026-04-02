package com.code.codeR.service;

import com.code.codeR.dto.SubmissionResponse;
import com.code.codeR.model.CodingProblem;
import com.code.codeR.model.TestCase;
import com.code.codeR.model.User;
import com.code.codeR.model.UserProgress;
import com.code.codeR.repository.CodingProblemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.*;
import java.nio.file.Files;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CodeExecutionService {

    private final CodingProblemRepository problemRepository;
    private final com.code.codeR.repository.UserRepository userRepository;
    private final com.code.codeR.repository.UserProgressRepository userProgressRepository;
    private final CodeSecurityValidator securityValidator;
    private final MainMethodGenerator mainMethodGenerator;
    private final FileStorageService fileStorageService;

    @Transactional(readOnly = true)
    public SubmissionResponse runVisibleTest(Long problemId, String userCode, String userEmail) {
        // Use optimized fetch to get problem and test cases in one hit if needed, 
        // though visible tests don't strictly need hidden test cases, 
        // using the same optimized method is fine.
        CodingProblem problem = problemRepository.findByIdWithTestCases(problemId)
                .orElseThrow(() -> new RuntimeException("Problem not found"));

        try {
            securityValidator.validate(userCode);
        } catch (SecurityException e) {
            return SubmissionResponse.builder().success(false).message(e.getMessage()).build();
        }

        return executeInternally(problem, userCode, userEmail, true);
    }

    @Transactional(readOnly = true)
    public SubmissionResponse submitCode(Long problemId, String userCode, String userEmail) {
        CodingProblem problem = problemRepository.findByIdWithTestCases(problemId)
                .orElseThrow(() -> new RuntimeException("Problem not found"));
        
        try {
            securityValidator.validate(userCode);
        } catch (SecurityException e) {
            return SubmissionResponse.builder().success(false).message(e.getMessage()).build();
        }

        return executeInternally(problem, userCode, userEmail, false);
    }

    private SubmissionResponse executeInternally(CodingProblem problem, String userCode, String userEmail, boolean visibleOnly) {
        // ... (rest of the method logic remains the same)
        // Note: problem.getTestCases() is now already loaded thanks to findByIdWithTestCases
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
            String lastOutput = "";
            String lastExpected = "";

            // A. Visible Test Case
            if (problem.getVisibleInput() != null && problem.getVisibleOutput() != null) {
                try (BufferedReader inputReader = new BufferedReader(new StringReader(problem.getVisibleInput()));
                     BufferedReader expectedReader = new BufferedReader(new StringReader(problem.getVisibleOutput()))) {
                     
                     String inputLine;
                     String expectedLine;
                     int lineNumber = 1;
                     int paramCount = getParameterCount(problem.getParameters());

                     while ((inputLine = inputReader.readLine()) != null) {
                         expectedLine = expectedReader.readLine();
                         // We no longer skip empty lines to support empty arrays/strings
                         if (expectedLine == null) expectedLine = "";

                         lastExpected = expectedLine.trim();
                         lastOutput = runTestCase(directory, inputLine.trim(), paramCount);
                         
                         if (lastOutput.startsWith("ERROR:")) {
                             return SubmissionResponse.builder()
                                 .success(false)
                                 .message(lastOutput.replace("ERROR:", "").trim())
                                 .build();
                         }

                         if (!lastOutput.equals(lastExpected)) {
                              return SubmissionResponse.builder()
                                 .success(false)
                                 .message("Wrong Answer on Visible Test Case (Line " + lineNumber + ")")
                                 .output(lastOutput)
                                 .expectedOutput(lastExpected)
                                 .build();
                         }
                         lineNumber++;
                     }
                }
            }

            // B. Hidden Test Cases
            if (!visibleOnly) {
                 List<TestCase> hiddenTestCases = problem.getTestCases();
                 for (TestCase tc : hiddenTestCases) {
                      String inputKey = tc.getInput();
                      String outputKey = tc.getExpectedOutput();
                      
                      try (BufferedReader inputReader = new BufferedReader(new InputStreamReader(fileStorageService.getFileInputStream(inputKey, true)));
                           BufferedReader expectedReader = new BufferedReader(new InputStreamReader(fileStorageService.getFileInputStream(outputKey, false)))) {
                           
                           String inputLine;
                           String expectedLine;
                           int lineNumber = 1;
                           int paramCount = getParameterCount(problem.getParameters());

                           while ((inputLine = inputReader.readLine()) != null) {
                               expectedLine = expectedReader.readLine();
                               // No longer skipping empty lines
                               if (expectedLine == null) expectedLine = "";
                               
                               String outputContent = runTestCase(directory, inputLine.trim(), paramCount);
                               
                               if (outputContent.startsWith("ERROR:")) {
                                     return SubmissionResponse.builder()
                                         .success(false)
                                         .message(outputContent.replace("ERROR:", "").trim())
                                         .build();
                               }
                               
                               if (!outputContent.equals(expectedLine.trim())) {
                                    return SubmissionResponse.builder()
                                         .success(false)
                                         .message("Wrong Answer on Hidden Test Case (Line " + lineNumber + ")")
                                         .output(outputContent)
                                         .expectedOutput("Hidden")
                                         .build();
                               }
                               lineNumber++;
                           }
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

    private String runTestCase(File directory, String input, int paramCount) throws IOException, InterruptedException {
        List<String> inputArgs = new java.util.ArrayList<>();
        
        if (paramCount <= 1) {
            inputArgs.add(input);
        } else {
            // Smart split that respects [] and ""
            StringBuilder currentArg = new StringBuilder();
            boolean inBrackets = false;
            boolean inQuotes = false;
            
            for (int i = 0; i < input.length(); i++) {
                char ch = input.charAt(i);
                if (ch == '[' && !inQuotes) inBrackets = true;
                if (ch == ']' && !inQuotes) inBrackets = false;
                if (ch == '"' && !inBrackets) inQuotes = !inQuotes;
                
                if (Character.isWhitespace(ch) && !inBrackets && !inQuotes) {
                    if (currentArg.length() > 0) {
                        inputArgs.add(currentArg.toString());
                        currentArg.setLength(0);
                    }
                } else {
                    currentArg.append(ch);
                }
            }
            if (currentArg.length() > 0) {
                inputArgs.add(currentArg.toString());
            }
        }
        
        ProcessBuilder runProcessBuilder = new ProcessBuilder("java", "-cp", ".", "Main");
        runProcessBuilder.command().addAll(inputArgs);
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

    private int getParameterCount(String paramsJson) {
        if (paramsJson == null || paramsJson.isEmpty()) return 0;
        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            List<?> list = mapper.readValue(paramsJson, List.class);
            return list.size();
        } catch (Exception e) {
            return 0;
        }
    }

    @Transactional
    private void updateUserProgress(String email) {
        UserProgress progress = userProgressRepository.findByUserEmail(email)
                .orElseGet(() -> {
                    User user = userRepository.findByEmail(email)
                            .orElseThrow(() -> new RuntimeException("User not found"));
                    return new UserProgress(null, user, 0, 0);
                });
        
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
