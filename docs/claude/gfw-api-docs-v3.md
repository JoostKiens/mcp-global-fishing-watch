# Global Fishing Watch API — Version 3 Documentation

> Extracted and reformatted for internal reference. **This document contains v3 content only** — all v2 (deprecated) sections have been removed.
>
> This was copy-pasted from GFW's own docs site and reformatted by Claude — treat it as a convenience reference, not ground truth. It has already been found to disagree with the live API in places (see the corrected "Supported fields for advanced search" note under Vessels API → Search). Before relying on any specific parameter name, enum value, or example in this file for new tool work, verify against the live API (`GFW_API_TOKEN` in `.env.local`, a throwaway script hitting `https://gateway.api.globalfishingwatch.org` directly) rather than trusting the text alone. See `CLAUDE.md` for how this file fits into the workflow.

---

## Table of Contents

1. [Introduction](#introduction)
2. [Quick Start](#quick-start)
3. [API Workflows](#api-workflows)
4. [API Versioning](#api-versioning)
5. [Map Visualization — 4Wings API](#map-visualization--4wings-api)
6. [Vessels API](#vessels-api)
7. [Events API](#events-api)
8. [Insights API](#insights-api)
9. [Datasets API](#datasets-api)
10. [Bulk Download API](#bulk-download-api)
11. [General API Documentation](#general-api-documentation)
12. [SDKs](#sdks)
13. [License and Rate Limits](#license-and-rate-limits)
14. [API Release Notes (v3)](#api-release-notes-v3)

---

## Introduction

Global Fishing Watch offers modern, low latency, secure and scalable REST APIs. GFW APIs use resource-oriented URLs, support HTTPS authentication and HTTPS verbs, and leverage JSON in all responses.

**GFW APIs are only available for non-commercial purposes.** They are used by researchers, governments and technology companies.

Data is combined from the publicly available Automatic Identification System (AIS) and integrated with information acquired through Vessel Monitoring Systems (VMS) operated by governments, made available through partnerships.

### Data available in API Version 3

- **Map Visualization (4Wings API):** AIS apparent fishing effort, AIS vessel presence (including buffer analysis), and SAR vessel detections (industrial vessels 2017–5 days ago detected via satellite imagery and classified with deep learning).
- **Vessel API:** vessel search and identity, based on AIS self-reported data and identity/authorization data from public regional and national registries, for all vessel types.
- **Events API:** encounters, loitering, port visits and fishing events based on AIS data.
- **Insights API:** vessel insights combining known AIS activity and authorizations, supporting risk-based decision making and IUU (Illegal, Unreported, Unregulated) fishing due diligence.
- **Datasets API:** download fixed infrastructure detections (Sentinel-1/Sentinel-2) in MVT format.
- **Bulk Download API:** efficient access to large volumes of data across multiple datasets over time. Currently includes global offshore infrastructure detections (2017–~3 months ago), Sentinel-1/Sentinel-2, deep-learning classified. Reports in CSV or JSON.

Reference docs:

- [Differences between APIs, gfwr, and Data Download Portal](https://globalfishingwatch.org)
- [APIs used in GFW Vessel Viewer](https://globalfishingwatch.org)

---

## Quick Start

1. [Register for a Global Fishing Watch account](https://globalfishingwatch.org).
2. Create an API Access Token.
3. Agree to the terms of use and attribute Global Fishing Watch in anything you publish.
4. Submit an HTTP request — e.g. search a fishing vessel and get its fishing events.

**Search a fishing vessel (Vessel API):**

```bash
curl --location -g --request GET 'https://gateway.api.globalfishingwatch.org/v3/vessels/search?query=7831410&datasets[0]=public-global-vessel-identity:latest' \
  -H "Authorization: Bearer [TOKEN]"
```

**Get fishing events (Events API), using the vessel id from the previous response:**

```bash
curl --location -g --request GET 'https://gateway.api.globalfishingwatch.org/v3/events?vessels[0]=9b3e9019d-d67f-005a-9593-b66b997559e5&datasets[0]=public-global-fishing-events:latest&start-date=2017-03-01&end-date=2017-03-31&limit=1&offset=0' \
  -H "Authorization: Bearer [TOKEN]"
```

---

## API Workflows

A guide combining multiple GFW APIs into full workflows: searching vessels & retrieving fishing activity, monitoring events in regions, combining datasets, building visualizations with 4Wings, and compliance monitoring.

> View the API Workflows Guide (PDF) — linked from the GFW API portal.

---

## API Versioning

- Only **major** versions are tracked. Current version: **v3**.
- A new major version is created for breaking changes (URL, params, verb, or response).
- Only **2** major versions run at the same time.
- Deprecation notice sent 3 months in advance (email + API warning header/log message with URL).
- Old version stays live for 3 months while the new version runs in parallel.

| Version | Status        | Deprecation Date |
| ------- | ------------- | ---------------- |
| v3      | 🟢 CURRENT    | —                |
| v2      | 🔴 DEPRECATED | April 30, 2024   |
| v1      | 🔴 DEPRECATED | May 31, 2023     |

**Status legend**

- 🔴 DEPRECATED: endpoint non-operational or soon to be removed; no further improvements.
- 🟠 MAINTENANCE: operational, but only fixes (retrocompatible) are applied, not new features.
- 🟢 CURRENT: operational and actively developed.

### What's new in v3

- Expanded Vessel API: identity + authorization data from 40+ public regional/national registries, for all vessel types.
- New **Insights API**: fuses AIS history + authorizations into risk indicators (incl. AIS-off / GAP events).
- Improved 4Wings Report API: region-specific analysis, more encounter types.
- Updated documentation, Migration Guide, and code samples.

### GFW Postman Collection (v3)

Download the [v3 Postman collection](https://globalfishingwatch.org). Remember to:

- Add your API Access Token.
- Set `base_url` = `https://gateway.api.globalfishingwatch.org/`

---

## Map Visualization — 4Wings API

### 4Wings Introduction

4Wings (aka Map Visualization) provides fast visualization, navigation, and analysis for gridded spatiotemporal datasets. Three core datasets:

- **AIS Apparent Fishing Effort** — apparent fishing activity from AIS.
- **SAR Vessel Detections** — industrial vessels detected via satellite radar.
- **AIS Vessel Presence** — any vessel type presence (not a vessel track).

### What you can do

- Visualize maritime data in PNG or MVT format for interactive maps.
- Generate reports and download in CSV, JSON, or TIFF.
- Filter by time period, vessel characteristics, and geographic region.
- Create custom map styles with dynamic color ramps.
- Analyze vessel interactions at the cell level.
- Access statistical summaries for trend analysis.

### Choosing your dataset

| Use Case                        | Recommended Dataset         | Why                                  |
| ------------------------------- | --------------------------- | ------------------------------------ |
| Fisheries compliance monitoring | AIS Apparent Fishing Effort | Specialized fishing algorithms       |
| Dark vessel detection           | SAR Vessel Detections       | Radar sees vessels without AIS       |
| Port traffic analysis           | AIS Vessel Presence         | Comprehensive vessel movement        |
| Remote area surveillance        | SAR Vessel Detections       | Coverage without AIS reception       |
| Fleet management                | AIS Vessel Presence         | Track a group of vessels of any type |
| Supply chain visibility         | AIS Vessel Presence         | Track cargo/carrier movements        |

### Supported datasets

| Feature          | AIS Apparent Fishing Effort           | SAR Vessel Detections               | AIS Vessel Presence             |
| ---------------- | ------------------------------------- | ----------------------------------- | ------------------------------- |
| Dataset ID       | `public-global-fishing-effort:latest` | `public-global-sar-presence:latest` | `public-global-presence:latest` |
| Data Source      | GFW model applied to AIS positions    | Sentinel-1 (ESA) SAR imagery        | AIS transponder data            |
| Primary Focus    | Apparent fishing activity             | Vessel detection via SAR            | General vessel presence         |
| Coverage         | Global fishing vessels w/ AIS         | Satellite coverage areas            | Global AIS-equipped vessels     |
| Data Available   | 2012 – 96 hours ago                   | 2017 – 5 days ago                   | 2012 – 96 hours ago             |
| Update Frequency | Near real-time                        | Satellite pass dependent            | Near real-time                  |
| Unit             | Hours (fishing effort)                | Detections                          | Hours (presence)                |

#### AIS Apparent Fishing Effort

`public-global-fishing-effort:latest` — Derived from AIS via GFW's ML fishing-detection algorithms.

Filters (`filters[0]`):

- `flag` — e.g. `flag in ('ESP', 'USA')`
- `geartype` — e.g. `geartype in ('tuna_purse_seines', 'driftnets')`
- `vessel_id`
- `distance_from_port_km` — enum `0–5` km; only applies to fishing effort. GFW Map default is 3 km to reduce near-port overestimation.

#### SAR Vessel Detections

`public-global-sar-presence:latest` — Industrial vessels detected via SAR (Sentinel-1), classified by deep learning.

Filters:

- `matched` — e.g. `matched='true'`/`'false'`
- `flag` (when matched to AIS)
- `vessel_id` (when matched)
- `geartype` (when matched)
- `neural_vessel_type` — `<=0.1` "Likely non-fishing"; `>=0.9` "Likely fishing"; `0.1–0.9` "Other/Unknown"
- `shiptype` (when matched)

#### AIS Vessel Presence

`public-global-presence:latest` — One AIS position per hour per vessel; all vessel types.

Filters:

- `flag`
- `vessel_type` — e.g. `vessel_type = 'cargo'`
- `speed` — categories: `<2`, `2-4`, `4-6`, `6-10`, `10-15`, `15-25`, `>25` (knots)

### Available 4Wings API Endpoints

- Create a report of a specified region
- Get the last report generated
- Create a style for PNG tiles
- Get raster by tile coordinates
- Generate data bins
- Interaction API (per-cell detail)
- Statistics on fishing activity worldwide

### Create a report of a specified region

**HTTP Request** (either verb):

```
POST https://gateway.api.globalfishingwatch.org/v3/4wings/report
GET  https://gateway.api.globalfishingwatch.org/v3/4wings/report
```

- **POST** — required for custom polygon (`geojson`).
- **GET** — supports caching (browser + gateway-level), good for repeated identical requests.
- Only supports `geojson` OR `region` in the same request, not both.
- Report data is aggregated using the **sum** function.
- Only **one report per user** at a time (else `429`).
- May throw `524` (gateway timeout) if report takes >100s — recover via `last-report`.

**429 error example:**

```json
{
  "statusCode": 429,
  "error": "Too Many Requests",
  "messages": [
    {
      "title": "Too Many Requests",
      "detail": "Your application token is not currently enabled to perform more than one concurrent report. If you need to generate more than one report concurrently, contact us at apis@globalfishingwatch.org",
      "metadata": {
        "currentReportBody": {
          "geojson": null,
          "region": { "dataset": "public-mpa-all", "id": "555635930" }
        },
        "currentReportUrl": "/v3/4wings/report?format=csv&datasets%5B0%5D=public-global-fishing-effort%3Av20201001&date-range=2023-05-01T00%3A00%3A00.000Z%2C2023-06-01T00%3A00%3A00.000Z&spatial-aggregation=true&temporal-resolution=entire&group-by=vessel_id"
      }
    }
  ]
}
```

**URL Parameters (POST & GET)**

| Parameter             | Description                                                                                         | Required | Format                                                           | Type  |
| --------------------- | --------------------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------- | ----- |
| `spatial-resolution`  | `LOW` = 10th degree, `HIGH` = 100th degree. Required only if `spatial-aggregation` is false/absent. | False    | Enum: `LOW`, `HIGH`                                              | query |
| `format`              | Result format (zip with caveat info + data file)                                                    | True     | Enum: `CSV`, `TIF`, `JSON`                                       | query |
| `group-by`            | Grouping criterion; required when `spatial-aggregation=true`                                        | False    | Enum: `VESSEL_ID`, `FLAG`, `GEARTYPE`, `FLAGANDGEARTYPE`, `MMSI` | query |
| `temporal-resolution` | Time granularity                                                                                    | True     | Enum: `HOURLY`, `DAILY`, `MONTHLY`, `YEARLY`, `ENTIRE`           | query |
| `datasets[0]`         | Dataset(s) to use                                                                                   | True     | string                                                           | query |
| `filters[0]`          | Filter applied to `datasets[0]` (see per-dataset filters above)                                     | False    | string                                                           | query |
| `date-range`          | Start/end date, max 366 days, e.g. `2021-01-01,2021-03-01`                                          | False    | string                                                           | query |
| `spatial-aggregation` | Aggregate spatially (true → only csv/json)                                                          | False    | boolean                                                          | query |

**GET-only parameters**

| Parameter          | Description                                                                | Required |
| ------------------ | -------------------------------------------------------------------------- | -------- |
| `region-dataset`   | Region dataset id (e.g. `public-eez-areas`)                                | False    |
| `region-id`        | Region id (e.g. `5690`)                                                    | False    |
| `buffer-operation` | `DIFFERENCE` or `DISSOLVE` (default: dissolve); requires buffer-value/unit | False    |
| `buffer-unit`      | `MILES`, `NAUTICALMILES`, `KILOMETERS`, `RADIANS`, `DEGREES`               | False    |
| `buffer-value`     | Buffer distance (negative allowed)                                         | False    |

**POST-only body**

| Key                      | Description                                              | Required | Format |
| ------------------------ | -------------------------------------------------------- | -------- | ------ |
| `geojson`                | GeoJSON geometry filter                                  | False    | object |
| `region`                 | Region info (see Reference Data)                         | False    | object |
| `region.dataset`         | Region dataset id                                        | False    | string |
| `region.id`              | Region id                                                | False    | string |
| `region.bufferOperation` | `DIFFERENCE`/`DISSOLVE`                                  | False    | string |
| `region.bufferUnit`      | `MILES`/`NAUTICALMILES`/`KILOMETERS`/`RADIANS`/`DEGREES` | False    | string |
| `region.bufferValue`     | Buffer distance                                          | False    | string |

**Example — POST, fishing effort by year, custom polygon, JSON:**

```bash
curl --location --globoff 'https://gateway.api.globalfishingwatch.org/v3/4wings/report?spatial-resolution=LOW&temporal-resolution=YEARLY&group-by=FLAG&datasets[0]=public-global-fishing-effort%3Alatest&date-range=2021-01-01%2C2022-01-01&format=JSON' \
  -H "Authorization: Bearer [TOKEN]" \
  -H 'Content-Type: application/json' \
  --data-raw '{"geojson":{"type":"Polygon","coordinates":[[[-76.11,-26.27],[-76.20,-26.98],[...]]]}}'
```

Response:

```json
{
  "total": 1,
  "limit": null,
  "offset": null,
  "nextOffset": null,
  "metadata": {},
  "entries": [
    {
      "public-global-fishing-effort:v3": [
        {
          "date": "2021",
          "flag": "ESP",
          "hours": 0.4283333333333333,
          "lat": -27.3,
          "lon": -82,
          "vesselIDs": 1
        },
        {
          "date": "2021",
          "flag": "ESP",
          "hours": 0.9591666666666667,
          "lat": -24.7,
          "lon": -78.6,
          "vesselIDs": 2
        }
      ]
    }
  ]
}
```

**Example — POST, fishing effort by gear type, existing region (Russian EEZ), CSV:**

```bash
curl --location -g --request POST 'https://gateway.api.globalfishingwatch.org/v3/4wings/report?spatial-resolution=LOW&temporal-resolution=MONTHLY&group-by=GEARTYPE&datasets[0]=public-global-fishing-effort:latest&date-range=2022-01-01,2022-05-01&format=CSV' \
  --header 'Authorization: Bearer [TOKEN]' --header 'Content-Type: application/json' \
  --output 'report-grouped.json' \
  --data-raw '{ "region": { "dataset": "public-eez-areas", "id": 5690 } }'
```

Response: ZIP with CSV + PDF of data considerations.

**Example — GET equivalent of the above:**

```bash
curl --location -g --request GET 'https://gateway.api.globalfishingwatch.org/v3/4wings/report?spatial-resolution=LOW&temporal-resolution=MONTHLY&group-by=GEARTYPE&datasets[0]=public-global-fishing-effort:latest&date-range=2022-01-01,2022-05-01&format=CSV&region-id=5690&region-dataset=public-eez-areas' \
  --header 'Authorization: Bearer [TOKEN]'
```

**Example — Total fishing hours per grid cell, no grouping, existing region (MPA Dorsal De Nasca), JSON:**

```bash
curl --location -g --request POST 'https://gateway.api.globalfishingwatch.org/v3/4wings/report?spatial-resolution=LOW&temporal-resolution=ENTIRE&spatial-aggregation=false&datasets[0]=public-global-fishing-effort:latest&date-range=2022-05-01,2022-12-01&format=JSON' \
  --header 'Authorization: Bearer [TOKEN]' --header 'Content-Type: application/json' \
  --data-raw '{ "region": { "dataset": "public-mpa-all", "id": 555745302 } }'
```

Response:

```json
{
  "total": 1,
  "limit": null,
  "offset": null,
  "nextOffset": null,
  "metadata": {},
  "entries": [
    {
      "public-global-fishing-effort:v3.0": [
        {
          "date": "2022-05-01,2022-12-01",
          "hours": 0.5788888888888889,
          "lat": -16,
          "lon": -77
        },
        {
          "date": "2022-05-01,2022-12-01",
          "hours": 1.2480555555555557,
          "lat": -15.3,
          "lon": -77.8
        }
      ]
    }
  ]
}
```

**Example — same as above, plus a 4-nautical-mile buffer:**

```bash
curl --location -g --request POST 'https://gateway.api.globalfishingwatch.org/v3/4wings/report?spatial-resolution=LOW&temporal-resolution=ENTIRE&spatial-aggregation=false&datasets[0]=public-global-fishing-effort:latest&date-range=2022-05-01,2022-12-01&format=JSON' \
  --header 'Authorization: Bearer [TOKEN]' --header 'Content-Type: application/json' \
  --data-raw '{ "region": { "dataset": "public-mpa-all", "id": 555745302, "bufferUnit": "NAUTICALMILES", "bufferValue": 4 } }'
```

**Example — SAR: region (Chile) daily gridded, filter unmatched detections, JSON:**

```bash
curl --location --globoff 'https://gateway.api.globalfishingwatch.org//v3/4wings/report?spatial-resolution=HIGH&temporal-resolution=HOURLY&datasets[0]=public-global-sar-presence%3Alatest&date-range=2022-01-01%2C2022-01-06&format=JSON&filters[0]=matched%3D%27false%27' \
  --header 'Authorization: Bearer [TOKEN]' --header 'Content-Type: application/json' \
  --data '{ "region": { "dataset": "public-eez-areas", "id": 8465 } }'
```

**Example — AIS Vessel Presence, by region, grouped by vessel type, JSON:**

```bash
curl --location --request POST 'https://gateway.api.globalfishingwatch.org/v3/4wings/report?spatial-resolution=LOW&temporal-resolution=DAILY&group-by=VESSEL_TYPE&datasets[0]=public-global-presence:latest&date-range=2022-01-01,2022-05-01&format=JSON' \
  --header 'Authorization: Bearer [TOKEN]' --header 'Content-Type: application/json' \
  --data-raw '{ "region": { "dataset": "public-eez-areas", "id": 5690 } }'
```

#### 4Wings Report response fields

| Field                                          | Type              | Dataset         | Description                                                        |
| ---------------------------------------------- | ----------------- | --------------- | ------------------------------------------------------------------ |
| `date`                                         | string            | All             | Date/date range; format depends on `temporal-resolution`           |
| `hours`                                        | number            | Fishing Effort  | Apparent fishing hours in the cell over the range                  |
| `hours`                                        | number            | Vessel Presence | Presence hours in the cell over the range                          |
| `detections`                                   | number            | SAR             | Detections in the cell over the range                              |
| `lat`/`lon`                                    | number            | All             | Center of grid cell (10th or 100th degree, per spatial resolution) |
| `vessel_id`                                    | string            | All             | Unique GFW vessel identity                                         |
| `vesselIDs`                                    | number            | All             | Count of distinct vessel ids in aggregate                          |
| `entryTimestamp`/`exitTimestamp`               | string (ISO 8601) | All             | Region entry/exit time                                             |
| `mmsi`                                         | string            | All             | AIS MMSI                                                           |
| `flag`                                         | string            | All             | Flag state (ISO3), from MMSI MID                                   |
| `shipName`                                     | string            | All             | AIS reported name                                                  |
| `geartype`                                     | string            | All             | GFW-estimated gear type                                            |
| `vessel_type`                                  | string            | All             | GFW vessel type                                                    |
| `imo`                                          | string            | All             | AIS reported IMO                                                   |
| `callsign`                                     | string            | All             | AIS reported call sign (IRCS)                                      |
| `firstTransmissionDate`/`lastTransmissionDate` | string            | All             | First/last AIS transmission                                        |
| `dataset`                                      | string            | All             | Matched dataset version                                            |

### Get last report generated

```
GET https://gateway.api.globalfishingwatch.org/v3/4wings/last-report
```

Retrieves the last requested report without regenerating it. Saved for **30 minutes** after generation.

**Possible responses:**

1. **Running:**

```json
{
  "uri": "/v3/4wings/report?format=JSON&...",
  "status": "running",
  "lastUpdate": "2024-02-05T13:34:06+0000"
}
```

2. **Finished correctly:** same shape as the original report response.
3. **Finished with error:**

```json
{
  "message": {
    "statusCode": 422,
    "error": "Unprocessable Entity",
    "messages": [
      { "title": "region-id", "detail": "region-id query param is required" }
    ]
  },
  "status": 422
}
```

4. **Not found** → `404` (only saved 30 min post-completion).

### Create a style for PNG tiles

A "Style" defines PNG map appearance: what to draw, draw order, styling.

```
POST https://gateway.api.globalfishingwatch.org/v3/4wings/generate-png
```

**URL Parameters**

| Parameter     | Description                                               | Required | Format | Type  |
| ------------- | --------------------------------------------------------- | -------- | ------ | ----- |
| `color`       | Hex color for ramp (default `#002457`)                    | False    | string | query |
| `interval`    | Time resolution: `DAY` (default), `HOUR`, `MONTH`, `YEAR` | False    | Enum   | query |
| `datasets[0]` | Dataset(s)                                                | True     | string | query |
| `filters[0]`  | Filter for `datasets[0]`                                  | False    | string | query |
| `date-range`  | Date filter                                               | False    | string | query |

**Example — AIS Apparent Fishing Effort, temporal filter:**

```bash
curl --location --request POST 'https://gateway.api.globalfishingwatch.org/v3/4wings/generate-png?interval=DAY&datasets%5B0%5D=public-global-fishing-effort:latest&color=%23361c0c&date-range=2020-01-01,2020-01-31' \
  -H "Authorization: Bearer [TOKEN]"
```

Response:

```json
{
  "colorRamp": { "stepsByZoom": { "0": [ { "color": "rgba(54,28,12,102)", "value": 9170 }, ... ] } },
  "url": "https://gateway.api.globalfishingwatch.org/v3/4wings/tile/heatmap/{z}/{x}/{y}?format=PNG&interval=DAY&datasets[0]=public-global-fishing-effort:latest&date-range=2020-01-01,2020-01-31&style=..."
}
```

**Example — Fishing effort, gear type + temporal filter:**

```bash
curl --location --request POST 'https://gateway.api.globalfishingwatch.org/v3/4wings/generate-png?interval=DAY&datasets[0]=public-global-fishing-effort:latest&filters[0]=geartype in ("tuna_purse_seines","driftnets")&date-range=2020-01-01,2020-01-31' \
  -H "Authorization: Bearer [TOKEN]"
```

**Example — SAR, temporal filter, DAY resolution:**

```bash
curl --location --globoff --request POST 'https://gateway.api.globalfishingwatch.org/v3/4wings/generate-png?interval=DAY&color=%23361c0c&date-range=2020-01-01%2C2020-01-31&datasets[0]=public-global-sar-presence%3Alatest' \
  -H "Authorization: Bearer [TOKEN]"
```

**Example — SAR, unmatched detections only:**

```bash
curl --location --globoff --request POST 'https://gateway.api.globalfishingwatch.org//v3/4wings/generate-png?interval=DAY&filters[0]=matched%3D%27false%27&color=%23361c0c&date-range=2020-01-01%2C2020-01-31&datasets[0]=public-global-sar-presence%3Alatest' \
  -H "Authorization: Bearer [TOKEN]"
```

**Example — AIS Vessel Presence, temporal filter:**

```bash
curl --location --request POST 'https://gateway.api.globalfishingwatch.org/v3/4wings/generate-png?interval=DAY&datasets[0]=public-global-presence:latest&color=%230066cc&date-range=2020-01-01,2020-01-31' \
  -H "Authorization: Bearer [TOKEN]"
```

**Example — AIS Vessel Presence, filter by vessel type (cargo/carrier):**

```bash
curl --location --request POST 'https://gateway.api.globalfishingwatch.org/v3/4wings/generate-png?interval=DAY&datasets[0]=public-global-presence:latest&filters[0]=vessel_type in ("cargo","carrier")&date-range=2020-01-01,2020-01-31' \
  -H "Authorization: Bearer [TOKEN]"
```

### Get raster by tile coordinates

```
GET https://gateway.api.globalfishingwatch.org/v3/4wings/tile/heatmap/{z}/{x}/{y}
```

**URL Parameters**

| Parameter              | Description                   | Required | Format  | Type  |
| ---------------------- | ----------------------------- | -------- | ------- | ----- |
| `z`                    | Zoom level (0–12)             | True     | number  | path  |
| `x`                    | X index of tile               | True     | number  | path  |
| `y`                    | Y index of tile               | True     | number  | path  |
| `temporal-aggregation` | Aggregate temporally          | False    | boolean | query |
| `interval`             | `DAY`/`HOUR`/`MONTH`/`YEAR`   | False    | Enum    | query |
| `datasets[0]`          | Dataset(s)                    | True     | string  | query |
| `filters[0]`           | Filter for `datasets[0]`      | False    | string  | query |
| `date-range`           | Date filter                   | False    | string  | query |
| `format`               | `MVT` or `PNG`                | False    | Enum    | query |
| `style`                | Style id from `/generate-png` | False    | string  | query |

Examples: PNG/MVT for AIS Apparent Fishing Effort, SAR Vessel Detections, and AIS Vessel Presence heatmaps — same URL pattern, differing only by `datasets[0]` value and optional `style`.

```bash
# PNG example
curl --location --request GET 'https://gateway.api.globalfishingwatch.org/v3/4wings/tile/heatmap/2/3/1?format=PNG&interval=DAY&datasets[0]=public-global-fishing-effort:latest&date-range=2020-01-01,2020-01-31&style=[STYLE]' \
  -H "Authorization: Bearer [TOKEN]" -o "tile-by-coordinates.PNG"

# MVT example
curl --location --globoff 'https://gateway.api.globalfishingwatch.org//v3/4wings/tile/heatmap/0/0/0?date-range=2023-05-01%2C2023-10-20&datasets[0]=public-global-fishing-effort%3Alatest&format=MVT&interval=HOUR&temporal-aggregation=true' \
  -H "Authorization: Bearer [TOKEN]"
```

### Generate bins (color ramp inputs)

```
GET https://gateway.api.globalfishingwatch.org/v3/4wings/bins/{z}
```

**URL Parameters**

| Parameter              | Description                 | Required | Format  | Type  |
| ---------------------- | --------------------------- | -------- | ------- | ----- |
| `z`                    | Zoom level (0–12)           | True     | number  | path  |
| `temporal-aggregation` | Aggregate temporally        | False    | boolean | query |
| `num-bins`             | Number of bins              | False    | number  | query |
| `interval`             | `DAY`/`HOUR`/`MONTH`/`YEAR` | False    | Enum    | query |
| `datasets[0]`          | Dataset(s)                  | True     | string  | query |
| `filters[0]`           | Filter                      | False    | string  | query |
| `date-range`           | Date filter                 | False    | string  | query |

```bash
curl --location --globoff 'https://gateway.api.globalfishingwatch.org//v3/4wings/bins/1?datasets[0]=public-global-fishing-effort%3Alatest&temporal-aggregation=false&num-bins=9&interval=DAY' \
  -H "Authorization: Bearer [TOKEN]"
```

Response:

```json
{
  "total": 1,
  "limit": null,
  "offset": null,
  "nextOffset": null,
  "metadata": {},
  "entries": [[0, 9.61, 46.89, 135.94, 257.07, 568.65, 913.13, 1173.3, 1554.93]]
}
```

### Interaction API (per-cell detail)

```
GET https://gateway.api.globalfishingwatch.org/v3/4wings/interaction/{z}/{x}/{y}/{cells}
```

**URL Parameters**

| Parameter     | Description                                  | Required | Format | Type  |
| ------------- | -------------------------------------------- | -------- | ------ | ----- |
| `z`/`x`/`y`   | Tile coordinates                             | True     | number | path  |
| `cells`       | Comma-separated cell indexes, e.g. `107,1,2` | True     | string | path  |
| `limit`       | Max results                                  | False    | number | query |
| `datasets[0]` | Dataset(s)                                   | True     | string | query |
| `filters[0]`  | Filter                                       | False    | string | query |
| `date-range`  | Date filter                                  | False    | string | query |

```bash
curl --location -g --request GET 'https://gateway.api.globalfishingwatch.org/v3/4wings/interaction/1/0/0/107?date-range=2021-01-01,2021-12-31&datasets[0]=public-global-fishing-effort:latest' \
  -H "Authorization: Bearer [TOKEN]"
```

Response gives per-vessel `hours` + `id` (fishing effort) — use the `id` with the Vessel API for details. SAR and Presence variants return `detections`/`vessel_id`, or `hours` + vessel metadata, respectively.

### Statistics on fishing activity worldwide

> Not available for SAR vessel detections or AIS vessel presence.

```
GET /v3/4wings/stats
```

**Parameters**

| Name               | Type   | Required | Description                                                    |
| ------------------ | ------ | -------- | -------------------------------------------------------------- |
| `fields`           | string | false    | Comma-separated: `FLAGS`, `VESSEL-IDS`, `ACTIVITY-HOURS`       |
| `vessel-groups[0]` | string | false    | Vessel group ids to filter (comma-separated)                   |
| `datasets[0]`      | string | true     | Only `public-global-fishing-effort:latest` currently supported |
| `filters[0]`       | string | false    | Filter for `datasets[0]`                                       |
| `date-range`       | string | false    | Date filter                                                    |

Response schema:

```json
[
  {
    "activityHours": 0,
    "flags": 0,
    "maxLat": 0,
    "maxLon": 0,
    "minLat": 0,
    "minLon": 0,
    "vesselIds": 0
  }
]
```

**Status codes:** `200` OK · `401` Unauthorized · `403` Forbidden · `422` Unprocessable Entity · `429` Too Many Requests · `503` Service Unavailable

```bash
# No filter
curl --location -g --request GET 'https://gateway.api.globalfishingwatch.org/v3/4wings/stats/?datasets[0]=public-global-fishing-effort:latest&fields=FLAGS,VESSEL-IDS,ACTIVITY-HOURS&date-range=2022-10-22,2023-01-22' \
  -H 'Authorization: Bearer {access-token}'

# With gear type filter
curl --location -g --request GET 'https://gateway.api.globalfishingwatch.org/v3/4wings/stats/?datasets[0]=public-global-fishing-effort:latest&fields=FLAGS,VESSEL-IDS,ACTIVITY-HOURS&date-range=2022-10-22,2023-01-22&filters[0]=geartype in ("tuna_purse_seines","driftnets")' \
  -H 'Authorization: Bearer {access-token}'
```

**4Wings Stats response fields**

| Name                                | Type   | Description                                       |
| ----------------------------------- | ------ | ------------------------------------------------- |
| `activityHours`                     | number | Total activity hours (fishing effort)             |
| `flags`                             | number | Distinct flags                                    |
| `maxLat`/`maxLon`/`minLat`/`minLon` | number | Bounding coords (only with `vessel-group` filter) |
| `vesselIds`                         | number | Distinct vessel ids                               |

---

## Vessels API

### Introduction

Combines GFW core AIS identity data with GFW's registry database (40+ public registries) for an improved understanding of vessel identity over time. A static snapshot was used in [Park et al. 2023, _Tracking elusive and shifting identities of the global fishing fleet_].

You can:

- Search AIS + international/regional/national vessel registries.
- Get identity details from AIS self-reported data or registries.

### Search

```
GET https://gateway.api.globalfishingwatch.org/v3/vessels/search
```

**URL Parameters**

| Parameter      | Description                                                                               | Required | Format  | Type  |
| -------------- | ----------------------------------------------------------------------------------------- | -------- | ------- | ----- |
| `since`        | Pagination token                                                                          | False    | string  | query |
| `limit`        | Max results (≤50, default 30)                                                             | False    | number  | query |
| `datasets`     | Dataset(s) to search, e.g. `datasets[0]=['public-global-fishing-vessels:latest', ...]`    | True     | array   | query |
| `query`        | Free-form search (MMSI, IMO, callsign, shipname, min 3 chars). Incompatible with `where`. | False    | string  | query |
| `where`        | Advanced query combining `AND`/`OR`/`=`/`>=`/`<`. Incompatible with `query`.              | False    | string  | query |
| `match-fields` | `SEVERAL_FIELDS`, `NO_MATCH`, `ALL`. Only with `query`.                                   | False    | array   | query |
| `includes`     | `OWNERSHIP`, `AUTHORIZATIONS`, `MATCH_CRITERIA`                                           | False    | array   | query |
| `binary`       | Protobuf response for perf                                                                | False    | boolean | query |

**Basic search example (MMSI):**

```bash
curl --location --request GET 'https://gateway.api.globalfishingwatch.org/v3/vessels/search?query=368045130&datasets[0]=public-global-vessel-identity:latest&includes[0]=MATCH_CRITERIA&includes[1]=OWNERSHIP&includes[2]=AUTHORIZATIONS' \
  -H "Authorization: Bearer [TOKEN]"
```

Response includes: `dataset`, `registryInfo[]`, `registryOwners[]`, `registryAuthorizations[]`, `combinedSourcesInfo[]` (vesselId + geartypes/shiptypes with source & year range), `selfReportedInfo[]` (per-identity id, ssvid, shipname, dates, matchFields), `matchCriteria[]`, and `metadata` (query/normalizedQuery/didYouMean).

**Advanced search example (`where`, combining MMSI + shipname):**

```bash
curl --location --request GET "https://gateway.api.globalfishingwatch.org/v3/vessels/search?where=ssvid=\"775998121\" AND shipname=\"DON TITO\"&datasets[0]=public-global-vessel-identity:latest&includes[0]=MATCH_CRITERIA&includes[1]=OWNERSHIP" \
  -H "Authorization: Bearer [TOKEN]"
```

> **Correction (verified live, 2026-07-23):** the field list below was wrong in the original copy-paste — it listed `mmsi`, which the live API rejects (`422`), and omitted most of the real field set. The list below is the actual accepted-fields list, taken verbatim from the API's own `422` validation error when an invalid field is used. Both single quotes (`'...'`) and double quotes (`"..."`) work for string literals — verified live with `ssvid='725000410'` and `ssvid="725000410"`, both `200`.

Supported fields for advanced search (`where=`): `id`, `registryLastUpdateDate`, `shipname`, `nShipname`, `ssvid`, `callsign`, `imo`, `flag`, `geartypes`, `transmissionDateFrom`, `transmissionDateTo`, `combinedSourcesInfo.shiptypes.name`, `combinedSourcesInfo.geartypes.name`, `selfReportedInfo.id`, `selfReportedInfo.shipname`, `selfReportedInfo.nShipname`, `selfReportedInfo.ssvid`, `selfReportedInfo.callsign`, `selfReportedInfo.imo`, `selfReportedInfo.flag`, `selfReportedInfo.transmissionDateFrom`, `selfReportedInfo.transmissionDateTo`, `registryInfo.shipname`, `registryInfo.nShipname`, `registryInfo.ssvid`, `registryInfo.callsign`, `registryInfo.imo`, `registryInfo.flag`, `registryInfo.geartypes`, `registryInfo.recordId`, `registryInfo.transmissionDateFrom`, `registryInfo.transmissionDateTo`, `registryOwners.name`, `registryTmtExtraFields.masterEntityId`.

Note `mmsi` is not a field — use `ssvid` (matches the doc's own example above, which was correct).

`combinedSourcesInfo.geartypes.name` enum (verified live via `GET /v3/datasets/public-global-vessel-identity:latest`, `filters.vessels[].id === "combinedSourcesInfo.geartypes.name"` — distinct from and NOT case-compatible with the `4wings/report` geartype filter's enum documented above): `BUNKER`, `CARGO`, `CARGO_OR_TANKER`, `CARRIER`, `DREDGE_FISHING`, `DRIFTING_LONGLINES`, `FISHING`, `FIXED_GEAR`, `GEAR`, `INCONCLUSIVE`, `NON_FISHING`, `OTHER`, `OTHER_PURSE_SEINES`, `OTHER_SEINES`, `PASSENGER`, `PATROL_VESSEL`, `POLE_AND_LINE`, `POTS_AND_TRAPS`, `PURSE_SEINES`, `PURSE_SEINE_SUPPORT`, `SEINERS`, `SEISMIC_VESSEL`, `SET_GILLNETS`, `SET_LONGLINES`, `SPECIALIZED_REEFER`, `SQUID_JIGGER`, `TRAWLERS`, `TROLLERS`, `TUG`, `TUNA_PURSE_SEINES`.

`combinedSourcesInfo.shiptypes.name` enum (same source): `OTHER`, `DISCREPANCY`, `BUNKER`, `CARGO`, `FISHING`, `SUPPORT`, `SEISMIC_VESSEL`, `PASSENGER`, `CARRIER`, `GEAR`.

### Get list of vessels filtered by ids

```
GET https://gateway.api.globalfishingwatch.org/v3/vessels
```

**URL Parameters**

| Parameter              | Description                                       | Required | Format  | Type  |
| ---------------------- | ------------------------------------------------- | -------- | ------- | ----- |
| `datasets`             | Dataset(s) to search                              | True     | array   | query |
| `registries-info-data` | `NONE` (default), `DELTA`, `ALL`                  | False    | Enum    | query |
| `includes`             | e.g. `[['POTENTIAL_RELATED_SELF_REPORTED_INFO']]` | False    | array   | query |
| `binary`               | Protobuf response                                 | False    | boolean | query |
| `match-fields`         | `SEVERAL_FIELDS`/`NO_MATCH`/`ALL`                 | False    | array   | query |
| `ids`                  | List of vessel ids (from search)                  | True     | array   | query |
| `vessel-groups`        | Vessel-group ids                                  | False    | array   | query |

```bash
curl --location --request GET 'https://gateway.api.globalfishingwatch.org/v3/vessels?datasets[0]=public-global-vessel-identity:latest&ids[0]=8c7304226-6c71-edbe-0b63-c246734b3c01&ids[1]=6583c51e3-3626-5638-866a-f47c3bc7ef7c&ids[2]=71e7da672-2451-17da-b239-857831602eca' \
  -H "Authorization: Bearer [TOKEN]"
```

Response includes `metadata.idsFound` / `idsNotFound`, plus full `entries[]`.

### Get vessel by id

```
GET https://gateway.api.globalfishingwatch.org/v3/vessels/{vesselId}
```

**URL Parameters**

| Parameter              | Description                                       | Required | Format  | Type  |
| ---------------------- | ------------------------------------------------- | -------- | ------- | ----- |
| `vesselId`             | —                                                 | True     | string  | path  |
| `registries-info-data` | `NONE`/`DELTA`/`ALL`                              | False    | Enum    | query |
| `includes`             | e.g. `[['POTENTIAL_RELATED_SELF_REPORTED_INFO']]` | False    | array   | query |
| `binary`               | Protobuf response                                 | False    | boolean | query |
| `match-fields`         | `SEVERAL_FIELDS`/`NO_MATCH`/`ALL`                 | False    | array   | query |
| `dataset`              | Dataset                                           | True     | string  | query |

```bash
curl --location --request GET 'https://gateway.api.globalfishingwatch.org/v3/vessels/c54923e64-46f3-9338-9dcb-ff09724077a3?dataset=public-global-vessel-identity:latest' \
  -H "Authorization: Bearer [TOKEN]"
```

---

## Events API

### Introduction

Explore vessel activity:

- Apparent fishing events
- Encounters (fishing-carrier, fishing-support, fishing-bunker, fishing-fishing, tanker-fishing, carrier-bunker, support-bunker)
- Loitering (all vessel types)
- Port visits (all vessel types)
- AIS off (aka GAPs; all vessel types)

**Dataset selection by event type:**

| Event type    | Dataset                                   |
| ------------- | ----------------------------------------- |
| Fishing       | `public-global-fishing-events:latest`     |
| Encounters    | `public-global-encounters-events:latest`  |
| Loitering     | `public-global-loitering-events:latest`   |
| Port visits   | `public-global-port-visits-events:latest` |
| AIS off (GAP) | `public-global-gaps-events:latest`        |

### Get All Events (GET)

> Recommended for web apps — supports browser caching.

```
GET https://gateway.api.globalfishingwatch.org/v3/events
```

**URL Parameters**

| Parameter         | Description                                                                                                                     | Required | Format  | Type  |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------- | -------- | ------- | ----- |
| `limit`           | Max results                                                                                                                     | True     | number  | query |
| `offset`          | Pagination offset                                                                                                               | True     | number  | query |
| `sort`            | e.g. `-start`; enum `+start`,`-start`,`+end`,`-end`                                                                             | False    | string  | query |
| `datasets`        | Dataset(s), array                                                                                                               | True     | string  | query |
| `vessels`         | Vessel id list, array                                                                                                           | False    | string  | query |
| `types`           | `ENCOUNTER`,`FISHING`,`LOITERING`,`GAP`,`PORT_VISIT`                                                                            | False    | string  | query |
| `start-date`      | `YYYY-MM-DD`, inclusive on end date ≥                                                                                           | False    | string  | query |
| `end-date`        | `YYYY-MM-DD`, exclusive on start date <                                                                                         | False    | string  | query |
| `include-regions` | Match against regions (default true)                                                                                            | False    | boolean | query |
| `confidences`     | `2`,`3`,`4` (port visits only)                                                                                                  | False    | string  | query |
| `encounter-types` | `FISHING-CARRIER`, `FISHING-SUPPORT`, `FISHING-BUNKER`, `FISHING-FISHING`, `FISHING-TANKER`, `CARRIER-BUNKER`, `BUNKER-SUPPORT` | False    | string  | query |
| `vessel-types`    | `BUNKER`,`CARGO`,`DISCREPANCY`,`CARRIER`,`FISHING`,`GEAR`,`OTHER`,`PASSENGER`,`SEISMIC_VESSEL`,`SUPPORT`                        | False    | string  | query |

**Get fishing events:**

```bash
curl --location --request GET 'https://gateway.api.globalfishingwatch.org/v3/events?vessels[0]=9b3e9019d-d67f-005a-9593-b66b997559e5&datasets[0]=public-global-fishing-events:latest&start-date=2017-01-01&end-date=2017-01-31&limit=1&offset=0' \
  -H "Authorization: Bearer [TOKEN]"
```

**Get encounter events:**

```bash
curl --location --request GET 'https://gateway.api.globalfishingwatch.org/v3/events?datasets[0]=public-global-encounters-events:latest&vessels[0]=8c7304226-6c71-edbe-0b63-c246734b3c01&limit=1&offset=0' \
  -H "Authorization: Bearer [TOKEN]"
```

**Get loitering events:**

```bash
curl --location --request GET 'https://gateway.api.globalfishingwatch.org/v3/events?datasets[0]=public-global-loitering-events-carriers:latest&vessels[0]=8c7304226-6c71-edbe-0b63-c246734b3c01&limit=1&offset=0' \
  -H "Authorization: Bearer [TOKEN]"
```

**Get port visits:**

```bash
curl --location --request GET 'https://gateway.api.globalfishingwatch.org/v3/events?datasets[0]=public-global-port-visits-events:latest&vessels[0]=914f83946-6af4-04c6-4974-44a203a87952&limit=1&offset=0' \
  -H "Authorization: Bearer [TOKEN]"
```

Each event entry includes: `start`, `end`, `id`, `type`, `position {lat,lon}`, `regions {mpa,eez,rfmo,fao,majorFao,eez12Nm,highSeas,mpaNoTakePartial,mpaNoTake}`, `boundingBox`, `distances {startDistanceFromShoreKm, endDistanceFromShoreKm, startDistanceFromPortKm, endDistanceFromPortKm}`, `vessel {id,name,ssvid}`, and a type-specific object (`fishing`, `encounter`, `loitering`, `port_visit`) with metrics like `totalDistanceKm`, `averageSpeedKnots`, `potentialRisk`, etc. Port visits include nested `startAnchorage`/`intermediateAnchorage`/`endAnchorage` objects and a `confidence` level (2–4).

### Get All Events (POST)

```
POST https://gateway.api.globalfishingwatch.org/v3/events
```

**URL Parameters:** `limit` (true), `offset` (true), `sort` (false — same enum as GET)

**Body Parameters**

| Parameter                                 | Description                                                                                                                                                                                                                       | Required | Format     | Type |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ---------- | ---- |
| `datasets`                                | Dataset(s) array                                                                                                                                                                                                                  | True     | `[string]` | body |
| `vessels`                                 | Vessel id array                                                                                                                                                                                                                   | False    | `[string]` | body |
| `types`                                   | `PORT`,`ENCOUNTER`,`LOITERING`,`GAP`,`PORT_VISIT`                                                                                                                                                                                 | False    | `[string]` | body |
| `startDate`                               | `YYYY-MM-DD`                                                                                                                                                                                                                      | False    | string     | body |
| `endDate`                                 | `YYYY-MM-DD`                                                                                                                                                                                                                      | False    | string     | body |
| `confidences`                             | `'2'`,`'3'`,`'4'`                                                                                                                                                                                                                 | False    | `[string]` | body |
| `encounterTypes`                          | `CARRIER-FISHING`,`FISHING-CARRIER`,`FISHING-SUPPORT`,`SUPPORT-FISHING`,`FISHING-BUNKER`,`BUNKER-FISHING`,`FISHING-FISHING`,`FISHING-TANKER`,`TANKER-FISHING`,`CARRIER-BUNKER`,`BUNKER-CARRIER`,`SUPPORT-BUNKER`,`BUNKER-SUPPORT` | False    | `[string]` | body |
| `duration`                                | Min duration, minutes                                                                                                                                                                                                             | False    | number     | body |
| `vesselTypes`                             | `FISHING`,`CARRIER`,`SUPPORT`,`PASSENGER`,`OTHER_NON_FISHING`,`SEISMIC_VESSEL`,`BUNKER_OR_TANKER`,`CARGO`                                                                                                                         | False    | `[string]` | body |
| `vesselGroups`                            | Vessel-group ids                                                                                                                                                                                                                  | False    | `[string]` | body |
| `flags`                                   | ISO3 flags                                                                                                                                                                                                                        | False    | `[string]` | body |
| `geometry`                                | GeoJSON region                                                                                                                                                                                                                    | False    | object     | body |
| `region` / `region.id` / `region.dataset` | Region reference                                                                                                                                                                                                                  | False    | object     | body |

**Example — fishing events, custom polygon, flag filter:**

```bash
curl --location --request POST 'https://gateway.api.globalfishingwatch.org/v3/events?offset=0&limit=1' \
  --header 'Authorization: Bearer [TOKEN]' --header 'Content-Type: application/json' \
  --data-raw '{
    "datasets": ["public-global-fishing-events:latest"],
    "startDate": "2017-01-01", "endDate": "2017-01-31",
    "flags": ["CHN"],
    "geometry": { "type": "Polygon", "coordinates": [[[120.37,26.73],[122.37,26.73],[122.37,28.32],[120.37,28.32],[120.37,26.73]]] }
  }'
```

**Example — encounter events, vessel filter + region + flag + min duration:**

```bash
curl --location --request POST 'https://gateway.api.globalfishingwatch.org/v3/events?offset=0&limit=1' \
  --header 'Authorization: Bearer [TOKEN]' --header 'Content-Type: application/json' \
  --data-raw '{
    "datasets": ["public-global-encounters-events:latest"],
    "startDate": "2017-01-01", "endDate": "2017-01-31",
    "vessels": ["55d38c0ee-e0d7-cb32-ac9c-8b3680d213b3"],
    "flags": ["TWN"], "duration": 60,
    "geometry": { "type": "Polygon", "coordinates": [[[-130.97,-17.69],[-130.49,-17.69],[-130.49,-17.21],[-130.97,-17.21],[-130.97,-17.69]]] }
  }'
```

**Example — loitering events:** analogous body with `"datasets": ["public-global-loitering-events-carriers:latest"]`.

**Example — port visits:** analogous body with `"datasets": ["public-global-port-visits-events:latest"]`.

**Example — fishing events within a region by id (Senegal EEZ):**

```bash
curl --location --request POST 'https://gateway.api.globalfishingwatch.org/v3/events?offset=0&limit=1' \
  --header 'Authorization: Bearer [TOKEN]' --header 'Content-Type: application/json' \
  --data-raw '{
    "datasets": ["public-global-fishing-events:latest"],
    "startDate": "2020-10-01", "endDate": "2020-12-31",
    "flags": ["CHN"],
    "region": { "dataset": "public-eez-areas", "id": 8371 }
  }'
```

_(Response includes the full EEZ region geometry and metadata for the matched region — omitted here for brevity; use the region id from the Reference Data endpoints below.)_

### Get one by Event ID

```
GET https://gateway.api.globalfishingwatch.org/v3/events/{eventId}
```

**URL Parameters**

| Parameter | Description                  | Required | Format  | Type  |
| --------- | ---------------------------- | -------- | ------- | ----- |
| `eventId` | —                            | True     | string  | path  |
| `raw`     | Return unparsed full content | False    | boolean | query |
| `dataset` | Dataset                      | True     | string  | query |

```bash
curl --location --request GET 'https://gateway.api.globalfishingwatch.org/v3/events/c2f0967e061f99a01793edac065de003?dataset=public-global-port-visits-events:latest' \
  -H "Authorization: Bearer [TOKEN]"
```

### Statistics on events (POST)

Available for: fishing, encounters, loitering, AIS off (GAPs), port visits.

```
POST /v3/events/stats
```

No query params — all in body.

**Body Parameters**

| Parameter             | Description                                                                                              | Required | Format     |
| --------------------- | -------------------------------------------------------------------------------------------------------- | -------- | ---------- |
| `datasets`            | Dataset(s) array                                                                                         | True     | `[string]` |
| `vessels`             | Vessel id array                                                                                          | False    | `[string]` |
| `types`               | `PORT`,`ENCOUNTER`,`LOITERING`,`GAP`,`PORT_VISIT`                                                        | False    | `[string]` |
| `startDate`/`endDate` | `YYYY-MM-DD`                                                                                             | False    | string     |
| `confidences`         | `'2'`,`'3'`,`'4'`                                                                                        | False    | `[string]` |
| `encounterTypes`      | `CARRIER-FISHING`,`FISHING-CARRIER`,`FISHING-SUPPORT`,`SUPPORT-FISHING`                                  | False    | `[string]` |
| `vesselGroups`        | Vessel-group ids                                                                                         | False    | `[string]` |
| `geometry`            | GeoJSON region                                                                                           | False    | object     |
| `region`              | Region reference                                                                                         | False    | object     |
| `timeseriesInterval`  | `HOUR`,`DAY`,`MONTH`,`YEAR`                                                                              | True     | string     |
| `includes`            | `TOTAL_COUNT`,`TIME_SERIES`                                                                              | False    | `[string]` |
| `vesselTypes`         | `BUNKER`,`CARGO`,`DISCREPANCY`,`CARRIER`,`FISHING`,`GEAR`,`OTHER`,`PASSENGER`,`SEISMIC_VESSEL`,`SUPPORT` | False    | `[string]` |

**Response schema**

| Field        | Type                     | Description           |
| ------------ | ------------------------ | --------------------- |
| `flags`      | `[string]`               | Distinct flags        |
| `numEvents`  | number                   | Event count           |
| `numFlags`   | number                   | Distinct flag count   |
| `numVessels` | number                   | Distinct vessel count |
| `timeseries` | array of `{date, value}` | Time series counts    |

```bash
# Encounter stats
curl --location --request POST 'https://gateway.api.globalfishingwatch.org/v3/events/stats' \
  --header 'Content-Type: application/json' --header 'Authorization: Bearer {access-token}' \
  --data-raw '{
    "datasets": ["public-global-encounters-events:latest"],
    "encounterTypes": ["CARRIER-FISHING","FISHING-CARRIER"],
    "vesselTypes": ["CARRIER"],
    "startDate": "2018-01-01", "endDate": "2023-01-31",
    "timeseriesInterval": "YEAR", "flags": ["RUS"], "duration": 60
  }'
```

```bash
# Port visits stats in a region (Senegal EEZ)
curl --location --request POST 'https://gateway.api.globalfishingwatch.org/v3/events/stats' \
  --header 'Content-Type: application/json' --header 'Authorization: Bearer {access-token}' \
  --data-raw '{
    "confidences": ["3","4"],
    "datasets": ["public-global-port-visits-events:latest"],
    "startDate": "2018-01-01", "endDate": "2019-01-31",
    "timeseriesInterval": "YEAR",
    "region": { "dataset": "public-eez-areas", "id": 8371 }
  }'
```

---

## Insights API

### Introduction

Vessel insights combining AIS-known activity, identity, and public authorizations, to support risk-based decision-making, operational planning, and IUU due diligence. Developed with TMT, ORRAA, and insurance industry partners.

### Insights by vessels

Returns events (use Events API for full detail).

**Available insights:**

- Apparent fishing events in no-take MPAs
- Apparent fishing events in areas with no known RFMO authorization
- Vessel's AIS coverage metric
- AIS off events
- RFMO IUU vessel list presence

```
POST https://gateway.api.globalfishingwatch.org/v3/insights/vessels
```

**Body**

| Key         | Description                                                     | Required | Format      |
| ----------- | --------------------------------------------------------------- | -------- | ----------- |
| `includes`  | `FISHING`, `GAP`, `COVERAGE`, `VESSEL-IDENTITY-IUU-VESSEL-LIST` | True     | string enum |
| `startDate` | `YYYY-MM-DD`                                                    | True     | string      |
| `endDate`   | `YYYY-MM-DD`                                                    | True     | string      |
| `vessels`   | Array of `{datasetId, vesselId}`                                | True     | object      |

**Fishing insight example:**

```bash
curl --location --request POST 'https://gateway.api.globalfishingwatch.org/v3/insights/vessels' \
  --header 'Authorization: Bearer [TOKEN]' --header 'Content-Type: application/json' \
  --data-raw '{
    "includes": ["FISHING"],
    "startDate": "2020-01-01", "endDate": "2020-12-31",
    "vessels": [{"datasetId":"public-global-vessel-identity:latest","vesselId":"785101812-2127-e5d2-e8bf-7152c5259f5f"}]
  }'
```

Response: `period`, `apparentFishing.datasets`, `historicalCounters`, `periodSelectedCounters`, `eventsInRfmoWithoutKnownAuthorization[]`, `eventsInNoTakeMpas[]`.

**AIS-off (GAP) insight example:** `"includes": ["GAP"]` → returns `gap.historicalCounters`, `periodSelectedCounters`, `aisOff[]`.

**IUU list insight example:** `"includes": ["VESSEL-IDENTITY-IUU-VESSEL-LIST"]` → returns `vesselIdentity.iuuVesselList` with `valuesInThePeriod[]`, `totalTimesListed`, `totalTimesListedInThePeriod`.

---

## Datasets API

### Introduction

Provides SAR fixed infrastructure data in MVT format.

### Get SAR fixed infrastructure context layer (MVT)

```
GET https://gateway.api.globalfishingwatch.org/v3/datasets/public-fixed-infrastructure-filtered:latest/user-context-layers/{z}/{x}/{y}
```

```bash
curl --location 'https://gateway.api.globalfishingwatch.org/v3/datasets/public-fixed-infrastructure-filtered:latest/context-layers/1/0/1' \
  -H "Authorization: Bearer [TOKEN]" -o "sar_fixed_infrastructure.mvt"
```

Offshore SAR infrastructure (2017–~3 months ago). Ref: Paolo et al. 2024, _Nature_.

**Filtering vs. Public Map / Bulk Download / Data Download Portal:** This API mirrors the Public Map filtering — excludes noise-labeled data; relabels `lake_maracaibo` → `oil`; only includes structures detected ≥3 months with noise probability < 0.3; filters extra noisy regions (Chile, Canada, Norway) at these coordinate ranges:

```
lat -50.6 to -41.51, lon -80.44 to -75.71   -- chile
lat  50.6 to  74.02, lon -115.8 to -60.53   -- canada
lat  64.2 to  67.43, lon  10.58 to  16.06   -- norway_s
lat  67.63 to 71.19, lon  12.44 to  31.08   -- norway_n
```

**URL Parameters**

| Parameter | Description  | Required | Format | Type |
| --------- | ------------ | -------- | ------ | ---- |
| `z`       | Zoom (0–9)   | True     | number | path |
| `x`/`y`   | Tile indices | True     | number | path |

**Response fields**

| Field                                       | Description                                      |
| ------------------------------------------- | ------------------------------------------------ |
| `structure_id`                              | Unique id across all detections of the structure |
| `lat`/`lon`                                 | Structure coordinates                            |
| `label`                                     | `oil`, `wind`, `unknown`                         |
| `structure_start_date`/`structure_end_date` | Epoch ms                                         |
| `label_confidence`                          | `high`/`medium`/`low`                            |

**Use cases:** maritime domain awareness, vessel-infrastructure interaction analysis, MPA/marine spatial planning consultation, pollution-source differentiation.

---

## Bulk Download API

### Introduction

Supports workflows needing bulk data access — integrates with data engineering/research pipelines.

**Current dataset:** `public-fixed-infrastructure-data:latest` — Sentinel-1/Sentinel-2 fixed infrastructure detections, 2017–~3 months ago, updated daily. Same underlying data as the [Data Download Portal]. Ref: Paolo et al. 2024, _Nature_.

Detection: CFAR algorithm (excludes non-stationary objects) + ConvNeXt-based deep learning classification into `oil`, `wind`, `unknown`, `lake maracaibo`, `noise`. Post-processed with clustering, temporal smoothing, manual review. Confidence: high/medium/low.

> **Difference from the Datasets API:** Bulk Download returns _all_ fixed infrastructure data (including Chile/Canada/Norway and some noise); Datasets API + Map filter that out.

**Endpoints:**

- Create a Bulk Report
- Get Bulk Report status by ID
- Download report files (signed URLs)
- Query report results in JSON

### Create a Bulk Report

```
POST https://gateway.api.globalfishingwatch.org/v3/bulk-reports
```

**Body**

| Parameter | Description                                                                                                                                                                                        | Required | Format           |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ---------------- |
| `name`    | Report name                                                                                                                                                                                        | true     | string           |
| `dataset` | e.g. `public-fixed-infrastructure-data:latest`                                                                                                                                                     | true     | string           |
| `geojson` | Custom region GeoJSON                                                                                                                                                                              | true*    | string (GeoJSON) |
| `format`  | `CSV` or `JSON`                                                                                                                                                                                    | true     | Enum             |
| `region`  | Predefined region `{dataset, id}`                                                                                                                                                                  | false    | object           |
| `filters` | Array of filter strings. Available: `label` (`oil`/`wind`/`unknown`), `structure_start_date`, `structure_end_date` (both `YYYY-MM-DD`), `label_confidence` (`low`/`medium`/`high`), `structure_id` | true     | array of strings |

*Use either `geojson` or `region`, not both.

**Example — Argentina EEZ, label = oil, date range:**

```bash
curl --location 'https://gateway.api.globalfishingwatch.org/v3/bulk-reports' \
  --header 'Content-Type: application/json' --header 'Accept: application/json' --header 'Authorization: Bearer TOKEN' \
  --data '{
    "name": "sar-vessel-detection-example-1",
    "dataset": "public-fixed-infrastructure-data:latest",
    "format": "CSV",
    "region": { "dataset": "public-eez-areas", "id": 8466 },
    "filters": ["label = '\''oil'\''", "structure_start_date between '\''2020-01-01'\'' and '\''2025-01-01'\''"]
  }'
```

Response:

```json
{
  "id": "adbb9b62-5c08-4142-82e0-b2b575f3e058",
  "dataset": "public-fixed-infrastructure-data:v1.1",
  "name": "sar-vessel-detection-example-1",
  "filepath": "sar_fixed_infrastructure_202409.csv",
  "filters": [
    "label = 'oil'",
    "structure_start_date between '2020-01-01' and '2025-01-01' "
  ],
  "status": "pending",
  "geom": { "type": "dataset", "dataset": "public-eez-areas", "id": 8466 },
  "createdAt": "2025-06-27T06:43:35.571Z",
  "updatedAt": "2025-06-27T06:43:35.571Z",
  "ownerId": 509,
  "ownerType": "user-application",
  "format": "CSV",
  "fileSize": null
}
```

Other filter variations (same request shape, different `filters`):

- `label_confidence = 'high'` / `'medium'` / `'low'`
- `structure_id = 313068`
- `structure_start_date between '2020-01-01' and '2023-01-01'` + `structure_end_date between '2022-01-01' and '2025-01-01'`
- Custom GeoJSON region (`"geojson": {"type": "MultiPolygon", "coordinates": [...]}`) instead of `region`

**Bulk Report object schema**

| Name                    | Type                | Description                                                            |
| ----------------------- | ------------------- | ---------------------------------------------------------------------- |
| `id`                    | string (UUID)       | Report id                                                              |
| `dataset`               | string              | Resolved dataset version, e.g. `public-fixed-infrastructure-data:v1.1` |
| `name`                  | string              | Report name                                                            |
| `filepath`              | string              | Output filename                                                        |
| `format`                | string              | `CSV`/`JSON`                                                           |
| `filters`               | array               | Applied filters                                                        |
| `geom`                  | object              | Region used (id or custom GeoJSON)                                     |
| `status`                | string              | `pending`/`processing`/`done`/`failed`                                 |
| `ownerId`/`ownerType`   | number/string       | Owner                                                                  |
| `createdAt`/`updatedAt` | datetime (ISO 8601) | Timestamps                                                             |
| `fileSize`              | number              | Size in bytes (if available)                                           |

### Get Bulk Report by ID

```
GET https://gateway.api.globalfishingwatch.org/v3/bulk-reports/{id}
```

Poll periodically — large regions/date ranges can take minutes to hours. Returns the same shape as the create response (status updates to `done`/`failed`).

```bash
curl --location 'https://gateway.api.globalfishingwatch.org//v3/bulk-reports/adbb9b62-5c08-4142-82e0-b2b575f3e058' \
  --header 'Accept: application/json' --header 'Authorization: Bearer TOKEN'
```

### Download bulk report (URL file)

```
GET https://gateway.api.globalfishingwatch.org/v3/bulk-reports/{id}/download-file-url
```

**Parameters**

| Parameter | Description                 | Required | Format | Type  |
| --------- | --------------------------- | -------- | ------ | ----- |
| `id`      | Report id                   | true     | string | path  |
| `file`    | `DATA`, `README`, or `GEOM` | true     | string | query |

Returns `{ "url": "<signed GCP URL>" }` (short-lived signed link).

```bash
curl --location 'https://gateway.api.globalfishingwatch.org/v3/bulk-reports/adbb9b62-5c08-4142-82e0-b2b575f3e058/download-file-url?file=DATA' \
  --header 'Accept: application/json' --header 'Authorization: Bearer TOKEN'
```

### Get data in JSON format (query results)

```
GET https://gateway.api.globalfishingwatch.org/v3/bulk-reports/:id/query
```

**URL Parameters**

| Parameter | Description                                                                                                       | Required | Format       | Type  |
| --------- | ----------------------------------------------------------------------------------------------------------------- | -------- | ------------ | ----- |
| `id`      | Report id                                                                                                         | true     | string       | path  |
| `limit`   | Max records                                                                                                       | false    | integer      | query |
| `offset`  | Records to skip                                                                                                   | false    | integer      | query |
| `sort`    | `structure_start_date`, `structure_end_date`, `detection_date`, `label`, `label_confidence` (prefix `-` for DESC) | false    | string       | query |
| `fields`  | Comma-separated field list                                                                                        | false    | string array | query |

**Response fields**

| Name                                        | Type                  | Description                            |
| ------------------------------------------- | --------------------- | -------------------------------------- |
| `detection_id`                              | string                | Unique satellite detection id          |
| `detection_date`                            | string (`YYYY-MM-DD`) | Detection date                         |
| `structure_id`                              | string                | Groups all detections of one structure |
| `lon`/`lat`                                 | number                | Coordinates                            |
| `structure_start_date`/`structure_end_date` | string / null         | First/last detection date              |
| `label`                                     | string                | `oil`/`wind`/`unknown`                 |
| `label_confidence`                          | string                | `low`/`medium`/`high`                  |

```bash
curl --location 'https://gateway.api.globalfishingwatch.org/v3/bulk-reports/adbb9b62-5c08-4142-82e0-b2b575f3e058/query?limit=2&offset=0&sort=-structure_start_date' \
  --header 'Accept: application/json' --header 'Authorization: Bearer TOKEN'
```

### Get All Bulk Reports by User

```
GET https://gateway.api.globalfishingwatch.org/v3/bulk-reports
```

**URL Parameters**

| Parameter | Description                            | Required | Format | Type  |
| --------- | -------------------------------------- | -------- | ------ | ----- |
| `limit`   | Max results                            | true     | number | query |
| `offset`  | Pagination offset                      | true     | number | query |
| `sort`    | e.g. `-createdAt`                      | false    | string | query |
| `status`  | `pending`/`processing`/`done`/`failed` | false    | string | query |
| `dataset` | Filter by alias or resolved version    | false    | string | query |

```bash
curl --location 'https://gateway.api.globalfishingwatch.org/v3/bulk-reports?limit=10&offset=5&sort=-createdAt&dataset=public-fixed-infrastructure-data:latest' \
  --header 'Accept: application/json' --header 'Authorization: Bearer [TOKEN]'
```

**Status codes:** `200` OK · `401` Unauthorized · `403` Forbidden · `422` Unprocessable Entity · `500` Internal Server Error

---

## General API Documentation

### Key Concepts: API Dataset & Vessel ID

**API Dataset** identifies which data you're requesting.

> Use the `latest` alias to always get the newest improvements, e.g. `public-global-fishing-events:latest`. As of **Feb 25, 2026**, `latest` → v4 datasets.

**API Dataset for 4Wings API**

| Dataset                               | Description                                                                                                                   |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `public-global-fishing-effort:latest` | AIS apparent fishing effort, 2012–96h ago. Filters: `flag`, `geartype`, `vessel_id`                                           |
| `public-global-sar-presence:latest`   | SAR vessel detections, 2017–5 days ago. Filters: `matched`, `flag`, `vessel_id`, `geartype`, `neural_vessel_type`, `shiptype` |
| `public-global-presence:latest`       | AIS vessel presence, 2012–~96h ago, 1 position/hour/vessel. Filters: `flag`, `vessel_type`, `speed`, `vessel_id`              |

**API Dataset for Events API**

| Dataset                                   | Description                                                                                                                   |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `public-global-encounters-events:latest`  | Encounters: fishing-carrier, fishing-support, fishing-bunker, fishing-fishing, tanker-fishing, carrier-bunker, support-bunker |
| `public-global-loitering-events:latest`   | Loitering, all vessel types                                                                                                   |
| `public-global-fishing-events:latest`     | Apparent fishing events                                                                                                       |
| `public-global-port-visits-events:latest` | Port visits, all vessel types (→ `v3.1`)                                                                                      |
| `public-global-gaps-events:latest`        | AIS off events, all vessel types. **Prototype stage** (QA in progress)                                                        |

**API Dataset for Vessels API**

| Dataset                                | Description                               |
| -------------------------------------- | ----------------------------------------- |
| `public-global-vessel-identity:latest` | All vessel types, AIS + public registries |

**API Dataset for Datasets API**

| Dataset                                       | Description                                                      |
| --------------------------------------------- | ---------------------------------------------------------------- |
| `public-fixed-infrastructure-filtered:latest` | Offshore infrastructure, 2017–~3 months ago, SAR + deep learning |

**API Dataset for Bulk Download API**

| Dataset                                   | Description                                                                                                     |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `public-fixed-infrastructure-data:latest` | Offshore fixed infrastructure detections (Sentinel-1/2), 2017–~3 months ago, minimal filtering, updated monthly |

### API dataset-specific versions

Sending `latest` returns the resolved version in a custom response header: `x-datasets` (e.g. `public-global-fishing-effort:v4.0`).

Selected available specific versions:

| API Dataset                                             | Description                                                                                                 |
| ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `public-global-fishing-effort:v4.0`                     | Apparent fishing effort, Data Pipeline v4                                                                   |
| `public-global-fishing-effort:v3.0`                     | Apparent fishing effort, Data Pipeline v3                                                                   |
| `public-global-sar-presence:v4.0` / `v3.0`              | SAR detections, AIS matching per pipeline version                                                           |
| `public-global-presence:v4.0` / `v3.0`                  | AIS vessel presence, per pipeline version                                                                   |
| `public-global-encounters-events:v4.0` / `v3.0`         | Encounters, per pipeline version                                                                            |
| `public-global-loitering-events:v4.0` / `v3.0`          | Loitering, per pipeline version                                                                             |
| `public-global-fishing-events:v4.0` / `v3.0`            | Fishing events, per pipeline version                                                                        |
| `public-global-port-visits-events:v4` / `v3.1` / `v3.0` | Port visits — v3.1/v4 use intermediate-anchorage location method (more precise); v3.0 uses average location |
| `public-global-gaps-events:v4.0` / `v3.0`               | AIS off events (prototype stage)                                                                            |
| `public-global-vessel-identity:v4.0` / `v3.0`           | Vessel identity, per pipeline version                                                                       |
| `public-fixed-infrastructure-filtered:v1.1`             | Datasets API infrastructure                                                                                 |
| `public-fixed-infrastructure-data:v1.0`                 | Bulk Download infrastructure                                                                                |

> Several `:v20231026` and earlier dataset versions are **DEPRECATED** — do not use for new integrations.

### API datasets versioning

- Header warning shown if a newer version exists for a requested specific version.
- Old datasets remain available up to **3 months** before deprecation.
- Requesting a deprecated dataset → `422` error.

### Vessel ID

A unique GFW-internal vessel identity combining name, callsign, MMSI, etc., to track vessels across inconsistent AIS transmission. Links across APIs. In the Vessel API it's the `id` field inside `selfReportedInfo`.

### Error Codes

| Range | Meaning      |
| ----- | ------------ |
| 2XX   | Success      |
| 4XX   | Client error |
| 5XX   | Server error |

| Code | Meaning                               |
| ---- | ------------------------------------- |
| 200  | OK                                    |
| 202  | Accepted (processing)                 |
| 204  | No content (e.g. empty tile)          |
| 401  | Unauthorized (bad/missing token)      |
| 403  | Forbidden                             |
| 404  | Not Found                             |
| 422  | Unprocessable Entity (e.g. zoom > 12) |
| 429  | Too Many Requests                     |
| 503  | Service Unavailable                   |

**Standard error response shape:**

```json
{ "statusCode": 4XXX_or_5XXX, "messages": [{ "title": "[Title]", "detail": "[Detail]" }], "error": "[Generic error]" }
```

(One exception: 413 "Request Entity Too Large" on custom-polygon reports, returned as raw HTML — use a `region-id` instead for very large geometries.)

### Response format

- **Single resource:** returned directly.
- **Collection:** paginated envelope with `total`, `limit`, `offset`, `nextOffset`, `metadata`, `entries`.

### Data caveats (summary)

- **Apparent fishing effort:** reflects fishing-related behavior broadly (not just gear setting/hauling); false positives possible; vessel/gear misclassification possible (e.g. MMSI recycling); fishing _events_ ≠ fishing _effort_ (events apply extra time/distance/behavior filters).
- **AIS Vessel Presence:** one position/hour/vessel; subject to AIS limitations; recommend short time windows for large-volume analysis.
- **Events general:** all "apparent" — AIS-based estimates, not certainties.
- **Encounter event:** two vessels' interpolated positions <500m apart for ≥2 hours (10-min interpolation grid); GFW pre-filters map display but API allows custom filters.
- **Loitering event:** single vessel avg speed <2 knots, avg ≥20 nm from shore; may overlap encounters.
- **Port visit events:** port entry (within 3km anchorage), port stop (speed 0.2–0.5 knots), port gap (AIS gap ≥4h in port), port exit (>4km from anchorage). Confidence: 2 (low, stop/gap only) / 3 (medium, +entry or exit) / 4 (high, entry+stop/gap+exit).
- **Apparent fishing events:** grouped consecutive fishing positions; split if >10km apart or >2h gap; merged if within 1h/2km; short/fast events filtered out (see full rules for minute/position/distance/speed thresholds).
- **AIS off (GAP) event:** naive gaps >6h recorded; classified as likely intentional if: ≥12h duration, starts ≥50nm from shore, reception quality >10 positions/day, ≥14 satellite positions in prior 12h. Known limitations near-shore and for short gaps (satellite periodicity).
- **Vessel identity:** aggregated from 40+ registries; authorization ≠ compliance verification; multiple vessel ids per physical vessel possible due to inconsistent AIS transmission.
- **Publicly listed authorization:** calculated only for high seas + 5 tuna RFMOs (IATTC, ICCAT, IOTC, CCSBT, WCPFC) + SPRFMO + NPFC. Statuses: `PUBLICLY_AUTHORIZED`, `NOT_MATCHING_RELEVANT_PUBLIC_AUTHORIZATION`, `PENDING_INFO`, (encounters also) `PARTIALLY_MATCHED`. `potentialRisk` flag logic differs for fishing vs. encounter events; never flagged inside EEZs (no national registry data).
- **Insights — Coverage:** % of 1-hour blocks with ≥1 AIS transmission during voyages (excludes port time); calculated from Jan 1, 2017.
- **Insights — AIS off:** only covers gaps ≥50nm from shore.
- **Insights — IUU list:** covers only official RFMO IUU lists (CCAMLR, CCSBT, GFCM, IATTC, ICCAT, IOTC, NAFO, NEAFC, NPFC, SEAFO, SPRFMO, SIOFA, WCPFC); source is TMT Combined IUU Vessel List with documented data-collection gaps.
- **SAR Vessel Detections:** false positives possible; sparse open-ocean sampling but concentrated near-shore coverage; no detection <1km from shore or in most Arctic/Antarctic; detection limited by ~20m Sentinel-1 resolution (misses most vessels <15m); regional accuracy varies.
- **SAR Fixed Infrastructure:** no detection <1km from shore; false positives from rocks/ice/artifacts (filtered in some regions); spatial coverage varies by year; labels can change over time as more data accrues.
- **Vessel flag assignment:** derived from MMSI MID (first 3 digits); manual entry errors are common, especially in East Asian waters.

_(For exhaustive detail on any of the above, consult the corresponding GFW data-caveats pages linked from the original documentation.)_

### Reference Data

**Gear types supported** (for `geartype` filters):
`TUNA_PURSE_SEINES`, `DRIFTNETS`, `TROLLERS`, `SET_LONGLINES`, `PURSE_SEINES`, `POTS_AND_TRAPS`, `OTHER_FISHING`, `DREDGE_FISHING`, `SET_GILLNETS`, `FIXED_GEAR`, `TRAWLERS`, `FISHING`, `SEINERS`, `OTHER_PURSE_SEINES`, `OTHER_SEINES`, `SQUID_JIGGER`, `POLE_AND_LINE`, `DRIFTING_LONGLINES`

**Vessel types supported** (for `vessel_type`/`vesselTypes` filters):
`carrier`, `seismic_vessel`, `passenger`, `other`, `support`, `bunker`, `gear`, `cargo`, `fishing`, `discrepancy`

**Regions**

Region metadata (EEZs) now exposes richer ISO fields:

```json
{
  "label": "Jordanian Exclusive Economic Zone",
  "id": 8491,
  "iso3": "JOR",
  "isoSov1": "JOR",
  "isoSov2": null,
  "isoSov3": null,
  "territory1": "Jordan"
}
```

Joint/overlapping regimes get `iso3: null` with multiple `isoSovN` values.

**Get list of EEZs:**

```bash
curl --location --request GET 'https://gateway.api.globalfishingwatch.org/v3/datasets/public-eez-areas/context-layers' \
  -H "Authorization: Bearer [TOKEN]"
```

Fields: `label`, `id` (int — use in API calls), `iso3`, `isoSov1/2/3`, `territory1` (per [Marine Regions](https://marineregions.org/eezmethodology.php)).

**Get list of MPAs:**

```bash
curl --location 'https://gateway.api.globalfishingwatch.org//v3/datasets/public-mpa-all/context-layers' \
  --header 'Authorization: Bearer [TOKEN]'
```

Fields: `label`, `id` (string).

**Get list of RFMOs:**

```bash
curl --location --request GET 'https://gateway.api.globalfishingwatch.org/v3/datasets/public-rfmo/context-layers' \
  -H "Authorization: Bearer [TOKEN]"
```

Fields: `label`, `id`, `ID` (duplicate).

Region ids are used in: (1) Events API `regions` response field (EEZ/MPA/RFMO membership of an event), and (2) 4Wings Report `region.id`/`region.dataset` body params.

**Vessel API — Registry codes (selected data sources):**

| Code                                                           | Source                                                                                                                                                                                                 |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| AUS                                                            | Australia vessel registry                                                                                                                                                                              |
| CAN                                                            | Canada vessel registry                                                                                                                                                                                 |
| CCAMLR                                                         | CCAMLR authorised/IUU vessel list                                                                                                                                                                      |
| CCSBT                                                          | CCSBT authorised vessel list                                                                                                                                                                           |
| ECU                                                            | Ecuador national fleet registry                                                                                                                                                                        |
| EU                                                             | European Union                                                                                                                                                                                         |
| FFA                                                            | Pacific Islands Forum Fisheries Agency                                                                                                                                                                 |
| GFCM                                                           | GFCM authorised vessel list                                                                                                                                                                            |
| IATTC                                                          | IATTC authorised vessel list                                                                                                                                                                           |
| ICCAT                                                          | ICCAT authorised vessel list                                                                                                                                                                           |
| IMO                                                            | GISIS — as of June 2026, manually ingested fishing/support IMO records (IMO1–3) are being retired, superseded by SNP where available; limited static IMO records remain for select non-fishing vessels |
| IOTC                                                           | IOTC authorised vessel list                                                                                                                                                                            |
| ISSF                                                           | International Seafood Sustainability Foundation lists                                                                                                                                                  |
| IUU                                                            | TMT Combined IUU vessel list                                                                                                                                                                           |
| KOR                                                            | Republic of Korea vessel registry                                                                                                                                                                      |
| NAFO                                                           | NAFO vessel registry                                                                                                                                                                                   |
| NEAFC                                                          | NEAFC vessels/authorization list                                                                                                                                                                       |
| NOR                                                            | Norway authorized vessel list                                                                                                                                                                          |
| NPFC                                                           | NPFC vessel registry                                                                                                                                                                                   |
| PER                                                            | Peruvian vessel list                                                                                                                                                                                   |
| RUS                                                            | Russia vessel registry                                                                                                                                                                                 |
| SEAFO                                                          | SEAFO authorised vessel list                                                                                                                                                                           |
| SIOFA                                                          | SIOFA authorised vessel list                                                                                                                                                                           |
| SNP                                                            | S&P Global Ships Data — expands IMO source (ownership, year built, length, tonnage); records combining SNP with ≥1 other source only, per licensing                                                    |
| SPRFMO                                                         | SPRFMO vessel list                                                                                                                                                                                     |
| TMT / TMT_National / TMT_Other / TMT_Other_Official / TMT_RFMO | Multiple TMT-sourced categories, incl. OFAC sanctions list, ILO seafarer-abandonment list, Paris MOU detentions                                                                                        |
| TWN                                                            | Chinese Taipei (Fisheries Agency of Taiwan)                                                                                                                                                            |
| USA                                                            | US Merchant Vessels / FCC vessel license list                                                                                                                                                          |
| WCPFC                                                          | WCPFC fishing vessel database                                                                                                                                                                          |

_(Full source list — 40+ entries — available in the original documentation table.)_

---

## SDKs

### Global Fishing Watch R Package — `gfwr`

Updated to use API v3 (breaking changes to parameter names/output vs. earlier versions — see the package change log).

- New endpoints: `get_events_stats()`, `get_last_report()`.
- Note: some frontend-oriented endpoints are not implemented.
- Repo: GitHub `gfwr` official page.

### Global Fishing Watch Python Package — `gfw-api-python-client`

- v1 corresponds directly to API v3 (current standard as of April 30, 2024).
- Built-in functions: Vessels identity, Events, Vessel Insights, Apparent Fishing Effort, SAR vessel detections.
- Simple authentication/token management.
- Jupyter notebook examples included.
- Supports filtering, pagination, spatial/temporal params.
- Compatible with `pandas`, `geopandas`, Jupyter.
- Repo: GitHub `python-client` official page.

---

## License and Rate Limits

### Terms of Use (summary)

Global Fishing Watch, Inc. — 1025 Connecticut Ave., NW, Ste. 200, Washington, DC 20036-5425.

**Key points:**

1. **Usage** — lawful purposes only; no misuse/overload of the Services.
2. **Noncommercial use only** — CC BY-NC 4.0. Recommended volume: ≤50,000 daily / ≤1,500,000 monthly API requests (GFW may ask heavier users to reduce usage). GFW may revoke access for non-compliant use.
3. **Accounts & API usage:**
   - Registration required; GFW may reject requests.
   - Each API request must include a unique account API key.
   - Do not reverse-engineer/decompile the API.
   - Tokens are personal — do not share, publish, or expose in public-facing code/interfaces.
   - Access may be suspended/cancelled anytime; 15-day post-cancellation content access window.
4. **Attribution & citation (required):**
   - **Websites/graphics:** _"Powered by Global Fishing Watch."_ linking to globalfishingwatch.org, OR full dataset citation with access date.
   - **Bibliography:** `"Copyright [year], Global Fishing Watch, Inc., https://globalfishingwatch.org/our-apis/."`
   - **Other products/uses:** same as websites/graphics format.
   - Attribution must be preserved by downstream users/partners. GFW name/logo/trademarks require separate written consent.
5. **Third-party content** — each dataset carries its own license; review metadata before use.
6. **Your content** — you retain ownership; grant GFW a license to use/display/distribute solely to enable your use of the Services.
7. **Disclaimers/limitations** — Services provided "AS IS"; no warranties; liability capped at $100 USD aggregate; certain jurisdictions may not allow these limitations.
8. **DMCA compliance** — notice-and-takedown process via `support@globalfishingwatch.org`.
9. **Additional terms** — DC law governs; disputes go to AAA arbitration (ICDR rules if outside the US, Commercial Arbitration Rules if within); indemnification clause; severability.

> This is a summary — refer to the full Terms of Use document for legally binding text.

### Rate Limits

GFW APIs are intended for non-commercial use. Rate limits protect infrastructure and ensure fair access.

| Limit            | Threshold         |
| ---------------- | ----------------- |
| Daily requests   | 50,000 / day      |
| Monthly requests | 1,500,000 / month |

- Measured **per user**, across **all tokens** created by that user (max 5 tokens/user).
- Whichever threshold (daily or monthly) is hit first triggers the block.
- All responses include rate-limit metadata headers.

**On exceeding a limit:**

- Returns `429 Too Many Requests`.
- **Daily limit exceeded:** all of the user's tokens blocked for 24 hours from the time of the breach.
- **Monthly limit exceeded:** all tokens blocked for 30 consecutive days.
- Tokens are **not deleted** — usable again once the reset period passes.

**Rate-limit response headers**

| Header                                   | Description                                 | Example   |
| ---------------------------------------- | ------------------------------------------- | --------- |
| `x-ratelimit-daily-limit-requests`       | Daily cap                                   | `50000`   |
| `x-ratelimit-monthly-limit-requests`     | Monthly cap                                 | `1500000` |
| `x-ratelimit-daily-remaining-requests`   | Remaining today (checked every 30 min)      | `10000`   |
| `x-ratelimit-monthly-remaining-requests` | Remaining this month (checked every 30 min) | `100000`  |
| `x-ratelimit-daily-current-usage`        | Requests counted today                      | `55000`   |
| `x-ratelimit-monthly-current-usage`      | Requests counted this month                 | `1600000` |
| `x-ratelimit-daily-reset-hours`          | Hours until daily reset (after breach)      | `12`      |
| `x-ratelimit-monthly-reset-days`         | Days until monthly reset (after breach)     | `28`      |

**How to avoid rate limits:**

- Exponential backoff on retries.
- Batch multiple tasks into one call where possible.
- Track usage via headers; slow down proactively.
- Cache frequently-accessed data locally.

### API Token

Personal and your responsibility — do not share/publish. Do not embed in any publicly discoverable web interface. Do not permit others to use your token.

---

## API Release Notes (v3)

> V2 release-note entries have been omitted — v2 is fully deprecated. Dates reflect the GFW changelog format used in the source documentation.

**V3 Key dates**

- **26 October 2023** — v3 released to production (🟢 CURRENT). v2 moved to 🟠 MAINTENANCE.
- **30 April 2024** — v2 officially 🔴 DEPRECATED (non-operational).

| Date                                | Change                                                        | API impacted                             | Description                                                                                                                                                                                                                                             |
| ----------------------------------- | ------------------------------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-06-01                          | New vessel registry data sources                              | Vessels API                              | S&P Global Ships Data (`SNP`) added, expanding ownership/year built/length/tonnage where combined with ≥1 other source. New TMT compliance sources (OFAC sanctions, ILO abandonment, Paris MOU detentions) under `TMT_Other_Official`.                  |
| 2026-06-01                          | IMO source partially retired                                  | Vessels API                              | Manually ingested IMO records (IMO1–3) for fishing/support vessels retired, superseded by SNP where available; limited static IMO records remain for select non-fishing vessels.                                                                        |
| 2026-05-14                          | API Dataset filtering + response field                        | Bulk Download API                        | `Get All Bulk Reports by User` now supports filtering by dataset alias/version; report responses include `dataset` field.                                                                                                                               |
| 2026-05-11                          | Rate limit improvements                                       | All                                      | Proper error codes, custom headers, updated rate limits for usage monitoring.                                                                                                                                                                           |
| 2026-02-26                          | New AIS data — version 4                                      | All APIs                                 | v4 datasets released on new AIS pipeline v4.                                                                                                                                                                                                            |
| 2024-12-12                          | New resource                                                  | All APIs                                 | API Workflows Guide (PDF) added, covering practical multi-API integration patterns.                                                                                                                                                                     |
| 2025-11-26 (source order as listed) | Updated region logic                                          | 4Wings, Events API                       | `iso3` logic in `public-eez-areas` refined for joint regimes/overlapping claims; added `isoSov1/2/3`, `territory1` fields.                                                                                                                              |
| 2025-10-28                          | Added `distance_from_port_km` filter                          | 4Wings Report                            | New filter to exclude low-speed near-port activity from fishing-effort reports.                                                                                                                                                                         |
| 2025-08-21                          | Documented 4Wings report response fields                      | 4Wings Report                            | Response field table added.                                                                                                                                                                                                                             |
| 2025-08-21                          | Removed `gap-intentional-disabling`/`gapIntentionalDisabling` | Events API (GET/POST)                    | Removed — all current AIS-off events are intentional gaps by definition; dataset remains in prototype stage.                                                                                                                                            |
| 2025-07-01                          | Bulk Download API released                                    | Bulk Download API                        | New async bulk-access API; launched with SAR fixed infrastructure detections (2017–~3 months ago).                                                                                                                                                      |
| 2025-06-25                          | AIS Vessel Presence dataset released                          | 4Wings API                               | `public-global-presence:v3.0` added across `/tile/heatmap`, `/report`, `/generate-png`, `/stats`, `/last-report`, `/interaction`.                                                                                                                       |
| 2025-04-11                          | New Python client package                                     | Vessels, Events, 4Wings, Insights APIs   | Official `gfw-api-python-client` release.                                                                                                                                                                                                               |
| 2025-04-11                          | Data-source comparison doc updated                            | N/A                                      | Comparison across API, `gfwr`, Python client, Data Downloads portal.                                                                                                                                                                                    |
| 2025-03-13                          | More detail in TMT sources                                    | Vessels API                              | TMT source broken into granular categories (e.g. `TMT_National`).                                                                                                                                                                                       |
| 2025-01-24                          | Old AIS dataset `v20231026` deprecated                        | All APIs                                 | Superseded by `v3`; comparison between `v20231026` and `v3` outputs not supported.                                                                                                                                                                      |
| 2025-01-15                          | `minLat`/`maxLat`/`minLon`/`maxLon` scoping                   | 4Wings API (Stats)                       | Only returned when `vessel-groups` filter is applied.                                                                                                                                                                                                   |
| 2024-11-18                          | SAR fixed infrastructure filter change                        | Datasets API                             | Removed a filter that excluded structures with `cluster_detections >= 3` — more infrastructure positions now included.                                                                                                                                  |
| 2024-11-08                          | Added `lat`/`lon` to MVT response                             | Datasets API                             | SAR fixed infrastructure MVT now includes precise coordinates.                                                                                                                                                                                          |
| 2024-10-24                          | New TMT registry source + `extraFields`                       | Vessels API                              | Adds `builtYear`, `depthM`, etc. where available.                                                                                                                                                                                                       |
| 2024-10-24                          | Port visits location method update                            | Events API                               | New `public-global-port-visits-events:v3.1` dataset using intermediate-anchorage/first-Port-Stop-or-Gap location method for greater accuracy; `v3.0` (average-location method) still available. Also fixed an issue affecting some confidence-4 events. |
| 2024-10-24                          | New params for Events Stats                                   | Events Stats (POST)                      | Added `includes` and `vesselType` params.                                                                                                                                                                                                               |
| 2024-10-24                          | New Postman collection examples                               | Events API, Vessel API                   | —                                                                                                                                                                                                                                                       |
| 2024-10-24                          | Vessel Viewer API-usage docs                                  | N/A                                      | Document showing which APIs power each Vessel Viewer page.                                                                                                                                                                                              |
| 2024-08-12                          | Vessel authorizations logic fix                               | Vessels API                              | Removed logic that merged adjacent same-source authorizations; now returns separate periods where applicable.                                                                                                                                           |
| 2024-08-01                          | New AIS data — version 3                                      | All APIs                                 | v3 datasets released on AIS pipeline v3; updated API/gfwr/Data Download comparison doc.                                                                                                                                                                 |
| 2024-06-27                          | SAR fixed infrastructure dataset added                        | Datasets API                             | New MVT dataset, 2017–~3 months ago. Ref: Paolo et al. 2024, _Nature_.                                                                                                                                                                                  |
| 2024-05-31                          | SAR vessel detection dataset added                            | All 4Wings endpoints                     | Industrial vessels, 2017–5 days ago, SAR + deep learning. Ref: Paolo et al. 2024, _Nature_.                                                                                                                                                             |
| 2024-04-23                          | API/gfwr/Data Downloads comparison doc                        | N/A                                      | New comparison document published.                                                                                                                                                                                                                      |
| 2024-04-15                          | Bins calculation change                                       | 4Wings (`/bins`)                         | Zoom-level >0 bins now calculated by dividing zoom-0 values by `4^zoom`, matching map behavior.                                                                                                                                                         |
| 2024-04-11                          | New Postman collection                                        | All                                      | Updated with more per-endpoint examples.                                                                                                                                                                                                                |
| 2024-04-10                          | New IUU-list insight                                          | Insights API                             | Vessel identity insight for RFMO IUU vessel list presence, with counters.                                                                                                                                                                               |
| 2024-04-10                          | New MVT tile field                                            | 4Wings API (`/tile/heatmap/`)            | Each MVT feature now includes a unique `id` = `{z}/{x}/{y}/{cell}`.                                                                                                                                                                                     |
| 2024-04-09                          | AIS data correction notice                                    | All                                      | AIS errors affecting data accessed 26 Jan–10 Apr 2024 were resolved; users advised to re-run analyses from that window.                                                                                                                                 |
| 2024-01-31                          | New "last report" endpoint                                    | 4Wings API (Reports)                     | Retrieve the user's last-generated report (useful after a `429`).                                                                                                                                                                                       |
| 2024-01-03                          | New AIS source — Marine Traffic                               | All                                      | Added terrestrial receivers covering Mediterranean, South China Sea, North Sea.                                                                                                                                                                         |
| 2023-10-26                          | **Major version 3 released**                                  | Vessel API, Insights API, 4Wings, Events | New Vessel API (regional/national registry data); new Insights API (incl. AIS-off indicators); query-param enums now uppercase across 4Wings/Events. See the v3 Migration Guide for full breaking-change details.                                       |

---

_End of document. Source: Global Fishing Watch API Documentation Portal, v3 (accessed July 2026). Reformatted for internal use — verify against the live docs for anything safety- or compliance-critical (e.g. rate limits, ToU)._
