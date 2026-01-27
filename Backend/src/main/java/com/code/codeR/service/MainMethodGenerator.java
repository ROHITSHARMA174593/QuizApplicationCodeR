package com.code.codeR.service;

import com.code.codeR.model.CodingProblem;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.List;
import java.util.Map;

@Service
public class MainMethodGenerator {

    private final ObjectMapper objectMapper = new ObjectMapper();

    public String generateMainClass(CodingProblem problem) {
        String methodName = problem.getMethodName();
        String returnType = problem.getReturnType();
        String paramsJson = problem.getParameters();

        StringBuilder sb = new StringBuilder();
        sb.append("import java.util.*;\n\n");
        sb.append("public class Main {\n");
        sb.append("    public static void main(String[] args) {\n");
        sb.append("        try {\n");
        
        // 1. Parse Arguments based on parameter definitions
        try {
            List<Map<String, String>> params = objectMapper.readValue(paramsJson, new TypeReference<>() {});
            
            sb.append("            if (args.length < ").append(params.size()).append(") {\n");
            sb.append("                System.out.println(\"Insufficient arguments provided to Main\");\n");
            sb.append("                return;\n");
            sb.append("            }\n\n");
            
            int argIndex = 0;
            StringBuilder methodCallArgs = new StringBuilder();
            
            for (Map<String, String> param : params) {
                String type = param.get("type");
                String name = param.get("name");
                
                sb.append("            ").append(type).append(" ").append(name).append(" = ");
                
                // Input Parsing Logic
                if (type.equals("int")) {
                    sb.append("Integer.parseInt(args[").append(argIndex).append("]);\n");
                } else if (type.equals("String")) {
                    sb.append("args[").append(argIndex).append("];\n");
                } else if (type.equals("int[]")) {
                    // Expecting input like "[1,2,3]"
                    sb.append("parseIntArray(args[").append(argIndex).append("]);\n");
                } else if (type.equals("boolean")) {
                    sb.append("Boolean.parseBoolean(args[").append(argIndex).append("]);\n");
                } else {
                    // Fallback for unknown types
                    sb.append("null; // Unsupported type: ").append(type).append("\n");
                }
                
                if (argIndex > 0) methodCallArgs.append(", ");
                methodCallArgs.append(name);
                argIndex++;
            }
            
            // 2. Instantiate and Call
            sb.append("\n            Solution solution = new Solution();\n");
            
            if (returnType.equals("void")) {
                sb.append("            solution.").append(methodName).append("(").append(methodCallArgs).append(");\n");
            } else {
                sb.append("            ").append(returnType).append(" result = solution.").append(methodName).append("(").append(methodCallArgs).append(");\n");
                sb.append("            printResult(result);\n");
            }

        } catch (JsonProcessingException e) {
            sb.append("            System.out.println(\"Error parsing problem parameters: ").append(e.getMessage()).append("\");\n");
        }
        
        sb.append("        } catch (Exception e) {\n");
        sb.append("            e.printStackTrace();\n");
        sb.append("        }\n");
        sb.append("    }\n\n"); // End main

        // Helper Methods
        addHelperMethods(sb);

        sb.append("}\n"); // End Class
        return sb.toString();
    }

    private void addHelperMethods(StringBuilder sb) {
        // parseIntArray helper
        sb.append("    private static int[] parseIntArray(String input) {\n");
        sb.append("        input = input.trim();\n");
        sb.append("        if (input.equals(\"[]\")) return new int[0];\n");
        sb.append("        input = input.substring(1, input.length() - 1);\n"); // Remove [ ]
        sb.append("        String[] parts = input.split(\",\");\n");
        sb.append("        int[] res = new int[parts.length];\n");
        sb.append("        for(int i=0; i<parts.length; i++) {\n");
        sb.append("            res[i] = Integer.parseInt(parts[i].trim());\n");
        sb.append("        }\n");
        sb.append("        return res;\n");
        sb.append("    }\n\n");

        // printResult helper
        sb.append("    private static void printResult(Object result) {\n");
        sb.append("        if (result instanceof int[]) {\n");
        sb.append("            System.out.println(Arrays.toString((int[]) result));\n");
        sb.append("        } else {\n");
        sb.append("            System.out.println(result);\n");
        sb.append("        }\n");
        sb.append("    }\n");
    }
}
