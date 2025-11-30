package com.foodbytes.dto;

import com.foodbytes.model.User;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDTO {

    private Long id;
    private String email;
    private String name;
    private String oauthProvider;
    private Boolean isAdmin;
    private Integer defaultServings;
    private LocalDateTime createdAt;
    private LocalDateTime lastLogin;

    public static UserDTO fromEntity(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .oauthProvider(user.getOauthProvider().name())
                .isAdmin(user.getIsAdmin())
                .defaultServings(user.getDefaultServings())
                .createdAt(user.getCreatedAt())
                .lastLogin(user.getLastLogin())
                .build();
    }
}
