package com.code.codeR.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestDeploymentController {
    @GetMapping("/")
    public String testDeployment() {
        return "Deployment Successful"; 
    }
}
