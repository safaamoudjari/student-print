import { Request, Response, NextFunction } from 'express';

// A minimal, dependency-free replacement for `express-mongo-sanitize`.
//
// That package tries to do `req.query = sanitizedCopy`, but modern Express
// versions define `req.query` as a getter-only property, so reassigning it
// throws "Cannot set property query of #<IncomingMessage> which has only a
// getter" on every single request. This version strips dangerous keys by
// mutating the existing objects in place instead of replacing them, which
// works regardless of Express version.
//
// It removes any object key that starts with "$" (Mongo operators like
// $where, $gt) or contains a "." (used for prototype/path traversal in
// query objects), recursively, so a crafted request body/query/params can
// never be interpreted as a Mongo operator.
function sanitizeInPlace(value: unknown): void {
  if (!value || typeof value !== 'object') return;

  for (const key of Object.keys(value as Record<string, unknown>)) {
    if (key.startsWith('$') || key.includes('.')) {
      delete (value as Record<string, unknown>)[key];
      continue;
    }
    sanitizeInPlace((value as Record<string, unknown>)[key]);
  }
}

export function sanitizeRequest(req: Request, _res: Response, next: NextFunction) {
  sanitizeInPlace(req.body);
  sanitizeInPlace(req.query);
  sanitizeInPlace(req.params);
  next();
}
