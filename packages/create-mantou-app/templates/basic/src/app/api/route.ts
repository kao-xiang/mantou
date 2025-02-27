import { guard, handler, o } from 'mantou'

const auth = (roles: string[]) => guard(async () => {
  console.log('Auth guard: ', roles);
  return true
})

export const post = handler((ctx) => {
  return `Hello World`
}, {
 body: o.Object({
    name: o.String()
 })
}, [
  auth(['buyer'])
]
)