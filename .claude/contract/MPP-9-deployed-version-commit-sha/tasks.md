# Tasks: Show deployed version + build time in the app (MPP-9)

> **For agentic workers:** Use `/fb-apply` to walk this contract phase-by-phase. Steps use checkbox (`- [ ]`) syntax for tracking.

Status: COMPLETE
Started: 2026-10-10

**Goal:** Every build self-identifies. `/api/health` reports build-time `version` and `builtAt`; the account menu shows `v1.1.0 · web 10 Oct 14:02 · api 10 Oct 14:05`, with version mismatches in amber; and a checked, documented SemVer + CHANGELOG convention is wired into the fb workflow. No commit SHAs anywhere (developer red-line, 2026-10-10).

**Spec:** `plan.md` in this folder. Visual contract: `C:\Users\jossd\Downloads\mpp-9-version-line-mockup.html` (revised; placement A, the account menu).

**Backend toolchain:** `mvn` and `java` are not on PATH, so every backend `Run:` line below starts with this prefix, written out in full:
`$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.20.8-hotspot"; $env:PATH = "$env:JAVA_HOME\bin;C:\Users\jossd\tools\apache-maven-3.9.9\bin;$env:PATH";`

**Not touched:** neither Dockerfile changes. `mvn package` runs the new `build-info` goal on its own, and `vite build` stamps its own time.

---

## File map

**Created:**
- `.docs/requirement-mpp-9-version-build-time-display-2026-10-10.md`: requirement doc (ticket ACs + red-line).
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/HealthDTO.java`: the `/api/health` response record, plus a `from(BuildProperties)` factory.
- `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/controller/HealthControllerTest.java`: pins the build-info → JSON mapping and the `unknown` fallbacks.
- `foodbytes-app/client/src/constants/buildInfo.js`: the only reader of `__APP_VERSION__` / `__APP_BUILT_AT__`; holds the health timeout constant.
- `foodbytes-app/client/src/services/healthService.js`: `getHealth({ signal })`.
- `foodbytes-app/client/src/hooks/useBuildInfo.js`: fetch, abort, four async states, `versionMismatch`, module cache.
- `foodbytes-app/client/src/components/layout/VersionInfo.jsx`: renders the version line.
- `foodbytes-app/client/src/components/layout/VersionInfo.css`: styles per the mockup.
- `foodbytes-app/client/scripts/check-version.mjs`: fails when package.json, pom.xml and the CHANGELOG head disagree.
- `CHANGELOG.md`: repo root, newest first.

**Modified:**
- `foodbytes-app/foodbytes-api/pom.xml:17,100-115`: version 1.1.0; a `build-info` execution.
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/controller/HealthController.java:1-20`: reads `BuildProperties`, returns `HealthDTO`.
- `foodbytes-app/client/vite.config.js:1-5`: `define` for `__APP_VERSION__` / `__APP_BUILT_AT__`.
- `foodbytes-app/client/src/utils/dateUtils.js` (append after `formatDateRange`): `formatBuildTime(iso)`.
- `foodbytes-app/client/package.json:3,9`: version 1.1.0; `check:version` script.
- `foodbytes-app/client/src/components/layout/Header.jsx:6,66-68`: imports and mounts `<VersionInfo />` in `.user-dropdown`.
- `CLAUDE.md` (new section before `## Conventions`): Versioning & deploy verification.
- `.claude/commands/fb-plan.md:337-370,402`: mandatory Final-verification "Bump version + CHANGELOG" task; rule update.
- `.claude/commands/fb-apply.md:248-250,346-347`: QA always runs `check:version`; `### Version` added to the final report.

**Deleted:** (none)

---

## Phase 1 — Requirement document

This phase writes the `requirements`-skill artefact only. No code is touched, so both builds stay green.

### Task 1: Write the MPP-9 requirement doc ✓

- Skill: requirements

**Files:**
- Create: `.docs/requirement-mpp-9-version-build-time-display-2026-10-10.md`

- [x] **Step 1: Write the document (no interview: the ticket plus the 2026-10-10 red-line answer every interview question, and the doc says so)**

