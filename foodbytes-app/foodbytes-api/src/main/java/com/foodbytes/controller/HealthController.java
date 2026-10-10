package com.foodbytes.controller;

import com.foodbytes.dto.HealthDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.boot.info.BuildProperties;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class HealthController {

    // ObjectProvider, not BuildProperties: the bean only exists when build-info.properties
    // was generated (mvn builds). Running from an IDE without it must still return 200.
    private final ObjectProvider<BuildProperties> buildProperties;

    @GetMapping("/health")
    public ResponseEntity<HealthDTO> health() {
        return ResponseEntity.ok(HealthDTO.from(buildProperties.getIfAvailable()));
    }
}
