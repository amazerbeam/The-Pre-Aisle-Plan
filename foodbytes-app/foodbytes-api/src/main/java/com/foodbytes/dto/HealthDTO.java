package com.foodbytes.dto;

import org.springframework.boot.info.BuildProperties;

/**
 * MPP-9: body of GET /api/health. version and builtAt come from Spring Boot build-info
 * (META-INF/build-info.properties, generated from pom.xml at build time), so the running build
 * identifies itself. Fields fall back to "unknown" rather than null: the frontend compares
 * these strings, and the Docker HEALTHCHECK needs a 200 even without build-info.
 */
public record HealthDTO(String status, String version, String builtAt) {

    public static final String UP = "UP";
    public static final String UNKNOWN = "unknown";

    public static HealthDTO from(BuildProperties build) {
        if (build == null) {
            return new HealthDTO(UP, UNKNOWN, UNKNOWN);
        }
        String version = build.getVersion() == null || build.getVersion().isBlank()
                ? UNKNOWN
                : build.getVersion();
        String builtAt = build.getTime() == null ? UNKNOWN : build.getTime().toString();
        return new HealthDTO(UP, version, builtAt);
    }
}