```markdown
# Show deployed version + build time (MPP-9)

**Date:** 2026-10-10
**Status:** Approved (via /fb-plan, `.claude/contract/MPP-9-deployed-version-commit-sha/plan.md`)

## Problem / motivation
Nothing tells the developer which build is running on Railway. When MPP-8 still looked broken after its fix, there was no way to tell "fix wrong" from "fix not deployed". The version is also hard-coded in three places that disagree (package.json `1.0.0-mvp`, pom.xml `1.0.0-MVP`, a literal in HealthController).

## Scope
**In scope**
- Spring Boot build-info behind `/api/health` (`version`, `builtAt`)
- Vite `define` (version + build time), and a version line in the account menu
- One version number across package.json and pom.xml, enforced by `npm run check:version`
- `CHANGELOG.md`, the fb workflow bump step, the CLAUDE.md convention
**Out of scope / non-goals**
- Commit SHAs in any form (developer red-line 2026-10-10; ticket AC1 withdrawn)
- Dockerfile changes, release-please / semantic-release, git tags, GitHub Releases, CI, Actuator exposure, backfilling MPP-1…8

## Success criteria
- `GET /api/health` → JSON with string keys `status`, `version`, `builtAt`; `HealthControllerTest` passes.
- `mvn package` → `target/classes/META-INF/build-info.properties` contains `build.version=1.1.0` and a `build.time=` line.
- `npm run build` → `dist/assets/*.js` contains `"1.1.0"` and an ISO build timestamp.
- `npm run check:version` → `Version OK: 1.1.0`; exits 1 if package.json, pom.xml or the top CHANGELOG line differ.
- `Select-String` for `1.0.0-MVP` / `1.0.0-mvp` in HealthController, pom.xml and package.json → zero hits.
- Signed in, open the account menu → the line matches the mockup's "In sync" state; with the API stopped → `api unavailable`.

## Reference patterns
- `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/controller/ShoppingListControllerTest.java:25`: context-free controller test
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/PasswordLoginRequest.java:1`: record DTO
- `foodbytes-app/client/src/utils/dateUtils.js:105`: `toLocale*` date formatting
- `foodbytes-app/client/package.json:9`: `check:*` node script convention
- `C:\Users\jossd\Downloads\mpp-9-version-line-mockup.html`: visual contract

## Constraints
- `/api/health` stays `permitAll` and returns HTTP 200 even without build-info (the Docker `HEALTHCHECK` curls it).
- "Is my fix live?" relies on the per-ticket version bump; build time is the tie-breaker within one version.
- No `.claude/rules/` file applies (no recipe/ingredient/macro data).

## Verification commands
See `tasks.md` in the plan folder: every task carries its own `Run:` / `Expected:`.

## Open questions
- None. Interview skipped: the Jira ticket's ACs and the developer's 2026-10-10 red-line answer definition-of-done, scope, constraints and blast radius.
```

- [x] **Step 2: Confirm the file exists**

Run: `Get-ChildItem .docs\requirement-mpp-9-version-build-time-display-2026-10-10.md`
Expected: one file listed.

---

## Phase 2 — Backend build identity

This phase stamps the version and build time into the API jar and serves them from `/api/health`. It ends with `HealthControllerTest` green and the backend compiling. The frontend is untouched, and the JSON keeps `status: "UP"`, so the Docker `HEALTHCHECK` is unaffected.

### Task 2: Add build-info generation to pom.xml ✓

- Skill: java-backend

**Files:**
- Modify: `foodbytes-app/foodbytes-api/pom.xml:100-115`

- [x] **Step 1: Add the `build-info` execution to `spring-boot-maven-plugin`**

Inside the existing `<plugin>` for `spring-boot-maven-plugin`, after its `</configuration>`, add:
```xml
                <!-- MPP-9: writes META-INF/build-info.properties (version from this pom, build
                     time) so /api/health reports the running build instead of a literal. -->
                <executions>
                    <execution>
                        <goals>
                            <goal>build-info</goal>
                        </goals>
                    </execution>
                </executions>
```
Leave `<version>1.0.0-MVP</version>` alone for now; the version bump is Task 13.

- [x] **Step 2: Verify build-info is generated**

Run: `$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.20.8-hotspot"; $env:PATH = "$env:JAVA_HOME\bin;C:\Users\jossd\tools\apache-maven-3.9.9\bin;$env:PATH"; cd foodbytes-app\foodbytes-api; mvn -q package -DskipTests; Get-Content target\classes\META-INF\build-info.properties`
Expected: no Maven errors, and the file lists `build.version=1.0.0-MVP` and a `build.time=` line.

### Task 3: Write the failing HealthControllerTest ✓

- Skill: java-backend

**Files:**
- Test: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/controller/HealthControllerTest.java`

- [x] **Step 1: Create the test**

```java
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
```

- [x] **Step 2: Run it and watch it fail**

Run: `$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.20.8-hotspot"; $env:PATH = "$env:JAVA_HOME\bin;C:\Users\jossd\tools\apache-maven-3.9.9\bin;$env:PATH"; cd foodbytes-app\foodbytes-api; mvn test -Dtest=HealthControllerTest`
Expected: `BUILD FAILURE`, with a compilation error `cannot find symbol ... HealthDTO`.

### Task 4: Create the HealthDTO record ✓

- Skill: java-backend

**Files:**
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/HealthDTO.java`

- [x] **Step 1: Write the record**

```java
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
```

- [x] **Step 2: Compile**

Run: `$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.20.8-hotspot"; $env:PATH = "$env:JAVA_HOME\bin;C:\Users\jossd\tools\apache-maven-3.9.9\bin;$env:PATH"; cd foodbytes-app\foodbytes-api; mvn -q compile`
Expected: no errors.

### Task 5: Make HealthController read BuildProperties ✓

- Skill: java-backend

**Files:**
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/controller/HealthController.java:1-20`
- Test: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/controller/HealthControllerTest.java`

- [x] **Step 1: Replace the whole file**

```java
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
```

- [x] **Step 2: Run the test and watch it pass**

Run: `$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.20.8-hotspot"; $env:PATH = "$env:JAVA_HOME\bin;C:\Users\jossd\tools\apache-maven-3.9.9\bin;$env:PATH"; cd foodbytes-app\foodbytes-api; mvn test -Dtest=HealthControllerTest`
Expected: `Tests run: 3, Failures: 0, Errors: 0` and `BUILD SUCCESS`.

---

## Phase 3 — Frontend version line

This phase bakes the web version and build time into the bundle and renders the line in the account menu per the revised mockup. It ends with `npm run build` green. The package version stays `1.0.0-mvp` until Phase 4, which is harmless: the line just shows it.

### Task 6: Define build globals in vite.config.js ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/vite.config.js:1-5`

- [x] **Step 1: Read package.json and stamp the build time; add `define`**

Replace:
```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
```
with:
```js
import { readFileSync } from 'node:fs'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// MPP-9: build identity. package.json is the frontend's version source; the build time is
// stamped when this config loads (vite build), so the deployed bundle reports when it was built.
const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'))

export default defineConfig({
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __APP_BUILT_AT__: JSON.stringify(new Date().toISOString()),
  },
```

- [x] **Step 2: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors. The globals aren't referenced yet; this step checks that the config parses.

### Task 7: Create constants/buildInfo.js ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/constants/buildInfo.js`

- [x] **Step 1: Write the module**

```js
/**
 * MPP-9: build identity baked in by vite.config.js `define` at build time.
 * __APP_VERSION__ comes from package.json; __APP_BUILT_AT__ is the ISO timestamp of the build.
 * Read these constants, never the magic globals, so the identifiers live in one place.
 */
