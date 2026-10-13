import { collectDefaultMetrics, Counter, Histogram, Gauge, register } from 'prom-client';
import type { Request, Response, NextFunction } from 'express';

// Collect default Node.js metrics (memory, CPU, event loop, etc.)
collectDefaultMetrics({ prefix: 'crm_care_' });

// HTTP Request Counter
export const httpRequestsTotal = new Counter({
  name: 'crm_care_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

// HTTP Request Duration Histogram
export const httpRequestDuration = new Histogram({
  name: 'crm_care_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
});

// HTTP Error Counter
export const httpErrorsTotal = new Counter({
  name: 'crm_care_http_errors_total',
  help: 'Total number of HTTP errors (4xx and 5xx)',
  labelNames: ['method', 'route', 'status_code'],
});

// Active Connections Gauge
export const activeConnections = new Gauge({
  name: 'crm_care_active_connections',
  help: 'Number of active connections',
});

// HTTP Metrics (exported metrics object for http-related counter)
export const httpMetrics = {
  requestsTotal: httpRequestsTotal,
  requestDuration: httpRequestDuration,
  errorsTotal: httpErrorsTotal,
};

// Middleware to track metrics
export function metricsMiddleware(req: Request, res: Response, next: NextFunction): void {
  if (req.path === '/metrics') {
    return next();
  }

  const startTime = Date.now();
  activeConnections.inc();

  res.on('finish', () => {
    const duration = (Date.now() - startTime) / 1000;
    const route = req.route?.path || req.path || 'unknown';
    const labels = {
      method: req.method,
      route,
      status_code: res.statusCode.toString(),
    };

    httpRequestsTotal.inc(labels);
    httpRequestDuration.observe(labels, duration);

    if (res.statusCode >= 400) {
      httpErrorsTotal.inc(labels);
    }

    activeConnections.dec();
  });

  next();
}

export { register };
