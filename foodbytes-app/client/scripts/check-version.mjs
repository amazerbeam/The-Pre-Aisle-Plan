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