export const UNKNOWN_BUILD_VALUE = 'unknown'
export const WEB_VERSION = __APP_VERSION__
export const WEB_BUILT_AT = __APP_BUILT_AT__

// GET /api/health is tiny; anything slower than this means the API is down or deploying.
export const HEALTH_TIMEOUT_MS = 5000
```

- [x] **Step 2: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task 8: Add formatBuildTime to dateUtils.js ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/utils/dateUtils.js` (append after `formatDateRange`, end of file)

- [x] **Step 1: Append the helper**

```js

/**
 * MPP-9: format a build timestamp for the version line (e.g., "10 Oct 14:02").
 * Viewer's local time zone, 24-hour (en-GB uses h23, so midnight is "00:05", never "24:05").
 * @param {string} iso - ISO-8601 timestamp, or 'unknown'
 * @returns {string|null} null when the value is missing or unparseable
 */
export const formatBuildTime = (iso) => {
  const d = new Date(iso)
  if (!iso || Number.isNaN(d.getTime())) return null
  const day = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  return `${day} ${time}`
}
```

- [x] **Step 2: Smoke-check the helper in node**

Run: `cd foodbytes-app\client; node --input-type=module -e "import {formatBuildTime} from './src/utils/dateUtils.js'; console.log(formatBuildTime('2026-10-10T13:05:11Z'), '|', formatBuildTime('unknown'), '|', formatBuildTime(undefined))"`
Expected: `10 Oct 14:05 | null | null` on this machine (Irish Summer Time, UTC+1). Under another time zone the first value shifts by the offset but keeps the `D Mon HH:mm` shape.

### Task 9: Create healthService.js ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/services/healthService.js`

- [x] **Step 1: Write the service**

```js
import api from './api'
import { HEALTH_TIMEOUT_MS } from '../constants/buildInfo'

/**
 * MPP-9: GET /api/health → { status, version, builtAt } (all strings).
 * Public endpoint, no auth needed. The caller owns the AbortSignal.
 */
export async function getHealth({ signal } = {}) {
  const response = await api.get('/health', { signal, timeout: HEALTH_TIMEOUT_MS })
  return response.data
}
```

- [x] **Step 2: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task 10: Create the useBuildInfo hook ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/hooks/useBuildInfo.js`

- [x] **Step 1: Write the hook**

```js
import { useEffect, useState } from 'react'
import { getHealth } from '../services/healthService'
import { UNKNOWN_BUILD_VALUE, WEB_BUILT_AT, WEB_VERSION } from '../constants/buildInfo'

const WEB = { version: WEB_VERSION, builtAt: WEB_BUILT_AT }

// Resolved /api/health payload, shared across mounts so re-opening the account menu does
// not refetch. Failures are deliberately not cached, so the next open retries.
let cachedApi = null

/**
 * MPP-9: web build identity (baked in) plus the API's (fetched once). Status is
 * 'loading' | 'success' | 'error'. "Empty" (a 200 missing fields) is normalised per field
 * to 'unknown', which never counts as a mismatch. Only versions are compared; build times
 * of separately deployed services legitimately differ.
 */
function useBuildInfo() {
  const [api, setApi] = useState(cachedApi)
  const [status, setStatus] = useState(cachedApi ? 'success' : 'loading')

  useEffect(() => {
    if (cachedApi) return undefined
    const controller = new AbortController()
    getHealth({ signal: controller.signal })
      .then((data) => {
        cachedApi = normaliseHealth(data)
        setApi(cachedApi)
        setStatus('success')
      })
      .catch(() => {
        // An abort (menu closed mid-request) is not an error; the next mount retries.
        if (controller.signal.aborted) return
        setStatus('error')
      })
    return () => controller.abort()
  }, [])

  const versionMismatch =
    status === 'success' && api.version !== UNKNOWN_BUILD_VALUE && api.version !== WEB.version

  return { status, web: WEB, api, versionMismatch }
}

function normaliseHealth(data) {
  return {
    version: knownOrUnknown(data?.version),
    builtAt: knownOrUnknown(data?.builtAt),
  }
}

