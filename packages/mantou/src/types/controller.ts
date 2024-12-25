export class Controller {
  get?: (ctx: any) => Promise<any>
  post?: (ctx: any) => Promise<any>
  put?: (ctx: any) => Promise<any>
  patch?: (ctx: any) => Promise<any>
  delete?: (ctx: any) => Promise<any>
}