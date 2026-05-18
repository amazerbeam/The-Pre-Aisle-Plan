package com.foodbytes.tools;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordHashGenerator {

    public static void main(String[] args) {
        if (args.length != 1) {
            System.err.println("Usage: java com.foodbytes.tools.PasswordHashGenerator <plaintext-password>");
            System.exit(1);
        }
        String hash = new BCryptPasswordEncoder().encode(args[0]);
        System.out.println(hash);
    }
}
