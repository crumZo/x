// Simple server monitoring using Bun with a small web UI

const urls = (process.env.MONITOR_URLS || "http://example.com").split(",").map(u => u.trim()).filter(Boolean);
const port = parseInt(process.env.PORT || "3000", 10);
const interval = parseInt(process.env.CHECK_INTERVAL || "30000", 10); // milliseconds

interface Status {
  url: string;
  up: boolean;
  status?: number;
  responseTime?: number;
  lastChecked: number;
}

const statuses = new Map<string, Status>();

async function check(url: string) {
  const start = Date.now();
  try {
    const response = await fetch(url, { method: "GET" });
    statuses.set(url, {
      url,
      up: response.ok,
      status: response.status,
      responseTime: Date.now() - start,
      lastChecked: Date.now(),
    });
  } catch {
    statuses.set(url, {
      url,
      up: false,
      lastChecked: Date.now(),
    });
  }
}

function scheduleChecks() {
  urls.forEach((url) => {
    check(url);
    setInterval(() => check(url), interval);
  });
}

scheduleChecks();

function renderPage() {
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Bun Monitor</title>
    <style>
      body { font-family: sans-serif; margin: 2rem; }
      table { border-collapse: collapse; width: 100%; }
      th, td { border: 1px solid #ddd; padding: 0.5rem; }
      tr:nth-child(even) { background: #f8f8f8; }
      .up { color: green; font-weight: bold; }
      .down { color: red; font-weight: bold; }
    </style>
  </head>
  <body>
    <h1>Bun Monitor</h1>
    <p>Monitoring ${urls.length} URL(s) every ${interval / 1000}s.</p>
    <table>
      <thead>
        <tr>
          <th>URL</th>
          <th>Status</th>
          <th>HTTP</th>
          <th>Response Time (ms)</th>
          <th>Last Checked</th>
        </tr>
      </thead>
      <tbody id="tbody"></tbody>
    </table>
    <script>
      async function load() {
        const res = await fetch('/api/status');
        const data = await res.json();
        const tbody = document.getElementById('tbody');
        tbody.innerHTML = '';
        for (const s of data) {
          const tr = document.createElement('tr');
          tr.innerHTML = '<td>' + s.url + '</td>' +
            '<td class="' + (s.up ? 'up' : 'down') + "">' + (s.up ? 'UP' : 'DOWN') + '</td>' +
            '<td>' + (s.status ?? '-') + '</td>' +
            '<td>' + (s.responseTime ?? '-') + '</td>' +
            '<td>' + new Date(s.lastChecked).toLocaleTimeString() + '</td>';
          tbody.appendChild(tr);
        }
      }
      setInterval(load, 2000);
      load();
    </script>
  </body>
</html>`;
}

Bun.serve({
  port,
  fetch(req) {
    const url = new URL(req.url);
    if (url.pathname === "/api/status") {
      return Response.json(Array.from(statuses.values()));
    }
    return new Response(renderPage(), { headers: { "Content-Type": "text/html" } });
  },
});

console.log(`Server running at http://localhost:${port}`);

