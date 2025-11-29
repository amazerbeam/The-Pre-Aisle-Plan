# Java Backend Context
> Reference material for java-backend-agent

## Note on Architecture

The primary FoodBytes backend uses **Node.js + Express**. This Java agent provides:
1. An alternative Spring Boot implementation
2. Potential microservices for specific features
3. Enterprise deployment option

The **frontend remains React (web)** - NOT a mobile app.

## Technology Stack

| Component | Technology |
|-----------|------------|
| Language | Java 17+ |
| Framework | Spring Boot 3.x |
| Security | Spring Security + OAuth2 |
| Database | MySQL with Spring Data JPA |
| Build | Maven or Gradle |
| API Docs | SpringDoc OpenAPI (Swagger) |

## Project Structure

```
foodbytes-api/
├── src/
│   ├── main/
│   │   ├── java/com/foodbytes/
│   │   │   ├── FoodBytesApplication.java
│   │   │   ├── config/
│   │   │   │   ├── SecurityConfig.java
│   │   │   │   ├── OAuth2Config.java
│   │   │   │   └── JwtConfig.java
│   │   │   ├── controller/
│   │   │   │   ├── AuthController.java
│   │   │   │   ├── RecipeController.java
│   │   │   │   ├── MealPlanController.java
│   │   │   │   └── AuditController.java
│   │   │   ├── service/
│   │   │   │   ├── UserService.java
│   │   │   │   ├── RecipeService.java
│   │   │   │   ├── MealPlanService.java
│   │   │   │   └── AuditService.java
│   │   │   ├── repository/
│   │   │   │   ├── UserRepository.java
│   │   │   │   ├── RecipeRepository.java
│   │   │   │   ├── MealPlanRepository.java
│   │   │   │   └── AuditLogRepository.java
│   │   │   ├── model/
│   │   │   │   ├── User.java
│   │   │   │   ├── Recipe.java
│   │   │   │   ├── MealPlanEntry.java
│   │   │   │   └── RecipeAuditLog.java
│   │   │   ├── dto/
│   │   │   │   ├── UserDTO.java
│   │   │   │   ├── RecipeDTO.java
│   │   │   │   ├── MealPlanDTO.java
│   │   │   │   └── AuditLogDTO.java
│   │   │   ├── security/
│   │   │   │   ├── JwtTokenProvider.java
│   │   │   │   ├── JwtAuthenticationFilter.java
│   │   │   │   └── CustomOAuth2UserService.java
│   │   │   └── exception/
│   │   │       ├── GlobalExceptionHandler.java
│   │   │       └── ResourceNotFoundException.java
│   │   └── resources/
│   │       ├── application.yml
│   │       └── application-dev.yml
│   └── test/
│       └── java/com/foodbytes/
├── pom.xml
└── README.md
```

## Entity Models

### User.java
```java
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "oauth_provider", nullable = false)
    private OAuthProvider oauthProvider;

    @Column(name = "oauth_id", nullable = false)
    private String oauthId;

    @Column(name = "is_admin")
    private Boolean isAdmin = false;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "last_login")
    private LocalDateTime lastLogin;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // Getters, setters, constructors
}

public enum OAuthProvider {
    GOOGLE, GITHUB
}
```

### Recipe.java
```java
@Entity
@Table(name = "recipes")
public class Recipe {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Convert(converter = JsonListConverter.class)
    @Column(name = "meal_types", columnDefinition = "JSON")
    private List<String> mealTypes;

    @Column(name = "default_servings")
    private Integer defaultServings = 2;

    private Integer calories;

    @Convert(converter = IngredientListConverter.class)
    @Column(columnDefinition = "JSON")
    private List<Ingredient> ingredients;

    @Convert(converter = JsonListConverter.class)
    @Column(columnDefinition = "JSON")
    private List<String> steps;

    @Column(name = "is_cheat")
    private Boolean isCheat = false;

    @Column(name = "is_deleted")
    private Boolean isDeleted = false;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Getters, setters, constructors
}

@Embeddable
public class Ingredient {
    private String name;
    private Double quantity;
    private String unit;
}
```

### MealPlanEntry.java
```java
@Entity
@Table(name = "meal_plan_entries")
public class MealPlanEntry {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "plan_date", nullable = false)
    private LocalDate planDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "meal_type", nullable = false)
    private MealType mealType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipe_id", nullable = false)
    private Recipe recipe;

    private Integer servings = 2;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}

public enum MealType {
    BREAKFAST, LUNCH, DINNER, SNACKS
}
```

