import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { sendError } from '../utils/response';

type ValidationTarget = 'body' | 'params' | 'query';

/**
 * Zod validation middleware factory.
 * Validates request body, params, or query against a Zod schema.
 */
export function validate(schema: ZodSchema, target: ValidationTarget = 'body') {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const data = schema.parse(req[target]);
      req[target] = data;
      next();
    } catch (error: any) {
      if (error instanceof ZodError || error.issues) {
        const issues = (error as any).issues || (error as any).errors || [];
        const messages = issues.map((e: any) => `${e.path?.join('.') || 'field'}: ${e.message}`);
        sendError(res, `Validation error: ${messages.join('; ')}`, 400);
        return;
      }
      next(error);
    }
  };
}

/**
 * Validate multiple targets at once.
 */
export function validateMultiple(schemas: { body?: ZodSchema; params?: ZodSchema; query?: ZodSchema }) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      if (schemas.params) {
        req.params = schemas.params.parse(req.params) as Record<string, string>;
      }
      if (schemas.query) {
        req.query = schemas.query.parse(req.query) as Record<string, string>;
      }
      next();
    } catch (error: any) {
      if (error instanceof ZodError || error.issues) {
        const issues = (error as any).issues || (error as any).errors || [];
        const messages = issues.map((e: any) => `${e.path?.join('.') || 'field'}: ${e.message}`);
        sendError(res, `Validation error: ${messages.join('; ')}`, 400);
        return;
      }
      next(error);
    }
  };
}
