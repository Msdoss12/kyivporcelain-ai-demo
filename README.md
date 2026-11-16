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

## Keyless local-model fallback

Leave `API_ENDPOINT` empty. The user explicitly starts a WebLLM Qwen2.5 1.5B model in their browser. Model download is approximately 1 GB, GPU memory requirement approximately 2 GB. WebGPU is required; performance and Ukrainian accuracy depend on the device. This is a fallback, not an ideal first client experience. It incurs no AI API charges. It is genuine language-model inference, not canned responses. Model/CDN hosting receives normal network information; chat contents stay in the browser. WebLLM caches model assets; reset clears conversation, not the downloaded cache.

External dependencies: `@mlc-ai/web-llm@0.2.88` via esm.run, model weights from Hugging Face, compiled model libraries from the WebLLM distribution. Local mode requires these providers to be reachable.

## Local checks

`npm run check`
`node backend.test.js`
`python3 -m http.server 8080` then open localhost:8080 in a WebGPU-capable browser.

Backend tests mock AI; they verify validation and error handling, not model output. No paid inference was performed. Static syntax checks passed. Full graphical, browser GPU and real provider checks still required.

## Knowledge and attribution

The short paraphrased knowledge snapshot in `knowledge.js` uses official public pages checked 16 November 2026:
- https://kyivporcelain.com/ua/questions/
- https://kyivporcelain.com/ua/delivery/
- https://kyivporcelain.com/ua/spivpratsya/

The FAQ and delivery pages conflict on shipping prices, free shipping and pickup. The prompt explicitly withholds promises and directs these to company confirmation. There is no live catalog or inventory integration. Prompt instructions reduce hallucinations but cannot guarantee factuality, especially in the smaller local model. Names are used to identify the proposal; no logos, product photos or copied page design are included.

## Technical sources
- https://webllm.mlc.ai/docs/
- https://github.com/mlc-ai/web-llm/blob/main/src/config.ts
- https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages
- https://developers.cloudflare.com/workers-ai/configuration/bindings/
- https://developers.cloudflare.com/workers-ai/platform/pricing/
- https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/

DeepSeek's own API is paid: https://api-docs.deepseek.com/quick_start/pricing/. OpenRouter free routes require an account/key and are limited; no such key has been obtained or embedded.