function knownOrUnknown(value) {
  return typeof value === 'string' && value.trim() ? value : UNKNOWN_BUILD_VALUE
}

export default useBuildInfo
```

- [x] **Step 2: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task 11: Create the VersionInfo component and styles ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/components/layout/VersionInfo.jsx`
- Create: `foodbytes-app/client/src/components/layout/VersionInfo.css`

- [x] **Step 1: Write the component (text and states per the mockup spec panel)**

```jsx
import useBuildInfo from '../../hooks/useBuildInfo'
import { UNKNOWN_BUILD_VALUE } from '../../constants/buildInfo'
import { formatBuildTime } from '../../utils/dateUtils'
import './VersionInfo.css'

const VERSION_MISMATCH_NOTE = 'Frontend and API are on different versions'

// MPP-9: "v1.1.0 · web 10 Oct 14:02 · api 10 Oct 14:05". Tells the developer whether a fix
// is deployed: live once the version shown is ≥ the ticket's CHANGELOG line. Amber means
// the two Railway services report different versions (usually one is still deploying).
function VersionInfo() {
  const { status, web, api, versionMismatch } = useBuildInfo()

  return (
    <div className="version-info">
      <span>v{web.version}</span>
      <span className="version-info__sep" aria-hidden="true">·</span>
      <BuildTime label="web" iso={web.builtAt} />
      <span className="version-info__sep" aria-hidden="true">·</span>
      <ApiPart status={status} api={api} versionMismatch={versionMismatch} />
      {versionMismatch && <span className="version-info__note">{VERSION_MISMATCH_NOTE}</span>}
    </div>
  )
}

function ApiPart({ status, api, versionMismatch }) {
  if (status === 'loading') return <span>api …</span>
  if (status === 'error') return <span className="version-info__part--muted">api unavailable</span>
  return (
    <BuildTime
      label="api"
      iso={api.builtAt}
      suffix={versionMismatch ? ` (v${api.version})` : ''}
      mismatch={versionMismatch}
    />
  )
}

function BuildTime({ label, iso, suffix = '', mismatch = false }) {
  const formatted = formatBuildTime(iso)
  const className = mismatch
    ? 'version-info__part--mismatch'
    : formatted ? undefined : 'version-info__part--muted'
  const title = formatted ? `Built ${new Date(iso).toLocaleString('en-GB')}` : undefined

  return (
    <span className={className} title={title}>
      {label} {formatted ?? UNKNOWN_BUILD_VALUE}{suffix}
    </span>
  )
}

export default VersionInfo
```

- [x] **Step 2: Write the styles (tokens from `global.css`, matching the mockup)**

```css
/* MPP-9: deployed-version line, last row of the account menu (.user-dropdown). */
.version-info {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0 6px;
  padding: var(--spacing-sm) var(--spacing-md);
  border-top: 1px solid var(--border-color);
  background: var(--bg-secondary);
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.7rem;
  line-height: 1.4;
  color: var(--text-secondary);
}

.version-info__sep {
  opacity: 0.6;
}

/* Amber reuses the near-target pill pair, already tuned for AA contrast. */
.version-info__part--mismatch {
  padding: 0 4px;
  border-radius: 4px;
  background: var(--macro-near-target-pill-bg);
  color: var(--macro-near-target-pill-text);
  font-weight: 600;
}

.version-info__part--muted {
  font-style: italic;
}

.version-info__note {
  flex-basis: 100%;
  font-family: inherit;
  color: var(--macro-near-target-pill-text);
}
```

- [x] **Step 3: Check file sizes against the 400-line budget**

Run: `cd foodbytes-app\client; (Get-Content src\components\layout\VersionInfo.jsx | Measure-Object -Line).Lines; (Get-Content src\hooks\useBuildInfo.js | Measure-Object -Line).Lines`
Expected: both under 200.

- [x] **Step 4: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task 12: Mount VersionInfo in the account menu ✓ (Step 4 = developer manual check, pending)

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/layout/Header.jsx:6,66-68`

- [x] **Step 1: Import the component**

After `import DefaultPortionsControl from './DefaultPortionsControl'` add:
```jsx
import VersionInfo from './VersionInfo'
```

- [x] **Step 2: Mount it as the last child of `.user-dropdown`**

Replace:
```jsx
                    <button className="logout-btn" onClick={logout}>
                      Sign Out
                    </button>
                  </div>
```
with:
```jsx
                    <button className="logout-btn" onClick={logout}>
                      Sign Out
                    </button>
                    {/* MPP-9: mounts only while the menu is open, so /api/health is fetched lazily */}
                    <VersionInfo />
                  </div>
```

- [x] **Step 3: Build and confirm the build time is baked in**

Run: `cd foodbytes-app\client; npm run build; Select-String -Path dist\assets\*.js -Pattern '"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z"' -List | Select-Object -First 1`
Expected: `built in <n>s`, and one match line naming a `dist\assets\index-*.js` file.

- [ ] **Step 4: Manual check (developer, dev server)**

Run: `cd foodbytes-app\client; npm run dev`, with the backend running on :8080 (`mvn spring-boot:run` using the toolchain prefix).
Expected at `http://localhost:5173/`, signed in, at 375px width and at desktop width: tap the avatar, and the menu's last row reads `v1.0.0-mvp · web <D Mon HH:mm> · api <D Mon HH:mm> (v1.0.0-MVP)`, with the api part in amber and the note "Frontend and API are on different versions". Before Phase 4 the manifests differ in case, so this is the version-mismatch state working. Each time shows a full-date tooltip on hover. Then stop the backend, reload and open the menu: it shows `api unavailable`. This matches the mockup's "Version mismatch" and "API unreachable" states. After Task 13, re-check: no amber, which is the "In sync" state. (QA: emit as MANUAL VERIFICATION NEEDED.)

