import type { TGuard } from "@/routes";
import type { MantouPlugin } from "@/exports/types";
import addFormats from "ajv-formats";
import Ajv from "ajv/dist/core";
import type { TSchema } from "elysia";

const ajv = addFormats(
  new Ajv({
    removeAdditional: true,
    useDefaults: true,
    coerceTypes: true,
    allErrors: true,
  }),
  [
    "date-time",
    "time",
    "date",
    "email",
    "hostname",
    "ipv4",
    "ipv6",
    "uri",
    "uri-reference",
    "uuid",
    "uri-template",
    "json-pointer",
    "relative-json-pointer",
    "regex",
  ]
);

function validateSchema(
  schema: TSchema | undefined,
  data: any
): {
  valid: boolean;
  errors?: any;
} {
  if (!schema) return { valid: true };

  const validate = ajv.compile(schema);
  const valid = validate(data);

  return valid ? { valid } : { valid, errors: validate.errors };
}

const validate = (schema: TSchema | undefined) => (data: any) => {
  return validateSchema(schema, data);
};

function applyGuards(guards: TGuard[], ctx: any) {
  for (const guard of guards) {
    for (const schemaType of ["body", "query", "params"] as const) {
      const schema = guard.config?.[schemaType];
      const { valid, errors } = validate(schema)(ctx[schemaType]);
      if (!valid) {
        throw { message: "Validation Error", errors };
      }
    }
  }
}

export const mantouRouteValidation = () => {
  return {
    name: "mantou-route-validation-plugin",
    onRequest: {
      async beforeHandle(ctx, props) {
        let routeType = "routes" as "routes" | "page";
        let route = props.organs.getRouteByPath(ctx.path, ctx.request.method) as any;
        if (!route) {
          route = props.organs.getPageByPath(ctx.path);
          routeType = "page";
        }

        const middlewares = props.organs.getMiddlewaresByPath(ctx.path, ctx.request.method);

        for (const middleware of middlewares) {
          applyGuards(middleware.guards || [], ctx);
        }

        if(route?.guards) {
          applyGuards(route?.guards || [], ctx);
        }
      },
    },
  } as MantouPlugin;
};
