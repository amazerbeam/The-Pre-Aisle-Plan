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
