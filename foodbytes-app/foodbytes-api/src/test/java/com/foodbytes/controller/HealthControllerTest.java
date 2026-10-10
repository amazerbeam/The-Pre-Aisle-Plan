package com.foodbytes.controller;

import com.foodbytes.dto.HealthDTO;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.boot.info.BuildProperties;
import org.springframework.http.ResponseEntity;

import java.util.Properties;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

/**
 * MPP-9: GET /api/health reports the build that is actually running (version from pom.xml
 * and build time) via Spring Boot build-info, never a hard-coded string. Missing build-info
 * must degrade to "unknown" with a 200, because the Docker HEALTHCHECK curls this endpoint.
 * No Spring context, matching every other test in this suite.
 */
@ExtendWith(MockitoExtension.class)
class HealthControllerTest {

    @Mock
    private ObjectProvider<BuildProperties> buildProperties;

    @InjectMocks
    private HealthController controller;

    @Test
    void reportsVersionAndBuildTimeFromBuildInfo() {
        when(buildProperties.getIfAvailable()).thenReturn(build("1.1.0", "2026-10-10T13:05:11Z"));

        ResponseEntity<HealthDTO> response = controller.health();

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody())
                .isEqualTo(new HealthDTO("UP", "1.1.0", "2026-10-10T13:05:11Z"));
    }

    @Test
    void missingBuildInfoFallsBackToUnknownAndStaysUp() {
        when(buildProperties.getIfAvailable()).thenReturn(null);

        ResponseEntity<HealthDTO> response = controller.health();

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody()).isEqualTo(new HealthDTO("UP", "unknown", "unknown"));
    }

    @Test
    void missingBuildTimeFallsBackToUnknown() {
        when(buildProperties.getIfAvailable()).thenReturn(build("1.1.0", null));

        assertThat(controller.health().getBody().builtAt()).isEqualTo("unknown");
    }

    private static BuildProperties build(String version, String time) {
        Properties entries = new Properties();
        entries.setProperty("version", version);
        if (time != null) {
            entries.setProperty("time", time);
        }
        return new BuildProperties(entries);
    }
}
