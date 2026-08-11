// Points git at the repo's committed .githooks/ dir instead of the default,
// untracked .git/hooks/ — so pre-push (verify-no-unintended-deletions.mjs)
// is live on every machine/worktree right after `npm install`, with nothing
// to remember to set up by hand. Safe to run repeatedly; a plain warning (not
// a failure) if it can't run, since it must never block install.
import { execFileSync } from 'node:child_process';

try {
  execFileSync('git', ['config', 'core.hooksPath', '.githooks'], { stdio: 'ignore' });
  console.log('git hooks: core.hooksPath -> .githooks (pre-push deletion check active)');
} catch (err) {
  console.warn('git hooks: could not set core.hooksPath, skipping (not a git repo?)', err.message);
}
