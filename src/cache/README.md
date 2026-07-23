# cache

Generic in-memory caching primitives, scoped to the life of one process. No consumer
instantiates a cache yet — tools that need one (vessel metadata, 4Wings report
responses, EEZ region lookups) construct their own typed `Cache` instance when
those tools are implemented.

- `cache.ts` — `Cache<K, V>`, a `Map`-backed cache class with optional per-instance
  TTL (stateful infrastructure, per `docs/claude/conventions.md`). Expiry is lazy
  (checked on `get`/`has`, no background sweeping) so the process can exit cleanly
  under STDIO. Omitting `ttlMs` means entries never expire.
- `normalize-key.ts` — `normalizeKey`, stable-stringifies a params object with object
  keys sorted recursively (array order preserved) so differently-ordered but
  equivalent param sets produce the same cache key.
