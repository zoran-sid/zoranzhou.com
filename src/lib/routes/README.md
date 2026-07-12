# Route display geometry

Route statistics and identity always use the original GPX points. Map rendering uses `processRouteForDisplay`, which validates, deduplicates, rejects isolated spikes, smooths only low-angle local jitter, downsamples each segment independently, and preserves segment endpoints.

An optional future map-matching adapter can write a cached GeoJSON file and reference it from route frontmatter as `displayGeometry`. The adapter should run during an explicit import/build workflow, never during a page view. OSRM, Valhalla, or GraphHopper can be used without changing the source GPX, but hiking and off-road tracks should fall back to local processing unless matching confidence is high.
