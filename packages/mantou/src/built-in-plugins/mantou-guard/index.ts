import type { TGuard } from "@/routes";
import type { MantouPlugin } from "@/exports/types";

async function applyGuards(guards: TGuard[], ctx: any) {
  for (const guard of guards) {
    const res = await guard.handler(ctx).catch((e: any) => {
      console.error(e);
    });
    if(res){
      return res
    }
  }
}

export const mantouGuard = () => {
  return {
    name: "mantou-guard-plugin",
    onRequest: {
      async beforeHandle(ctx, props) {
        let routeType = "routes" as "routes" | "page";
        let route = props.organs.getRouteByPath(
          ctx.path,
          ctx.request.method
        ) as any;
        if (!route) {
          route = props.organs.getPageByPath(ctx.path);
          routeType = "page";
        }

        const middlewares = props.organs.getMiddlewaresByPath(
          ctx.path,
          ctx.request.method
        );

        for (const middleware of middlewares) {
          const guardRes = await applyGuards(middleware.guards || [], ctx);
          if(guardRes){
            return guardRes
          }
        }
        if (route?.guards) {
          const guardRes = await applyGuards(route?.guards || [], ctx);
          if(guardRes){
            return guardRes
          }
        }
      },
    },
  } as MantouPlugin;
};