### RecipeAuditLog.java
```java
@Entity
@Table(name = "recipe_audit_log")
public class RecipeAuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipe_id", nullable = false)
    private Recipe recipe;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AuditAction action;

    @Convert(converter = JsonConverter.class)
    @Column(name = "old_values", columnDefinition = "JSON")
    private Map<String, Object> oldValues;

    @Convert(converter = JsonConverter.class)
    @Column(name = "new_values", columnDefinition = "JSON")
    private Map<String, Object> newValues;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @PrePersist
    protected void onCreate() {
        timestamp = LocalDateTime.now();
    }
}

public enum AuditAction {
    CREATE, UPDATE, DELETE
}
```

## REST Controllers

### RecipeController.java
```java
@RestController
@RequestMapping("/api/recipes")
@RequiredArgsConstructor
public class RecipeController {

    private final RecipeService recipeService;

    @GetMapping
    public ResponseEntity<List<RecipeDTO>> getAllRecipes() {
        return ResponseEntity.ok(recipeService.getAllActiveRecipes());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RecipeDTO> getRecipe(@PathVariable Long id) {
        return ResponseEntity.ok(recipeService.getRecipeById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RecipeDTO> createRecipe(
            @Valid @RequestBody RecipeDTO recipeDTO,
            @AuthenticationPrincipal UserPrincipal user) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(recipeService.createRecipe(recipeDTO, user.getId()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RecipeDTO> updateRecipe(
            @PathVariable Long id,
            @Valid @RequestBody RecipeDTO recipeDTO,
            @AuthenticationPrincipal UserPrincipal user) {
        return ResponseEntity.ok(recipeService.updateRecipe(id, recipeDTO, user.getId()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteRecipe(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal user) {
        recipeService.softDeleteRecipe(id, user.getId());
        return ResponseEntity.noContent().build();
    }
}
```

### MealPlanController.java
```java
@RestController
@RequestMapping("/api/meal-plan")
@RequiredArgsConstructor
public class MealPlanController {

    private final MealPlanService mealPlanService;

    @GetMapping
    public ResponseEntity<List<MealPlanDTO>> getMealPlan(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @AuthenticationPrincipal UserPrincipal user) {
        return ResponseEntity.ok(mealPlanService.getEntriesForDateRange(user.getId(), from, to));
    }

    @PostMapping
    public ResponseEntity<MealPlanDTO> addEntry(
            @Valid @RequestBody MealPlanDTO dto,
            @AuthenticationPrincipal UserPrincipal user) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(mealPlanService.createEntry(dto, user.getId()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MealPlanDTO> updateEntry(
            @PathVariable Long id,
            @Valid @RequestBody MealPlanDTO dto,
            @AuthenticationPrincipal UserPrincipal user) {
        return ResponseEntity.ok(mealPlanService.updateEntry(id, dto, user.getId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEntry(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal user) {
        mealPlanService.deleteEntry(id, user.getId());
        return ResponseEntity.noContent().build();
    }
}
```

## Security Configuration

### SecurityConfig.java
```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtTokenProvider jwtTokenProvider;
    private final CustomOAuth2UserService oAuth2UserService;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/recipes/**").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .oauth2Login(oauth2 -> oauth2
                .userInfoEndpoint(userInfo ->
                    userInfo.userService(oAuth2UserService))
                .successHandler(oAuth2SuccessHandler())
            )
            .addFilterBefore(jwtAuthenticationFilter(),
                UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:3000"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
```

## Application Configuration

### application.yml
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/foodbytes
    username: ${DB_USER}
    password: ${DB_PASSWORD}
    driver-class-name: com.mysql.cj.jdbc.Driver

  jpa:
    hibernate:
      ddl-auto: validate
    properties:
      hibernate:
        dialect: org.hibernate.dialect.MySQL8Dialect

  security:
    oauth2:
      client:
        registration:
          google:
            client-id: ${GOOGLE_CLIENT_ID}
            client-secret: ${GOOGLE_CLIENT_SECRET}
            scope: email, profile
          github:
            client-id: ${GITHUB_CLIENT_ID}
            client-secret: ${GITHUB_CLIENT_SECRET}
            scope: user:email

jwt:
  secret: ${JWT_SECRET}
  expiration: 604800000  # 7 days in milliseconds

server:
  port: 8080
```

## Dependencies (pom.xml)

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-security</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-oauth2-client</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>
    <dependency>
        <groupId>com.mysql</groupId>
        <artifactId>mysql-connector-j</artifactId>
        <scope>runtime</scope>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-api</artifactId>
        <version>0.11.5</version>
    </dependency>
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <optional>true</optional>
    </dependency>
    <dependency>
        <groupId>org.springdoc</groupId>
        <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
        <version>2.2.0</version>
    </dependency>
</dependencies>
```

## When to Use Java Backend

| Scenario | Recommendation |
|----------|----------------|
| Startup/MVP | Use Node.js (faster development) |
| Enterprise deployment | Consider Java (better tooling) |
| Team expertise is Java | Use Java |
| Need specific Java libraries | Use Java |
| Microservices architecture | Mix both as needed |
