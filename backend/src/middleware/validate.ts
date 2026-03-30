import type { Request, Response, NextFunction } from "express";
import type { ZodSchema } from "zod";

function formatZodErrors(error: { flatten: () => any }): string {
  const flat = error.flatten();
  const fieldErrors = flat.fieldErrors || {};
  const messages: string[] = [];
  for (const key of Object.keys(fieldErrors)) {
    const errs = fieldErrors[key];
    if (Array.isArray(errs) && errs.length > 0) {
      messages.push(`${key}: ${errs.join(", ")}`);
    }
  }
  const formErrors = flat.formErrors || [];
  if (formErrors.length > 0) {
    messages.push(`form: ${formErrors.join(", ")}`);
  }
  return messages.length > 0 ? messages.join(" | ") : "Validation error";
}

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({ error: formatZodErrors(result.error) });
    }

    req.validated = result.data;
    return next();
  };
}
