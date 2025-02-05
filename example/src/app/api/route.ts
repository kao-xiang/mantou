import { handler, o } from "mantou/routes";

export const get = handler((ctx) => {
  return `Hello, ${ctx.query.name}`
}, {
  query: o.Object({
    name: o.String()
  })
})