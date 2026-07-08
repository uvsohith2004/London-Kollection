import { zValidator } from "@hono/zod-validator"
import { z } from "zod"
import { validationHook } from "./validation-error"

/**
 * Reusable validation middleware for request bodies.
 */
export const validateBody = <T extends z.ZodTypeAny>(schema: T) => {
  return zValidator("json", schema, validationHook)
}

/**
 * Reusable validation middleware for request queries.
 */
export const validateQuery = <T extends z.ZodTypeAny>(schema: T) => {
  return zValidator("query", schema, validationHook)
}

/**
 * Reusable validation middleware for request parameters (path params).
 */
export const validateParams = <T extends z.ZodTypeAny>(schema: T) => {
  return zValidator("param", schema, validationHook)
}
