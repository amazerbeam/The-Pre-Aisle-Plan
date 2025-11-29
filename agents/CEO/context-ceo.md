# CEO Orchestrator Context
> Reference material for ceo-orchestrator-agent

## Section 1: Agent Registry

### Specialized Agents

| Agent | Path | Domain | Review Authority |
|-------|------|--------|------------------|
| Authentication | `agents/Login-Authentication/agent-authentication.md` | OAuth, JWT, Sessions | Security designs, auth flows |
| React Frontend | `agents/React/agent-react.md` | React 18+, Components, State | UI components, frontend architecture |
| System Architect | `agents/System Architect/agent-system-architect.md` | Full-stack, APIs, Infrastructure | System architecture, API contracts |
| MySQL Database | `agents/MySQL/agent-sql.md` | Schema, Queries, Optimization | Database designs, data models |
| UX Design | `agents/UX/agent-ux.md` | Wireframes, Accessibility, Flows | User experience, responsive design |
| Java Backend | `agents/Java/agent-java.md` | Spring Boot, JPA, Security | Enterprise backend, Java patterns |

### Context File Paths

```
agents/Login-Authentication/context-authentication.md
agents/React/context-react.md
agents/System Architect/context-system-architect.md
agents/MySQL/context-sql.md
agents/UX/context-ux.md
agents/Java/context-java.md
```

### Requirements Source
```
foodbytes-requirements.md - Version 9.0.0
```

---

## Section 2: Peer Review Protocol

### Design Submission Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    PEER REVIEW WORKFLOW                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. DESIGN PHASE                                             │
│     └── CEO invokes lead agent for domain design             │
│         └── Agent produces design document                   │
│                                                              │
│  2. SUBMISSION                                               │
│     └── CEO logs submission with timestamp                   │
│         └── Design stored in project docs/designs/           │
│                                                              │
│  3. REVIEW DISTRIBUTION                                      │
│     └── CEO invokes each OTHER agent as reviewer             │
│         └── 5 reviewers per design (all except submitter)    │
│                                                              │
│  4. VOTING                                                   │
│     └── Each reviewer returns verdict:                       │
│         ├── APPROVE - Design meets requirements              │
│         └── REJECT - With specific reason                    │
│                                                              │
│  5. TALLY                                                    │
│     └── CEO counts votes                                     │
│         ├── Majority (3+ of 5) = APPROVED                    │
│         └── Minority (<3 of 5) = REJECTED                    │
│                                                              │
│  6. RESOLUTION                                               │
│     ├── If APPROVED: Proceed to implementation               │
│     └── If REJECTED:                                         │
│         ├── Log all rejections with reasons                  │
│         ├── Request revision from original agent             │
│         └── Repeat from step 3                               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Review Prompt Template

When invoking an agent as a reviewer, use this format:

```
You are reviewing a design proposal as part of the FoodBytes peer review process.

DESIGN BEING REVIEWED:
- Title: [DESIGN_NAME]
- Submitted by: [AGENT_NAME]
- Phase: [PHASE_NUMBER]

DESIGN DOCUMENT:
[DESIGN_CONTENT]

YOUR REVIEW TASK:
1. Evaluate this design from your domain expertise perspective
2. Check for:
   - Compatibility with your domain requirements
   - Technical soundness
   - Integration concerns
   - Missing considerations

RESPOND WITH:
- VERDICT: APPROVE or REJECT
- REASON: Specific explanation (required for REJECT, optional for APPROVE)
- SUGGESTIONS: Optional improvements (even if approving)
```

---

## Section 3: Rejection Log Format

### Log File Location
```
docs/peer-reviews/rejection-log.md
```

### Log Entry Template

```markdown
## Rejection Log

---

### [YYYY-MM-DD HH:MM] - [DESIGN_NAME]

**Design Details:**
- Phase: [PHASE_NUMBER]
- Submitted by: [AGENT_NAME]
- Version: [VERSION_NUMBER]

**Voting Results:**
- Total Votes: [X]/5
- Approvals: [Y]
- Rejections: [Z]
- Status: [APPROVED/REJECTED]

**Rejection Details:**
| Reviewer | Verdict | Reason |
|----------|---------|--------|
| @auth-agent | REJECT | [Specific reason] |
| @sql-agent | REJECT | [Specific reason] |

**Resolution:**
- [ ] Design revised by [AGENT]
- [ ] Re-submitted for review
- [ ] Final status: [APPROVED/ABANDONED]

**Notes:**
[Any additional context or decisions made]

---
```

### Sample Rejection Entry

