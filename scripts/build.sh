#!/bin/sh
#!/usr/bin/env bash
set -Eeuo pipefail

# Noferic IDE release helper
# Usage: ./release.sh 2.2.7
#
# Optional environment variables:
#   LICENSE_COMMAND   Command that generates the license report.
#   LICENSE_FILE      Generated license report path.
#   ARTIFACT_GLOB     Bash glob for files to upload (default: dist/*).
#   REMOTE            Git remote (default: origin).
#   RELEASE_TITLE     GitHub release title (default: Noferic IDE vVERSION).
#
# Example:
#   LICENSE_COMMAND='npx license-checker --production --json --out THIRD_PARTY_LICENSES.json' \
#   LICENSE_FILE='THIRD_PARTY_LICENSES.json' \
#   ARTIFACT_GLOB='dist/*' \
#   ./release.sh 2.2.7

die() {
  printf 'release.sh: ERROR: %s\n' "$*" >&2
  exit 1
}

info() {
  printf '\n==> %s\n' "$*"
}

usage() {
  printf 'Usage: %s VERSION\n' "$0"
  printf 'Example: %s 2.2.7\n' "$0"
}

[[ $# -eq 1 ]] || { usage; exit 2; }
VERSION="$1"

# Deliberately accept simple numeric semver versions only.
[[ "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+([.-][0-9A-Za-z.-]+)?$ ]] \
  || die "Invalid version '$VERSION'. Use e.g. 2.2.7 or 2.2.7-rc.1."

TAG="v${VERSION}"
REMOTE="${REMOTE:-origin}"
LICENSE_FILE="${LICENSE_FILE:-THIRD_PARTY_LICENSES.json}"
ARTIFACT_GLOB="${ARTIFACT_GLOB:-dist/*}"
RELEASE_TITLE="${RELEASE_TITLE:-Noferic IDE ${TAG}}"

command -v git >/dev/null 2>&1 || die "git is required."
command -v npm >/dev/null 2>&1 || die "npm is required."
command -v gh  >/dev/null 2>&1 || die "GitHub CLI (gh) is required to publish the release."

[[ -f package.json ]] || die "Run this script from the project root (package.json not found)."
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || die "Not inside a Git repository."
git remote get-url "$REMOTE" >/dev/null 2>&1 || die "Git remote '$REMOTE' does not exist."
gh auth status >/dev/null 2>&1 || die "GitHub CLI is not authenticated. Run: gh auth login"

# Avoid publishing unrelated or uncommitted work.
if [[ -n "$(git status --porcelain)" ]]; then
  die "Working tree is not clean. Commit or stash changes before releasing."
fi

CURRENT_BRANCH="$(git branch --show-current)"
[[ -n "$CURRENT_BRANCH" ]] || die "Detached HEAD detected; switch to a branch before releasing."

if git rev-parse -q --verify "refs/tags/${TAG}" >/dev/null; then
  die "Local tag '$TAG' already exists."
fi

if git ls-remote --exit-code --tags "$REMOTE" "refs/tags/${TAG}" >/dev/null 2>&1; then
  die "Remote tag '$TAG' already exists."
fi

# Ensure the package version agrees with the requested release version.
PACKAGE_VERSION="$(node -p "require('./package.json').version" 2>/dev/null)" \
  || die "Could not read package.json version (Node.js is required)."
[[ "$PACKAGE_VERSION" == "$VERSION" ]] \
  || die "package.json version is '$PACKAGE_VERSION', but requested version is '$VERSION'. Update package.json and commit it first."

# Ensure this script doesn't publish a tag based on a stale local branch.
info "Checking local branch against $REMOTE/$CURRENT_BRANCH"
git fetch "$REMOTE" "$CURRENT_BRANCH" --tags
LOCAL_HEAD="$(git rev-parse HEAD)"
REMOTE_HEAD="$(git rev-parse "refs/remotes/${REMOTE}/${CURRENT_BRANCH}" 2>/dev/null)" \
  || die "Could not find remote branch ${REMOTE}/${CURRENT_BRANCH}."
[[ "$LOCAL_HEAD" == "$REMOTE_HEAD" ]] \
  || die "Local branch differs from $REMOTE/$CURRENT_BRANCH. Push/pull your changes first."

info "Generating third-party license report"
if [[ -n "${LICENSE_COMMAND:-}" ]]; then
  # LICENSE_COMMAND is intentionally shell-evaluated to allow npm/npx arguments.
  bash -o pipefail -c "$LICENSE_COMMAND" || die "License command failed."
  [[ -s "$LICENSE_FILE" ]] || die "License command completed, but '$LICENSE_FILE' is missing or empty."
  # Include the generated report in the release commit if the command changed it.
  if ! git diff --quiet -- "$LICENSE_FILE" || ! git diff --cached --quiet -- "$LICENSE_FILE" || [[ -n "$(git ls-files --others --exclude-standard -- "$LICENSE_FILE")" ]]; then
    git add -- "$LICENSE_FILE"
    git commit -m "chore: update third-party licenses for ${TAG}"
  fi
else
  cat >&2 <<'NOTICE'
No LICENSE_COMMAND configured. No license report was generated.
Set LICENSE_COMMAND and LICENSE_FILE, for example:
  LICENSE_COMMAND='npx license-checker --production --json --out THIRD_PARTY_LICENSES.json'
  LICENSE_FILE='THIRD_PARTY_LICENSES.json'
NOTICE
  die "Configure LICENSE_COMMAND and LICENSE_FILE before releasing."
fi

info "Running npm run build"
npm run build

# Gather artifacts after build. Bash glob expansion supports ARTIFACT_GLOB.
shopt -s nullglob
ARTIFACTS=( $ARTIFACT_GLOB )
shopt -u nullglob
((${#ARTIFACTS[@]} > 0)) || die "No artifacts matched ARTIFACT_GLOB='$ARTIFACT_GLOB'."
for artifact in "${ARTIFACTS[@]}"; do
  [[ -f "$artifact" ]] || die "Artifact '$artifact' is not a regular file. Set ARTIFACT_GLOB to the actual installer/binary files."
done

info "Creating annotated tag $TAG"
git tag -a "$TAG" -m "Release ${TAG}"

info "Pushing release commit and tag to $REMOTE"
git push "$REMOTE" "HEAD:${CURRENT_BRANCH}"
git push "$REMOTE" "$TAG"

info "Publishing GitHub Release and uploading artifacts"
gh release create "$TAG" "${ARTIFACTS[@]}" \
  --title "$RELEASE_TITLE" \
  --generate-notes

printf '\nRelease published successfully: %s\n' "$TAG"