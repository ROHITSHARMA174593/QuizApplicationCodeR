package com.code.codeR;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling // KeepAliveService file ke liye (ye file hum supabase ko har 48hrs me hit karne ke liye banaye hai)
@SpringBootApplication
public class CodeRApplication {
	public static void main(String[] args) {
		SpringApplication.run(CodeRApplication.class, args);
	}
}
//todo : https://quizapplicationcoder.onrender.com
// https://quizapplicationcoder.onrender.com/api/auth/login