```markdown
### 2024-01-15 14:30 - System Architecture v1

**Design Details:**
- Phase: 1 (Architecture)
- Submitted by: @system-architect
- Version: 1

**Voting Results:**
- Total Votes: 5/5
- Approvals: 3
- Rejections: 2
- Status: APPROVED (majority)

**Rejection Details:**
| Reviewer | Verdict | Reason |
|----------|---------|--------|
| @sql-agent | REJECT | Missing database connection pooling strategy |
| @java-agent | REJECT | No consideration for Spring Boot alternative |

**Resolution:**
- [x] Rejections logged for future consideration
- [x] Design approved with noted concerns
- [x] Final status: APPROVED (majority rule)

**Notes:**
SQL agent's pooling concern will be addressed in Phase 2 (Database).
Java agent's concern acknowledged - both backends will be implemented.
```

---

## Section 4: Project Phases

### Phase Overview

| # | Phase | Lead Agent | Reviewers | Deliverables |
|---|-------|------------|-----------|--------------|
| 1 | Architecture | System Architect | All 5 | System design doc, API contracts |
| 2 | Database | SQL Agent | All 5 | Schema, migrations, indexes |
| 3 | Authentication | Auth Agent | All 5 | OAuth flows, JWT config, middleware |
| 4 | Backend (Node) | System Architect | SQL, Auth, React | Express routes, controllers, services |
| 5 | Backend (Java) | Java Agent | SQL, Auth, React | Spring Boot app, controllers, repos |
| 6 | Frontend | React Agent | UX, Auth, Architect | Components, routing, state management |
| 7 | UX Polish | UX Agent | React, Architect | Responsive CSS, accessibility fixes |
| 8 | Integration | All Agents | All | End-to-end testing, API connections |
| 9 | Docker | System Architect | All 5 | docker-compose, Dockerfiles, networking |
| 10 | Testing | All Agents | Self | Domain-specific validation |

### Phase Details

#### Phase 1: Architecture Design
```
Lead: @system-architect
Input: foodbytes-requirements.md
Output: docs/designs/architecture.md
Contents:
  - System overview diagram
  - Technology stack decisions
  - Directory structure
  - API endpoint contracts
  - Security architecture
  - Deployment strategy
```

#### Phase 2: Database Schema
```
Lead: @sql-agent
Input: Architecture design, requirements
Output: database/schema.sql, migrations/
Contents:
  - Complete CREATE TABLE statements
  - Foreign key relationships
  - Indexes for common queries
  - Triggers for audit log
  - Seed data scripts
```

#### Phase 3: Authentication
```
Lead: @auth-agent
Input: Architecture, schema
Output: server/src/config/passport.js, middleware/
Contents:
  - OAuth provider configuration
  - Passport strategies
  - JWT generation/validation
  - Auth middleware
  - Admin middleware
```

#### Phase 4: Backend (Node.js)
```
Lead: @system-architect
Input: All previous phases
Output: server/src/
Contents:
  - Express app setup
  - Route definitions
  - Controllers
  - Services
  - Database queries
```

#### Phase 5: Backend (Java)
```
Lead: @java-agent
Input: All previous phases
Output: foodbytes-api/src/
Contents:
  - Spring Boot application
  - REST controllers
  - Service layer
  - JPA repositories
  - Security config
```

#### Phase 6: Frontend
```
Lead: @react-agent
Input: API contracts, UX designs
Output: client/src/
Contents:
  - React components
  - Context providers
  - Custom hooks
  - API services
  - Routing setup
```

#### Phase 7: UX Polish
```
Lead: @ux-agent
Input: Frontend components
Output: client/src/styles/
Contents:
  - Responsive CSS
  - Mobile navigation
  - Accessibility attributes
  - Touch-friendly interactions
  - Color scheme/theming
```

#### Phase 8: Integration
```
Lead: All agents collaborate
Input: All previous outputs
Output: Working end-to-end flows
Contents:
  - API integration testing
  - Frontend-backend connection
  - Authentication flows
  - Data persistence verification
```

#### Phase 9: Docker
```
Lead: @system-architect
Input: Complete application
Output: docker-compose.yml, Dockerfiles
Contents:
  - MySQL container
  - Node.js API container
  - Java API container
  - React frontend container
  - Network configuration
  - Volume mounts
  - Health checks
```

#### Phase 10: Testing
```
Lead: Each agent for their domain
Input: Docker environment
Output: Test results report
Contents:
  - Auth flows work
  - CRUD operations work
  - Calendar displays correctly
  - Shopping list aggregates
  - Admin features work
  - Mobile responsive
```

