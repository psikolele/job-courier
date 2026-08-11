// Runs from .githooks/pre-push before every push to main. Diffs the commit
// currently live in production (the remote's main, i.e. what pre-push receives
// as remote_sha) against what's about to be pushed, and flags anything that
// looks like an accidental removal: deleted files, JSX components whose usage
// count went down, or large one-sided deletions in page/component/blog content.
//
// This cannot know intent — a real cleanup looks identical in a diff to an
// accidental one. So it never silently allows or silently blocks: it always
// prints what it found, and requires ALLOW_CONTENT_REMOVAL=1 to proceed past a
// flag. The point is forcing a deliberate "yes, this is on purpose" instead of
// a removal shipping as a side effect of an unrelated change.
import { execFileSync } from 'node:child_process';

const [, , baseSha, newSha] = process.argv;

if (!baseSha || /^0+$/.test(baseSha)) {
  console.log('verify-deletions: no previous production commit to diff against (new ref) — skipping.');
  process.exit(0);
}

const CONTENT_DIRS = ['webapp/src/pages', 'webapp/src/components', 'webapp/src/data/blog'];
const WATCH_PATHS = ['webapp/src', 'webapp/api', 'webapp/public', 'webapp/index.html'];

// Pathspecs below are repo-root-relative, but this script may run with any
// cwd (e.g. invoked manually from webapp/) — anchor every git call to the
// repo root so "webapp/src" always means the same thing.
const repoRoot = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();

function git(args) {
  return execFileSync('git', args, { encoding: 'utf8', maxBuffer: 1024 * 1024 * 64, cwd: repoRoot });
}

// 1. Deleted files
const nameStatus = git(['diff', '--name-status', baseSha, newSha, '--', ...WATCH_PATHS]);
const deletedFiles = nameStatus
  .split('\n')
  .filter((l) => l.startsWith('D\t'))
  .map((l) => l.slice(2));

// 2. Per-file unified diff, parsed for JSX component tag balance and raw +/- line counts
const diff = git(['diff', '--unified=0', baseSha, newSha, '--', ...WATCH_PATHS]);
const files = diff.split(/^diff --git /m).slice(1);

const componentFlags = []; // { file, component, removed, added }
const largeRemovals = []; // { file, removed, added }

for (const block of files) {
  const pathMatch = block.match(/a\/(\S+) b\/(\S+)/);
  if (!pathMatch) continue;
  const file = pathMatch[2];
  if (!file.endsWith('.jsx') && !file.endsWith('.js')) continue;

  const lines = block.split('\n');
  const removedLines = lines.filter((l) => l.startsWith('-') && !l.startsWith('---'));
  const addedLines = lines.filter((l) => l.startsWith('+') && !l.startsWith('+++'));

  // Net JSX component usage: </?ComponentName — capitalised, so it excludes
  // native DOM tags (div, span, ...).
  const tagRe = /<\/?([A-Z][A-Za-z0-9]*)\b/g;
  const count = (arr) => {
    const tally = {};
    for (const l of arr) {
      let m;
      tagRe.lastIndex = 0;
      while ((m = tagRe.exec(l))) tally[m[1]] = (tally[m[1]] || 0) + 1;
    }
    return tally;
  };
  const removedTags = count(removedLines);
  const addedTags = count(addedLines);
  for (const [name, removed] of Object.entries(removedTags)) {
    const added = addedTags[name] || 0;
    if (removed > added) {
      componentFlags.push({ file, component: name, removed, added });
    }
  }

  const inContentDir = CONTENT_DIRS.some((d) => file.startsWith(d));
  if (inContentDir && removedLines.length >= 15 && addedLines.length <= removedLines.length / 3) {
    largeRemovals.push({ file, removed: removedLines.length, added: addedLines.length });
  }
}

const hasFlags = deletedFiles.length || componentFlags.length || largeRemovals.length;

if (!hasFlags) {
  console.log(`verify-deletions: clean — no file deletions, no net component removals vs ${baseSha.slice(0, 7)} (production).`);
  process.exit(0);
}

console.log(`\nverify-deletions: possible unintended removals vs ${baseSha.slice(0, 7)} (current production)\n`);

if (deletedFiles.length) {
  console.log('Deleted files:');
  for (const f of deletedFiles) console.log(`  - ${f}`);
  console.log('');
}

if (componentFlags.length) {
  console.log('Components with fewer usages than in production:');
  for (const f of componentFlags) {
    console.log(`  - <${f.component}> in ${f.file}: ${f.removed} removed, ${f.added} added (net -${f.removed - f.added})`);
  }
  console.log('');
}

if (largeRemovals.length) {
  console.log('Large one-sided deletions in page/component/blog content:');
  for (const f of largeRemovals) {
    console.log(`  - ${f.file}: -${f.removed} / +${f.added} lines`);
  }
  console.log('');
}

if (process.env.ALLOW_CONTENT_REMOVAL === '1') {
  console.log('ALLOW_CONTENT_REMOVAL=1 set — proceeding despite the above.\n');
  process.exit(0);
}

console.log('If every one of these is intentional, re-run with ALLOW_CONTENT_REMOVAL=1 git push ...');
console.log('If any of these was NOT explicitly requested, stop and fix it before pushing.\n');
process.exit(1);