---

## Phase 4 — One version number + CHANGELOG

This phase creates the CHANGELOG, bumps both manifests to 1.1.0 (MPP-9 is a Story, so a minor bump) and adds the agreement check. It ends with `check:version` passing: the first application of the convention that Phase 5 documents.

### Task 13: Create CHANGELOG.md and bump both manifests to 1.1.0 ✓

- Skill: none (release bookkeeping, the convention this ticket introduces)

**Files:**
- Create: `CHANGELOG.md`
- Modify: `foodbytes-app/client/package.json:3`
- Modify: `foodbytes-app/foodbytes-api/pom.xml:17`

- [x] **Step 1: Create `CHANGELOG.md` at the repo root**

```markdown
# Changelog

One line per ticket, newest first: `<version> — <ticket key>: <summary>`. Bump rules and how
to check what is deployed: `CLAUDE.md` → Versioning & deploy verification.

1.1.0 — MPP-9: show deployed version + build time in the app
1.0.0 — baseline before per-ticket versioning (shipped as 1.0.0-mvp)
```

- [x] **Step 2: Bump `package.json`**

Replace `"version": "1.0.0-mvp",` with `"version": "1.1.0",`.

- [x] **Step 3: Bump `pom.xml`**

Replace `<version>1.0.0-MVP</version>` (line 17, directly under `<artifactId>foodbytes-api</artifactId>`) with `<version>1.1.0</version>`. Do not touch the parent's `<version>3.2.0</version>`.

### Task 14: Add the version agreement check ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/scripts/check-version.mjs`
- Modify: `foodbytes-app/client/package.json:9`

- [x] **Step 1: Write the script**

```js
// MPP-9: package.json, pom.xml and the top CHANGELOG line must carry the same SemVer version.
// Each manifest is the version source for its own build (Railway builds each service from its
// own folder, so a shared root file is unreachable), which makes this check the single source
// of truth. Dev-time only: not run inside Docker, where the sibling folders are absent.
import { readFileSync } from 'node:fs'

const SEMVER = /^\d+\.\d+\.\d+$/

const read = (relativePath) => readFileSync(new URL(relativePath, import.meta.url), 'utf8')

const packageVersion = JSON.parse(read('../package.json')).version
const pomVersion = read('../../foodbytes-api/pom.xml')
  .match(/<artifactId>foodbytes-api<\/artifactId>\s*<version>([^<]+)<\/version>/)?.[1]
const changelogVersion = read('../../../CHANGELOG.md').match(/^(\d+\.\d+\.\d+) — /m)?.[1]

const errors = []
if (!SEMVER.test(packageVersion ?? '')) errors.push(`package.json version "${packageVersion}" is not MAJOR.MINOR.PATCH`)
if (pomVersion !== packageVersion) errors.push(`pom.xml version "${pomVersion}" ≠ package.json "${packageVersion}"`)
if (changelogVersion !== packageVersion) errors.push(`CHANGELOG.md top entry "${changelogVersion}" ≠ package.json "${packageVersion}"`)

if (errors.length > 0) {
  errors.forEach((message) => console.error(`✗ ${message}`))
  process.exit(1)
}
console.log(`Version OK: ${packageVersion}`)
```

- [x] **Step 2: Wire the npm script**

In `package.json` → `scripts`, after `"check:macros": "node src/utils/macroStatus.check.mjs"`, add a comma and:
```json
    "check:version": "node scripts/check-version.mjs"
```

- [x] **Step 3: Run the check (expect a pass)**

Run: `cd foodbytes-app\client; npm run check:version`
Expected: `Version OK: 1.1.0`, exit code 0.

- [x] **Step 4: Prove it fails on drift, then restore**

Run: `cd foodbytes-app\client; Copy-Item ..\..\CHANGELOG.md $env:TEMP\cl.bak; (Get-Content -Encoding utf8 ..\..\CHANGELOG.md) -replace '^1\.1\.0 ', '1.0.9 ' | Set-Content -Encoding utf8 ..\..\CHANGELOG.md; npm run check:version; Copy-Item $env:TEMP\cl.bak ..\..\CHANGELOG.md -Force; npm run check:version`
Expected: the first run prints `✗ CHANGELOG.md top entry "1.0.9" ≠ package.json "1.1.0"` and exits non-zero; the second run prints `Version OK: 1.1.0`. Afterwards, `git diff CHANGELOG.md` shows no change from Task 13.

- [x] **Step 5: Backend still green with the new version**

Run: `$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.20.8-hotspot"; $env:PATH = "$env:JAVA_HOME\bin;C:\Users\jossd\tools\apache-maven-3.9.9\bin;$env:PATH"; cd foodbytes-app\foodbytes-api; mvn -q package -DskipTests; Select-String -Path target\classes\META-INF\build-info.properties -Pattern "build.version=1.1.0"`
Expected: one matching line.

