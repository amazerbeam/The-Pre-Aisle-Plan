package com.foodbytes.config;

import com.foodbytes.service.HabitStreakPolicy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Clock;

/**
 * MPP-20: an injectable clock so "today" can be pinned in tests. Zoned to Europe/Dublin
 * (HabitStreakPolicy.ZONE) until a per-user zone exists.
 */
@Configuration
public class ClockConfig {

    @Bean
    public Clock clock() {
        return Clock.system(HabitStreakPolicy.ZONE);
    }
}
