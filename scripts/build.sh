
#!/usr/bin/env bash
set -Eeuo pipefail

# Usage: ./release.sh 2.2.7

die() {
    echo "ERROR: $*" >&2
    exit 1
}

confirm() {
    local answer
    read -r -p "$1 [y/N] " answer
    [[ "$answer" =~ ^[Yy]([Ee][Ss])?$ ]]
}

[[ $# -eq 1 ]] || die "Usage: $0 VERSION"

VERSION="$1"
TAG="v$VERSION"
REMOTE="origin"
LICENSE_FILE="THIRD_PARTY_LICENSES.json"
ARTIFACT_GLOB="${ARTIFACT_GLOB:-dist/*}"

[[ "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+([.-][0-9A-Za-z.-]+)?$ ]] \
    || die "Invalid version: $VERSION"

command -v git >/dev/null || die "git is required"
command -v npm >/dev/null || die "npm is required"
command -v node >/dev/null || die "Node.js is required"
command -v gh >/dev/null || die "GitHub CLI is required"

[[ -f package.json ]] || die "Run this script from the project root"

git rev-parse --is-inside-work-tree >/dev/null \
    || die "Not inside a Git repository"

gh auth status >/dev/null 2>&1 \
    || die "Run 'gh auth login' first"

BRANCH="$(git branch --show-current)"
[[ -n "$BRANCH" ]] || die "Detached HEAD"

PACKAGE_VERSION="$(node -p "require('./package.json').version")"

[[ "$PACKAGE_VERSION" == "$VERSION" ]] \
    || die "package.json version is $PACKAGE_VERSION, expected $VERSION"

git remote get-url "$REMOTE" >/dev/null 2>&1 \
    || die "Git remote '$REMOTE' not found"

npm ls license-checker --depth=0 >/dev/null 2>&1 \
    || die "Install license-checker: npm install --save-dev license-checker"

# Fetch remote changes before checking branch synchronization.
echo "Fetching from $REMOTE..."
git fetch "$REMOTE" --prune --tags

git show-ref --verify --quiet "refs/tags/$TAG" \
    && die "Local tag $TAG already exists"

if git ls-remote --exit-code --tags "$REMOTE" "refs/tags/$TAG" \
    >/dev/null 2>&1; then
    die "Remote tag $TAG already exists"
fi

# Prompt before committing a dirty working tree.
if [[ -n "$(git status --porcelain)" ]]; then
    echo
    echo "Working tree is not clean:"
    git status --short

    confirm "Stage and commit ALL current changes?" \
        || die "Release cancelled"

    git add -A

    if ! git diff --cached --quiet; then
        git commit -m "chore: prepare release $TAG"
    fi
fi

# Pull remote changes only after confirmation.
REMOTE_BRANCH="refs/remotes/$REMOTE/$BRANCH"

if git show-ref --verify --quiet "$REMOTE_BRANCH"; then
    LOCAL_ONLY="$(git rev-list --count "$REMOTE_BRANCH..HEAD")"
    REMOTE_ONLY="$(git rev-list --count "HEAD..$REMOTE_BRANCH")"

    if (( REMOTE_ONLY > 0 )); then
        echo "Remote has $REMOTE_ONLY commit(s) not present locally."

        confirm "Pull remote changes using --ff-only?" \
            || die "Release cancelled"

        git pull --ff-only "$REMOTE" "$BRANCH" \
            || die "Pull failed; reconcile the branches manually"
    fi

    LOCAL_ONLY="$(git rev-list --count "$REMOTE_BRANCH..HEAD")"

    if (( LOCAL_ONLY > 0 )); then
        echo "Local branch has $LOCAL_ONLY commit(s) to push."

        confirm "Push local changes to $REMOTE/$BRANCH?" \
            || die "Release cancelled"

        git push "$REMOTE" "HEAD:$BRANCH"
    fi
else
    echo "No remote-tracking branch exists for $BRANCH."

    confirm "Push branch and set upstream?" \
        || die "Release cancelled"

    git push -u "$REMOTE" "$BRANCH"
fi

# Generate third-party licenses with the npm license-checker package.
echo "Generating third-party license report..."

npx --no-install license-checker \
    --production \
    --json \
    --out "$LICENSE_FILE" \
    || die "License generation failed"

[[ -s "$LICENSE_FILE" ]] \
    || die "License report was not generated"

# Commit the license report if it changed.
if ! git diff --quiet -- "$LICENSE_FILE" ||
   ! git diff --cached --quiet -- "$LICENSE_FILE" ||
   [[ -n "$(git ls-files --others --exclude-standard -- "$LICENSE_FILE")" ]]; then

    git add "$LICENSE_FILE"
    git commit -m "chore: update third-party licenses for $TAG"
fi

# Build the application.
echo "Running npm run build..."
npm run build || die "Build failed"

# Collect artifacts produced by the build.
shopt -s nullglob
ARTIFACTS=( $ARTIFACT_GLOB )
shopt -u nullglob

((${#ARTIFACTS[@]} > 0)) \
    || die "No release artifacts matched: $ARTIFACT_GLOB"

for artifact in "${ARTIFACTS[@]}"; do
    [[ -f "$artifact" ]] \
        || die "Artifact is not a regular file: $artifact"
done

# Do not publish if the build left source changes behind.
[[ -z "$(git status --porcelain)" ]] \
    || die "Build left uncommitted changes; inspect them before releasing"

# Push the license-report commit if needed.
git fetch "$REMOTE" "$BRANCH"

if ! git merge-base --is-ancestor HEAD "$REMOTE_BRANCH"; then
    confirm "Push release commits to $REMOTE/$BRANCH?" \
        || die "Release cancelled"

    git push "$REMOTE" "HEAD:$BRANCH"
fi

# Create and push the version tag.
echo "Creating tag $TAG..."
git tag -a "$TAG" -m "Release $TAG"

git push "$REMOTE" "$TAG"

# Publish binaries to GitHub Releases.
echo "Publishing GitHub Release..."

gh release create "$TAG" "${ARTIFACTS[@]}" \
    --title "Noferic IDE $TAG" \
    --generate-notes

echo "Release $TAG published successfully!"
