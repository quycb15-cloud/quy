# Mobile/PWA production diagnostic — 2026-09-17

- Public domain: `https://caosucn386-hcbqtzyq.manus.space/`
- Root response: HTTP/2 200, `text/html; charset=utf-8`, HTTPS/Cloudflare active.
- Manifest response: HTTP/2 200, `application/manifest+json; charset=utf-8`.
- Service worker response: HTTP/2 200, `text/javascript; charset=utf-8`.
- Manifest declares icon URL `/manus-storage/cao-su-cn386-pwa-icon_cf58b142.png` with MIME `image/png` at 192x192 and 512x512.
- Following the production icon URL returns HTTP 307 then HTTP/2 200 with `content-type: image/webp`, despite the `.png` suffix and manifest MIME `image/png`.
- This MIME mismatch is a likely Android PWA install/cache compatibility issue. The website root itself is reachable in browser; the failure may be limited to an old shortcut/PWA cache or icon/manifest validation.
- Current production page renders the internal login screen in sandbox browser.
