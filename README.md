# KYIVPORCELAIN independent AI demo

Ukrainian, responsive knowledge-grounded chat with real generative inference. No fixed FAQ answer lookup. No company affiliation, order access, analytics, chat persistence, credentials or paid services included.

## Preferred client-facing deployment

1. Create a public GitHub repository for this directory. Enable GitHub Pages from `main` at `/` (or upload the six frontend files and `.nojekyll`). GitHub Pages serves static files only.
2. Deploy `backend/index.js` with Wrangler into an authorized **Cloudflare Workers Free** account. It uses the Workers AI binding, not a browser API key. Review current free-tier eligibility and remaining allowance before deploying; do NOT upgrade to paid automatically.
3. Set `ALLOWED_ORIGIN` in `wrangler.jsonc` to the exact GitHub Pages origin. The example is `https://msdoss12.github.io`; no path or trailing slash.
4. Put the deployed HTTPS Worker URL ending `/chat` into `API_ENDPOINT` in `config.js`. This URL is public, not a credential. Commit the change.
5. Verify real responses and failure modes before sharing. Test a free-form question, a follow-up, an unknown price, conflicting delivery terms, and an attempted system-prompt override. Do not claim company-approved answers.

No Cloudflare account, backend, repository or Pages site was provisioned by building these files. Production inference is unverified until connected and tested.

Cloudflare Workers AI has a documented free daily allocation; limits can change and the demo returns an explicit error when unavailable. Per-IP rate limiting reduces casual abuse but is not authentication or a total budget cap. Origin checks are browser protection only, not bot authentication. Keep the account on the free plan, monitor allowance, disable public access after evaluation; add Turnstile or invite-based protection for a long-running deployment. Do not log chat contents. Frontend clearly discloses messages go to Cloudflare in this mode.

## Online only

All AI inference runs on the configured backend. There is no model download, browser GPU requirement, WebLLM runtime or local fallback. If `API_ENDPOINT` is empty or invalid, the interface explicitly says the online service is not connected. If the backend fails, the interface reports the error and restores the question for retry; it never substitutes canned answers. `worker.js` is an unused compatibility tombstone and may be deleted.

## Local checks

`npm run check`
`node backend.test.js`
`python3 -m http.server 8080` then open localhost:8080 in a browser.

Backend tests mock AI; they verify validation and error handling, not model output. No paid inference was performed. Static syntax checks passed. Full graphical, browser and real provider checks still required.

## Knowledge and attribution

The short paraphrased knowledge snapshot in `knowledge.js` uses official public pages checked 16 November 2026:
- https://kyivporcelain.com/ua/questions/
- https://kyivporcelain.com/ua/delivery/
- https://kyivporcelain.com/ua/spivpratsya/

The FAQ and delivery pages conflict on shipping prices, free shipping and pickup. The prompt explicitly withholds promises and directs these to company confirmation. There is no live catalog or inventory integration. Prompt instructions reduce hallucinations but cannot guarantee factuality. Names are used to identify the proposal; no logos, product photos or copied page design are included.

## Technical sources
- https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages
- https://developers.cloudflare.com/workers-ai/configuration/bindings/
- https://developers.cloudflare.com/workers-ai/platform/pricing/
- https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/

DeepSeek's own API is paid: https://api-docs.deepseek.com/quick_start/pricing/. OpenRouter free routes require an account/key and are limited; no such key has been obtained or embedded.
