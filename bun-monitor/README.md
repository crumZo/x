# bun-monitor

A minimal server status monitor built with [Bun](https://bun.sh). It checks a list of URLs and serves a small dashboard similar to Uptime Kuma.

## Setup

Install dependencies:

```bash
bun install
```

## Usage

Set the URLs you want to monitor in the `MONITOR_URLS` environment variable separated by commas:

```bash
MONITOR_URLS="https://example.com,https://bun.sh" bun run index.ts
```

Optional environment variables:

- `PORT` - port for the web UI (default `3000`)
- `CHECK_INTERVAL` - how often to check in milliseconds (default `30000`)

Then open `http://localhost:3000` to see the status table update in real time.

This project was created using `bun init`.
