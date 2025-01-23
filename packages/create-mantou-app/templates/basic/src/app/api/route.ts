import { guard, handler, t, type Store } from 'mantou'

const auth = (roles: string[]) => guard(async () => {
  console.log('Auth guard: ', roles);
  return true
})

export const post = handler((ctx) => {
  return `Hello World`
}, {
 body: t.Object({
    name: t.String()
 })
}, [
  auth(['buyer'])
]
)