---

## Phase 5 — Convention docs and fb workflow

This phase documents the convention once, in CLAUDE.md, and makes the bump a required step of every future contract. It's docs-only with no build impact, so it's a safe boundary.

### Task 15: Add "Versioning & deploy verification" to CLAUDE.md ✓

- Skill: none (project documentation, owned by CLAUDE.md itself)

**Files:**
- Modify: `CLAUDE.md` (insert immediately before the `## Conventions` heading)

- [x] **Step 1: Insert the section**

```markdown
## Versioning & deploy verification

- **Where the version lives:** `foodbytes-app/client/package.json` → `version` and `foodbytes-app/foodbytes-api/pom.xml` → the project `<version>` (under `<artifactId>foodbytes-api</artifactId>`). They must be identical; `cd foodbytes-app/client && npm run check:version` fails if they, or the top line of `CHANGELOG.md`, disagree. Each manifest feeds its own build (Vite `define` reads package.json; Spring Boot build-info reads pom.xml) because Railway builds each service from its own folder, so a shared root file would be outside both Docker contexts. Never hard-code the version anywhere else.
- **Bump rules (SemVer, one bump per ticket):** Bug → PATCH (1.3.0 → 1.3.1). Story or Task → MINOR and reset PATCH (1.3.1 → 1.4.0). MAJOR only on an explicit decision. Work with no Jira key: a bug fix bumps PATCH, anything else MINOR. Every fb contract carries the bump as Final-verification Task M.1 (`.claude/commands/fb-plan.md`), and `/fb-apply` QA gates on `check:version`.
- **CHANGELOG.md** (repo root): newest first, one line per ticket, `<version> — <MPP-n>: <summary>` (use the plan slug instead of the key when there is no ticket).
- **Commit messages carry the ticket key:** `MPP-n: <summary>`, so a ticket's commits are findable with `git log --grep "MPP-n:"`.
- **What is deployed:** the account menu's last row shows `v<version> · web <build time> · api <build time>` (the viewer's local time). Amber means the two Railway services report different versions; usually one is still deploying. `GET /api/health` returns `version` and `builtAt`. No commit SHAs are recorded (decided on MPP-9).
- **Is my fix live?** Look up the ticket's version in `CHANGELOG.md`. The fix is live once the deployed version is at least that version: use the web version for a frontend fix and the api version for a backend fix. Two deploys of the same version (a push that skipped the bump) can only be told apart by build time, which is one more reason never to skip the bump.
```

- [x] **Step 2: Confirm the section landed once, before Conventions**

Run: `Select-String -Path CLAUDE.md -Pattern "^## Versioning & deploy verification","^## Conventions"`
Expected: two hits, with Versioning on the lower line number.

### Task 16: Make the version bump a mandatory task in the fb-plan template ✓

- Skill: none (fb workflow command file, not app code)

**Files:**
- Modify: `.claude/commands/fb-plan.md:337-370,402`

- [x] **Step 1: Replace the Final-verification template block**

In the `tasks.md` template, replace everything from the line `The closing phase. No production changes — only sanity-checks that the cumulative work is clean.` through the end of the `### Task M.4: Update the PR description` block (its last bullet is `- A one-line note for future contributors on any new convention introduced.`) with:

```markdown
The closing phase. No production changes beyond the version bump — only sanity-checks that the cumulative work is clean.

### Task M.1: Bump version + CHANGELOG

- Skill: none — release bookkeeping per `CLAUDE.md` → Versioning & deploy verification

**Files:**
- Modify: `foodbytes-app/client/package.json` (`version`)
- Modify: `foodbytes-app/foodbytes-api/pom.xml` (project `<version>`)
- Modify: `CHANGELOG.md` (prepend one line)

- [ ] **Step 1: Bump both manifests**

Read the current version from `foodbytes-app/client/package.json`. This ticket is a [Jira issue type] → bump [PATCH | MINOR and reset PATCH]. Write the same new version into `package.json` → `version` and `pom.xml` → the `<version>` directly under `<artifactId>foodbytes-api</artifactId>`. (Planner: write the issue type and the rule; never the target number — it is computed at apply time, so two parallel contracts cannot collide on a stale value.)

- [ ] **Step 2: Prepend the CHANGELOG line**

Directly above the current top entry in `CHANGELOG.md`: `<new version> — <MPP-n, or the plan slug>: <one-line summary>`

- [ ] **Step 3: Verify agreement**

Run: `cd foodbytes-app\client; npm run check:version`
Expected: `Version OK: <new version>`

### Task M.2: Grep for stale references

- [ ] **Step 1: Confirm no [stale-pattern] remains**

Run: `Get-ChildItem -Path foodbytes-app\client\src -Recurse -Include *.js,*.jsx | Select-String -Pattern "<pattern>"`
Expected: zero hits.

### Task M.3: Run the full backend test suite

- [ ] **Step 1: Clean test run**

Run: `cd foodbytes-app\foodbytes-api; mvn test`
Expected: `BUILD SUCCESS`, 0 failures, 0 errors.

### Task M.4: Production build

- [ ] **Step 1: Build the client**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task M.5: Update the PR description

- [ ] **Step 1: Write / update `pr-description.md` in this plan folder for the developer to paste**

Include:
- Link to `plan.md` in this folder.
- Summary of the change, and the new version from Task M.1.
- Any migration that must be applied to the Railway MySQL, and the required ordering.
- Verification results from the prior phases.
- A one-line note for future contributors on any new convention introduced.
- A suggested commit subject in the form `MPP-n: <summary>`.
```

