# Public release review

23 November 2026. The repository remains private. Production stays on ASO until cleanup is complete and Ian approves public release.

## Completed in this pass

- Replaced the accumulated README with current setup, source layout, research caveats and hosting status. Removed contradictory no-CI instructions and obsolete collection counts.
- Removed 272 generated `docs/` files from version control and ignored that output directory. Local files remain available and the existing ASO build, packaging and deployment paths are unchanged.
- Retained generated `web/pages/` files because the current local server and preview service use them directly. Removing them needs a generation step in those workflows.
- Checked all reachable Git blobs for common private-key/token signatures, quoted password assignments and known hosting connection details. No matches were found for the credential patterns. Historical hosting details were found in `RELEASE.md` and `scripts/deploy-ftps.py`. This is a bounded pattern scan, not proof that the entire repository is free of sensitive information.
- Checked tracked filenames for environment files, credentials, backups and logs. The deployment example contains placeholders; the real configuration and release backups are ignored.
- Reviewed the existing code/content licence split and attribution document. Natural Earth and Pleiades provenance are documented. No relicensing was performed.

Verification: 116 JavaScript tests and two Python deployment-planning tests passed. ASO output and GitHub Pages staging output both regenerated successfully. Nothing was published.

## Remaining before visibility changes

Historical hosting details must be removed from the public history, not merely from the current tree. Prepare a sanitised copy and inspect the changes before rewriting remote branches or tags. Preserve a private recovery copy. A history rewrite changes commit identifiers, including those used by old releases and CI artifacts, so rollback references must be updated and the affected branches/tags agreed before pushing.

Review the remaining tracked design images and research inputs for private information and distribution rights. The textual pattern scan does not inspect image contents. Review obsolete campaign views and supporting assets for active links/imports before removing them; their age alone is not evidence that they are unused.

Once these checks are complete, verify a fresh checkout, review the final public file tree and obtain Ian's approval to change repository visibility. Hosting cutover follows that approval.

## History replacement completed

Ian approved replacing the remote history on 23 November. A private recovery bundle was verified before the rewrite. The sanitised copy was scanned across 1,474 reachable objects, with no remaining matches for the checked hosting details or credential patterns. A fresh checkout passed 116 JavaScript tests and both site builds. The 33 design images and sharing image were visually reviewed; the two images with EXIF contained only dimensions and colour-space metadata. Earlier campaign code remains linked from the explorer and has been retained.

The remote main and staging branches, cleanup branch and v0.0.1 tag now match the sanitised copy. The push used exact expected previous references and was atomic. The working checkout was aligned only after confirming its files were unchanged. The repository remains private, Pages has no production custom domain, and the live ASO site returned HTTP 200 after the update.

This does not yet remove every GitHub reference to the old history. The closed, merged PR #1 still has an old head reference under refs/pull/1/head. Treat that as a public-release blocker until its retained history is resolved. Do not claim that rewriting branches and tags purges GitHub pull-request references or cached commits. Historical CI artifacts and logs also need review before visibility changes. The private recovery bundle and original local objects must never be pushed with --mirror.