---

## Section 5: Context File References

### Required Reading (CEO Startup)

```javascript
// CEO must read ALL these files before starting

const REQUIRED_CONTEXT_FILES = [
  // Requirements
  'foodbytes-requirements.md',

  // Agent Context Files
  'agents/Login-Authentication/context-authentication.md',
  'agents/React/context-react.md',
  'agents/System Architect/context-system-architect.md',
  'agents/MySQL/context-sql.md',
  'agents/UX/context-ux.md',
  'agents/Java/context-java.md',

  // Existing Codebase Reference
  'CLAUDE.md',
  'recipes.js',  // Current recipe data structure
];
```

### Context File Contents Summary

| File | Key Information |
|------|-----------------|
| context-authentication.md | OAuth flow, JWT payload, Passport config, middleware examples |
| context-react.md | Project structure, component patterns, responsive breakpoints |
| context-system-architect.md | System diagram, directory structure, API endpoints |
| context-sql.md | Complete schema, queries, indexes, triggers |
| context-ux.md | Wireframes, user flows, accessibility checklist |
| context-java.md | Entity models, Spring config, controller examples |

---

## Section 6: Voting Rules

### Eligibility
- **Voters**: All 6 agents EXCEPT the design submitter
- **Per Design**: 5 eligible voters

### Quorum
- **Minimum Votes**: 4 of 5 must vote
- **If quorum not met**: Request missing reviews before proceeding

### Majority Calculation
```
APPROVED if: approvals > rejections
REJECTED if: rejections >= approvals

Examples:
- 5 approve, 0 reject = APPROVED
- 4 approve, 1 reject = APPROVED
- 3 approve, 2 reject = APPROVED (majority)
- 2 approve, 3 reject = REJECTED
- 2 approve, 2 reject, 1 abstain = REJECTED (no majority)
```

### Tie-Breaker Rules
1. **Architecture decisions**: System Architect has deciding vote
2. **Database decisions**: SQL Agent has deciding vote
3. **Frontend decisions**: React Agent has deciding vote
4. **UX decisions**: UX Agent has deciding vote
5. **Security decisions**: Auth Agent has deciding vote
6. **Java decisions**: Java Agent has deciding vote

### Domain Authority
- Agents have EXTRA WEIGHT in their domain expertise
- But NO VETO power - majority still rules
- Rejections from domain experts should be taken more seriously

---

## Section 7: Docker Completion Criteria

### Checklist

```markdown
## Docker Readiness Checklist

### Infrastructure Files
- [ ] docker-compose.yml exists and is valid
- [ ] Dockerfile for Node.js API
- [ ] Dockerfile for Java API
- [ ] Dockerfile for React frontend
- [ ] .dockerignore files present

### MySQL Container
- [ ] MySQL 8.0+ image specified
- [ ] Environment variables configured
- [ ] Volume for data persistence
- [ ] Init script runs schema.sql
- [ ] Health check configured

### Node.js API Container
- [ ] Node 18+ image
- [ ] npm install runs successfully
- [ ] App starts on specified port
- [ ] Connects to MySQL container
- [ ] Health check endpoint responds

### Java API Container
- [ ] Java 17+ image
- [ ] Maven/Gradle build succeeds
- [ ] App starts on specified port
- [ ] Connects to MySQL container
- [ ] Health check endpoint responds

### React Frontend Container
- [ ] Node image for build
- [ ] nginx for serving
- [ ] Build completes successfully
- [ ] Serves on port 80/443
- [ ] API proxy configured

### Networking
- [ ] All containers on same network
- [ ] Container names resolvable
- [ ] Ports mapped correctly
- [ ] No port conflicts

### Startup
- [ ] `docker-compose up` runs without errors
- [ ] All containers reach healthy state
- [ ] Logs show no critical errors

### Validation
- [ ] Frontend loads in browser
- [ ] OAuth login redirects work
- [ ] API endpoints respond
- [ ] Database operations work
- [ ] Recipe data displays
```

### docker-compose.yml Template