The replacement contains no code fences, so it sits safely inside the template's outer ```` ```markdown ```` fence. It also fixes the template's grep command: Windows PowerShell 5.1's `Select-String -Path` does not expand `**`.

- [x] **Step 2: Update the closing-phase rule**

Replace:
```
- The closing phase is named `## Phase N — Final verification` and contains only no-production-change sanity checks (grep audits, full backend suite, production build, PR description).
```
with:
```
- The closing phase is named `## Phase N — Final verification`. It opens with the mandatory **Task M.1: Bump version + CHANGELOG** (bump type from the Jira issue type — see `CLAUDE.md` → Versioning & deploy verification), then contains only no-production-change sanity checks (grep audits, full backend suite, production build, PR description). A contract whose own feature work already performs the bump may replace M.1 with a one-line note naming the task that did it.
```

- [x] **Step 3: Verify**

Run: `Select-String -Path .claude\commands\fb-plan.md -Pattern "Task M.1: Bump version","Task M.5: Update the PR description","opens with the mandatory"`
Expected: three hits.

### Task 17: Gate /fb-apply on the version check and report it ✓

- Skill: none (fb workflow command file, not app code)

**Files:**
- Modify: `.claude/commands/fb-apply.md:248-250,346-347`

- [x] **Step 1: Add the standing QA gate**

In the 5.3 QA prompt, directly after the line that begins ``[Paste verbatim the `Run:` / `Expected:` pairs from the contract's closing``, add:
```
Always also run, whether or not the Implementer did: `cd foodbytes-app\client; npm run check:version` → Expected: `Version OK: <x.y.z>`, and confirm the top line of `CHANGELOG.md` names this contract's ticket key (or slug). A missing or failing bump FAILS Task M.1 (see `CLAUDE.md` → Versioning & deploy verification).
```

- [x] **Step 2: Add a Version block to the Step 7 report**

Directly after:
```
### Jira
- [The transition performed, e.g. `MPP-12 Coding → Ready for Test` — or the flag added, or plainly that it was skipped or failed]
```
add:
```

### Version
- [`<old> → <new>` and the CHANGELOG line added — or plainly that the bump is missing or `check:version` failed]
```

- [x] **Step 3: Verify**

Run: `Select-String -Path .claude\commands\fb-apply.md -Pattern "npm run check:version","^### Version"`
Expected: two or more hits, including one `### Version`.

---

## Phase 6 — Final verification

No production changes. This contract's own version bump already happened in Task 13 (it is the feature), which satisfies the new Task M.1. Sanity checks only.

### Task 18: Grep for stale versions and SHA remnants ✓

- Skill: none (verification only)

- [x] **Step 1: Old version strings are gone from code and manifests**

Run: `Select-String -Path foodbytes-app\foodbytes-api\pom.xml,foodbytes-app\client\package.json,foodbytes-app\foodbytes-api\src\main\java\com\foodbytes\controller\HealthController.java -Pattern "1\.0\.0-MVP","1\.0\.0-mvp"`
Expected: zero hits.

- [x] **Step 2: Components never read the magic globals directly**

Run: `Get-ChildItem -Path foodbytes-app\client\src -Recurse -Include *.js,*.jsx | Select-String -Pattern "__APP_(VERSION|BUILT_AT)__" | Select-Object Path -Unique`
Expected: only `src\constants\buildInfo.js`.

- [x] **Step 3: No commit-SHA plumbing crept in**

Run: `@(Get-ChildItem foodbytes-app\client\Dockerfile, foodbytes-app\foodbytes-api\Dockerfile, foodbytes-app\foodbytes-api\pom.xml, foodbytes-app\client\vite.config.js) + @(Get-ChildItem -Path foodbytes-app\client\src, foodbytes-app\foodbytes-api\src -Recurse -Include *.js,*.jsx,*.java) | Select-String -Pattern "RAILWAY_GIT_COMMIT_SHA|build\.commit|__APP_COMMIT__"`
Expected: zero hits.

- [x] **Step 4: No new console.log**

Run: `Get-ChildItem -Path foodbytes-app\client\src -Recurse -Include *.js,*.jsx | Select-String -Pattern "console\.(log|debug)" | Measure-Object | Select-Object -ExpandProperty Count`
Expected: `6` or fewer (the known baseline).

### Task 19: Run the full backend test suite ✓ (run by QA: Tests run: 74, Failures: 0, Errors: 0)

- Skill: none (verification only)

- [x] **Step 1: Clean test run**

Run: `$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.20.8-hotspot"; $env:PATH = "$env:JAVA_HOME\bin;C:\Users\jossd\tools\apache-maven-3.9.9\bin;$env:PATH"; cd foodbytes-app\foodbytes-api; mvn test`
Expected: `BUILD SUCCESS`, 0 failures, 0 errors; the test count is the pre-MPP-9 count + 3 (`HealthControllerTest`).

