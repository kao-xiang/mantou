import type { Guard } from "@/routes";
import type { MantouPlugin } from "@/types";

async function applyGuards(guards: Guard[], ctx: any) {
  for (const guard of guards) {
    await guard.handler(ctx);
  }
}

export const mantouGuard = () => {
  return {
    name: "mantou-guard-plugin",
    onRequest: {
      async beforeHandle(ctx, props) {
        let routeType = "routes" as "routes" | "page";
        let route = props.organs.getRouteByPath(ctx.path) as any;
        if (!route) {
          route = props.organs.getPageByPath(ctx.path);
          routeType = "page";
        }

        const middlewares = props.organs.getMiddlewaresByPath(
          ctx.path,
          routeType
        );

        for (const middleware of middlewares) {
          applyGuards(middleware.guards || [], ctx);
        }

        applyGuards(route.guards || [], ctx);
      },
    },
  } as MantouPlugin;
};
