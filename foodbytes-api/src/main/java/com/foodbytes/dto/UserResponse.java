package com.foodbytes.dto;

import com.foodbytes.model.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {
    private Long id;
    private String email;
    private String name;
    private Boolean isAdmin;
    private Integer defaultServings;

    public static UserResponse from(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .isAdmin(user.getIsAdmin())
                .defaultServings(user.getDefaultServings())
                .build();
    }
}
