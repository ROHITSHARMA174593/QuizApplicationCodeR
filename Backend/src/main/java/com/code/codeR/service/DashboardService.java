package com.code.codeR.service;

import com.code.codeR.model.User;
import com.code.codeR.model.UserProgress;
import com.code.codeR.repository.UserProgressRepository;
import com.code.codeR.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final UserProgressRepository progressRepository;
    private final UserRepository userRepository;

    public UserProgress getUserProgress(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return progressRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    // Create default progress if not exists
                    UserProgress newProgress = new UserProgress();
                    newProgress.setUser(user);
                    newProgress.setQuizzesAttempted(0);
                    newProgress.setProblemsSolved(0);
                    return progressRepository.save(newProgress);
                });
    }
    public UserProgress updateProgress(String email, int quizScoreToAdd, boolean problemSolved) {
        UserProgress progress = getUserProgress(email);
        
        if (quizScoreToAdd > 0) {
            progress.setQuizzesAttempted(progress.getQuizzesAttempted() + 1);
        }
        
        if (problemSolved) {
            progress.setProblemsSolved(progress.getProblemsSolved() + 1);
        }
        
        return progressRepository.save(progress);
    }
}
