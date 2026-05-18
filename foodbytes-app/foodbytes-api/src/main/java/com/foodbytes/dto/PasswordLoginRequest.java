package com.foodbytes.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PasswordLoginRequest(
        @NotBlank @Email String email,
        @NotBlank @Size(max = 200) String password
) {}