```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
      MYSQL_DATABASE: foodbytes
      MYSQL_USER: ${DB_USER}
      MYSQL_PASSWORD: ${DB_PASSWORD}
    volumes:
      - mysql_data:/var/lib/mysql
      - ./database/schema.sql:/docker-entrypoint-initdb.d/01-schema.sql
      - ./database/seed.sql:/docker-entrypoint-initdb.d/02-seed.sql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - foodbytes-network

  api-node:
    build:
      context: ./server
      dockerfile: Dockerfile
    environment:
      DB_HOST: mysql
      DB_USER: ${DB_USER}
      DB_PASSWORD: ${DB_PASSWORD}
      DB_NAME: foodbytes
      JWT_SECRET: ${JWT_SECRET}
      GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID}
      GOOGLE_CLIENT_SECRET: ${GOOGLE_CLIENT_SECRET}
      GITHUB_CLIENT_ID: ${GITHUB_CLIENT_ID}
      GITHUB_CLIENT_SECRET: ${GITHUB_CLIENT_SECRET}
    ports:
      - "3001:3001"
    depends_on:
      mysql:
        condition: service_healthy
    networks:
      - foodbytes-network

  api-java:
    build:
      context: ./foodbytes-api
      dockerfile: Dockerfile
    environment:
      SPRING_DATASOURCE_URL: jdbc:mysql://mysql:3306/foodbytes
      SPRING_DATASOURCE_USERNAME: ${DB_USER}
      SPRING_DATASOURCE_PASSWORD: ${DB_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
    ports:
      - "8080:8080"
    depends_on:
      mysql:
        condition: service_healthy
    networks:
      - foodbytes-network

  frontend:
    build:
      context: ./client
      dockerfile: Dockerfile
    ports:
      - "3000:80"
    depends_on:
      - api-node
    networks:
      - foodbytes-network

networks:
  foodbytes-network:
    driver: bridge

volumes:
  mysql_data:
```

---

## Section 8: CEO Execution Commands

### Starting the CEO
```
@agent-ceo Design and build the complete FoodBytes application following the peer-review workflow. All designs must achieve majority approval. Track all rejections. Deliver a Docker-ready application.
```

### Phase-Specific Commands
```
@agent-ceo Execute Phase 1: Architecture Design with peer review
@agent-ceo Execute Phase 2: Database Schema with peer review
@agent-ceo Resume from Phase [N]
@agent-ceo Show rejection log
@agent-ceo Show progress report
```

### Emergency Commands
```
@agent-ceo Override rejection for [DESIGN] - majority achieved
@agent-ceo Skip review for [DESIGN] - user approved
@agent-ceo Abort and save state
```

---

## Section 9: Progress Tracking

### Master Todo List Template

```markdown
## FoodBytes Build Progress

### Phase 1: Architecture
- [ ] System Architect proposes design
- [ ] Peer review conducted
- [ ] Design approved/revised
- [ ] Implementation complete

### Phase 2: Database
- [ ] SQL Agent proposes schema
- [ ] Peer review conducted
- [ ] Schema approved/revised
- [ ] Migrations created

### Phase 3: Authentication
- [ ] Auth Agent proposes flow
- [ ] Peer review conducted
- [ ] Design approved/revised
- [ ] Implementation complete

### Phase 4: Backend (Node)
- [ ] Express routes implemented
- [ ] Controllers created
- [ ] Services complete
- [ ] Integration tested

### Phase 5: Backend (Java)
- [ ] Spring Boot setup
- [ ] Controllers created
- [ ] Repositories complete
- [ ] Integration tested

### Phase 6: Frontend
- [ ] React components created
- [ ] State management setup
- [ ] API integration complete
- [ ] Routing configured

### Phase 7: UX Polish
- [ ] Responsive CSS applied
- [ ] Accessibility verified
- [ ] Mobile tested
- [ ] Cross-browser tested

### Phase 8: Integration
- [ ] All APIs connected
- [ ] Auth flows working
- [ ] Data persistence verified
- [ ] Error handling tested

### Phase 9: Docker
- [ ] docker-compose.yml created
- [ ] All Dockerfiles created
- [ ] Containers build successfully
- [ ] docker-compose up works

### Phase 10: Testing
- [ ] Auth tests pass
- [ ] CRUD tests pass
- [ ] UI tests pass
- [ ] Performance acceptable
```

---

## Section 10: Critical Constraints

### NEVER Forget
1. **Web app ONLY** - NOT React Native, NOT mobile apps
2. **OAuth ONLY** - No password storage
3. **MySQL** - Not PostgreSQL, not MongoDB
4. **Both backends** - Node.js AND Java
5. **Mobile-first CSS** - Responsive design, not native components
6. **6-month retention** - Rolling data retention for meal plans
7. **Immutable audit** - Recipe changes logged forever

### Error Prevention
- Always read context files before invoking agents
- Always log rejections even if design is approved
- Always verify Docker health checks before declaring complete
- Always test on mobile viewport before UX sign-off
