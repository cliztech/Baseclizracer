/**
 * Lightweight Schema Validation
 * "Simplicity is the ultimate sophistication."
 */

export const Schema = {
  string: (opts = {}) => (val) => {
    if (typeof val !== 'string') return false;
    if (opts.min && val.length < opts.min) return false;
    if (opts.max && val.length > opts.max) return false;
    return true;
  },
  number: (opts = {}) => (val) => {
    if (typeof val !== 'number' || isNaN(val)) return false;
    if (opts.min !== undefined && val < opts.min) return false;
    if (opts.max !== undefined && val > opts.max) return false;
    return true;
  },
  boolean: () => (val) => typeof val === 'boolean',
  object: (shape) => (val) => {
    if (!val || typeof val !== 'object') return false;
    for (const key in shape) {
       // Only validate keys present in the schema
       // If the value is undefined, the sub-validator must handle it (e.g. via optional wrapper)
       if (!shape[key](val[key])) return false;
    }
    return true;
  },
  optional: (validator) => (val) => {
    if (val === undefined || val === null) return true;
    return validator(val);
  }
};

export const Messages = {
  JOIN: Schema.object({
    roomId: Schema.string({ max: 32 }),
    name: Schema.string({ max: 20 }),
    spriteIndex: Schema.number()
  }),
  UPDATE: Schema.object({
    // We allow partial updates, but values must be valid if present
    x: Schema.optional(Schema.number({ min: -10, max: 10 })), // Relaxed limits for latency compensation
    z: Schema.optional(Schema.number()),
    speed: Schema.optional(Schema.number({ min: -20000, max: 20000 }))
  }),
  CHAT: Schema.object({
    message: Schema.string({ min: 1, max: 140 })
  }),
  PING: Schema.object({
    timestamp: Schema.number()
  }),
  FINISH: Schema.object({
    time: Schema.number({ min: 0 })
  })
};

export class Validator {
  static validate(schema, data) {
    if (!schema) return true; // No schema defined = pass (or fail? pass for flexibility)
    return schema(data);
  }
}