### Task 20: Production build and version check ✓

- Skill: none (verification only)

- [x] **Step 1: Build the client**

Run: `cd foodbytes-app\client; npm run build; Select-String -Path dist\assets\*.js -Pattern '"1\.1\.0"' -List | Select-Object -First 1`
Expected: `built in <n>s`, no errors, and one match (the baked-in version).

- [x] **Step 2: Version agreement**

Run: `cd foodbytes-app\client; npm run check:version`
Expected: `Version OK: 1.1.0`.

### Task 21: Confirm the deployed version on Railway — developer-owned, pending deploy

- Skill: none (developer check against the deployed services; no agent can trigger a Railway deploy)

- [ ] **Step 1: Developer opens production after both services redeploy**

Run: open `https://the-pre-aisle-plan-production.up.railway.app/api/health` in a browser.
Expected: `"version":"1.1.0"` and a `builtAt` within minutes of the deploy. Then, signed in on the frontend, open the account menu: `v1.1.0 · web <time> · api <time>`, with no amber once both services have finished deploying.

### Task 22: Write the PR description ✓

- Skill: none (documentation for the developer to paste)

**Files:**
- Create: `.claude/contract/MPP-9-deployed-version-commit-sha/pr-description.md`

- [x] **Step 1: Write `pr-description.md`**

Include:
- A link to `plan.md` in this folder, and the mockup path.
- Summary: build-info `/api/health` (`version`, `builtAt`); the account-menu version line with build times and version-mismatch highlighting; versions unified at 1.1.0; `CHANGELOG.md`; `check:version`; the fb workflow + CLAUDE.md convention. Note that commit SHAs were deliberately dropped (ticket AC1 withdrawn by the developer on 2026-10-10).
- No migration; no Dockerfile or Railway settings change. The post-deploy check from Task 21.
- Verification results from Tasks 5, 8, 12, 14, 19, 20.
- Convention note: every contract now ends with Task M.1 (bump + CHANGELOG); commits use `MPP-n: <summary>`.
- Suggested commit subject: `MPP-9: show deployed version + build time in the app`.

---

## Self-review

**Spec coverage (ticket ACs as amended by the 2026-10-10 red-line):**
- AC1 (SHA build args): withdrawn by the developer. Task 18 Step 3 guards against SHA plumbing creeping in.
- AC2 `/api/health` build-time `version` + `builtAt`: Tasks 2, 3, 4, 5.
- AC3 Vite `define` + displayed line with the api part from `/api/health` (build times instead of SHAs): Tasks 6, 7, 8, 9, 10, 11, 12.
- AC4 one version source, manifests agree, no hard-coding: Tasks 5, 13, 14, 18.
- AC5 SemVer per ticket + `CHANGELOG.md`: Task 13 (first application), Task 15 (rules).
- AC6 fb workflow required step: Tasks 16, 17.
- AC7 CLAUDE.md convention incl. `MPP-n:` commits; the live-check via CHANGELOG version instead of `git merge-base`: Task 15.
- Requirement doc (developer-added `requirements` skill): Task 1.
- Post-deploy confirmation: Task 21.

**Placeholder scan:** No `TBD`, `TODO`, `implement later`, `appropriate error handling`, or "similar to Task N". The bracketed `[Jira issue type]` / `[PATCH | MINOR …]` / `[stale-pattern]` in Task 16 are deliberate template slots inside fb-plan.md's template, which the planner fills in per contract.

**Type / name consistency:**
- JSON keys `status` / `version` / `builtAt` are identical in `HealthDTO` (Task 4), `HealthControllerTest` (Task 3) and `normaliseHealth` (Task 10).
- `__APP_VERSION__` / `__APP_BUILT_AT__` are defined in Task 6 and read only in Task 7.
- `UNKNOWN_BUILD_VALUE`, `WEB_VERSION`, `WEB_BUILT_AT` and `HEALTH_TIMEOUT_MS` are defined in Task 7 and used in Tasks 9–11.
- `formatBuildTime` is defined in Task 8 and used in Task 11.
- `getHealth`, `useBuildInfo` (returning `{ status, web, api, versionMismatch }`) and `VersionInfo` are named consistently across Tasks 9–12.
- The CSS classes `version-info`, `version-info__sep`, `version-info__part--mismatch`, `version-info__part--muted` and `version-info__note` are identical in Task 11's JSX and CSS.
- `check:version` / `Version OK: <x>` are consistent across Tasks 14–17 and 20.
- The template renumbering (M.1 bump … M.5 PR description) is consistent between Task 16 and Task 15's reference to "Task M.1".

**Phase boundary cleanliness:**
- Phase 1: docs only; both builds untouched.
- Phase 2: the backend compiles and `HealthControllerTest` passes; `status` is kept, so the `HEALTHCHECK` is unaffected.
- Phase 3: `npm run build` is green. The line shows amber because the manifests differ in case (`1.0.0-mvp` vs `1.0.0-MVP`). That's correct behaviour, documented in Task 12, and resolved by Phase 4.
- Phase 4: manifests and CHANGELOG agree at 1.1.0; `check:version` and the backend package both pass.
- Phase 5: docs/workflow only; no build impact.
- Phase 6: verification only, no production changes.
