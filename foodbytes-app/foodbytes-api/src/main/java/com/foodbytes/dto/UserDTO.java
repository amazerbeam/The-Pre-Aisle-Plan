package com.foodbytes.dto;

import com.foodbytes.model.OAuthProvider;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    private Long id;
    private String email;
    private String name;
    private OAuthProvider oauthProvider;
    private Boolean isAdmin;
    private LocalDateTime createdAt;
    private LocalDateTime lastLogin;
}
