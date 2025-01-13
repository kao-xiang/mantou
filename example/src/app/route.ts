import { guard, handler } from 'mantou'

const auth = (roles: string[]) => guard(async () => {
  console.log('Auth guard: ', roles);
  return true
})

export const post = handler(() => {
  return `Hello World`
}, {

}, [
  auth(['buyer'])
]
)