/**
 * Nightly rebuild trigger.
 *
 * The two hub pages (/offerte, /aziende-che-assumono) are static files: their job and
 * company links are baked in at build time by scripts/prerender-canonicals.mjs, reading
 * the snapshots that scripts/generate-jobs-snapshot.mjs and generate-companies-snapshot.mjs
 * write. That is what keeps them free at runtime — no lambda, no cold start, no per-visitor
 * cost for a crawler-facing link graph.
 *
 * The price of baking them in is that they go stale: every ad the feed publishes after the
 * last build exists in /api/sitemap-jobs.xml but in no page's HTML, so a crawler discovers
 * it with zero incoming internal links. That is precisely the "orphan page" bucket the site
 * audit reported (135 URLs, +116 in one day), and it grows with every batch of new ads.
 * Rebuilding once a night is what stops that from compounding.
 *
 * Vercel Cron cannot rebuild a deployment on its own — it can only invoke a route. So the
 * cron hits this route and this route pokes a Deploy Hook, which is what actually starts
 * the build. The hook URL is a credential (anyone holding it can deploy), so it lives in
 * an env var and is never echoed back in a response.
 *
 * Runs off-peak by design: the feed walk behind the snapshots takes ~35s for companies and
 * a comparable stretch for jobs, and it should not compete with daytime traffic.
 */

export default async function handler(req, res) {
  // Vercel signs its cron invocations with CRON_SECRET. Without this check the route is an
  // open "deploy this project" button for anyone who finds the path.
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    return res.status(500).json({ error: 'CRON_SECRET non configurato' });
  }
  if (req.headers.authorization !== `Bearer ${expected}`) {
    return res.status(401).json({ error: 'non autorizzato' });
  }

  const hook = process.env.VERCEL_DEPLOY_HOOK_URL;
  if (!hook) {
    return res.status(500).json({ error: 'VERCEL_DEPLOY_HOOK_URL non configurato' });
  }

  try {
    const upstream = await fetch(hook, { method: 'POST' });
    if (!upstream.ok) {
      // The hook's own body can contain the deployment id but not the secret; still, only
      // the status is surfaced — there is no caller who needs more than "it did not start".
      return res.status(502).json({ error: `deploy hook ha risposto ${upstream.status}` });
    }
    return res.status(200).json({ triggered: true });
  } catch (err) {
    return res.status(502).json({ error: `deploy hook irraggiungibile: ${err.message}` });
  }
}
