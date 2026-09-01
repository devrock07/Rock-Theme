import fs from 'fs';
import path from 'path';

const workflow = fs.readFileSync(
    path.resolve(__dirname, '..', '.github', 'workflows', 'upstream-autopilot.yaml'),
    'utf8'
);

describe('Upstream Autopilot safety invariants', () => {
    it('pins both upstream tags to the commits resolved during detection', () => {
        expect(workflow).toContain('current_upstream_commit: ${{ steps.versions.outputs.current_upstream_commit }}');
        expect(workflow).toContain('latest_upstream_commit: ${{ steps.versions.outputs.latest_upstream_commit }}');
        expect(workflow).toContain('An upstream release tag moved after detection; refusing the candidate.');
    });

    it('uses Rock Theme release records instead of the shared Git tag namespace', () => {
        expect(workflow).toContain('repos/${GITHUB_REPOSITORY}/releases?per_page=100');
        expect(workflow).not.toContain("git tag --list 'v[0-9]*'");
    });

    it('keeps an immutable release tag as the release source after main advances', () => {
        expect(workflow).toContain('git merge-base --is-ancestor "$tag_commit" "$main_commit"');
        expect(workflow).toContain('head_commit="$tag_commit"');
        expect(workflow).toContain('edge_commit="$main_commit"');
    });

    it('refuses to publish a pending candidate for a different package version', () => {
        expect(workflow).toContain('if [ "$theme_tag" != "$package_theme" ]; then');
        expect(workflow).toContain('no longer matches main package version');
        expect(workflow).toContain('Package version $package_theme is older than published Rock Theme release');
    });

    it('removes only the exact persisted retry candidate', () => {
        expect(workflow).toContain('if [ "$marker_sha" != "$CANDIDATE_SHA" ]; then');
        expect(workflow).toContain('--force-with-lease="${marker_ref}:${CANDIDATE_SHA}"');
    });

    it('never repairs or publishes a release without exact Autopilot ownership', () => {
        expect(workflow).toContain('<!-- rock-theme-autopilot:source=${head_commit} -->');
        expect(workflow).toContain('if [ "$release_author" = \'github-actions[bot]\' ] &&');
        expect(workflow).toContain('mode=human-review');
        expect(workflow).toContain('Refusing to modify release $THEME_TAG because Autopilot ownership was not proven.');
    });
});
