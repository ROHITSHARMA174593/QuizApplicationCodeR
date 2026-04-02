package com.code.codeR.service;


import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.data.redis.DataRedisTest;
import org.springframework.data.redis.core.StringRedisTemplate;

@DataRedisTest
public class RedisTest {
    @Autowired
    private StringRedisTemplate redisTemplate;
    
    @Test
    public void test(){
        redisTemplate.opsForValue().set("email","rohit@gmail.com");
        String email = redisTemplate.opsForValue().get("email");
        System.out.println("Retrieved from Redis: " + email);
    }
}
