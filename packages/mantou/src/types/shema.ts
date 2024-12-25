export type BaseSchema = {
    type: string
    _input: any
    _output: any
  }
  
export type SchemaType<T extends BaseSchema> = T["_output"]
  
  type StringSchema = BaseSchema & {
    type: "string"
    _input: string
    _output: string
  }
  
  type NumberSchema = BaseSchema & {
    type: "number"
    _input: number
    _output: number
  }
  
  type BooleanSchema = BaseSchema & {
    type: "boolean"
    _input: boolean
    _output: boolean
  }
  
  type ObjectSchema<T extends { [K in keyof T]: BaseSchema }> = BaseSchema & {
    type: "object"
    shape: { [K in keyof T]: T[K] }
    _input: { [K in keyof T]: SchemaType<T[K]> }
    _output: { [K in keyof T]: SchemaType<T[K]> }
  }
  
export const t = {
  String: (): StringSchema => ({ 
    type: "string",
    _input: "" as string,
    _output: "" as string
  }),
  
  Number: (): NumberSchema => ({
    type: "number",
    _input: 0 as number,
    _output: 0 as number
  }),
  
  Boolean: (): BooleanSchema => ({
    type: "boolean",
    _input: false as boolean,
    _output: false as boolean
  }),
  
  Object: <T extends { [K in keyof T]: BaseSchema }>(shape: T): ObjectSchema<T> => ({
    type: "object",
    shape,
    _input: {} as { [K in keyof T]: SchemaType<T[K]> },
    _output: {} as { [K in keyof T]: SchemaType<T[K]> }
  })
}

export type InferType<T extends BaseSchema> = T["_output"]
export type InferBody<T> = T extends { body: infer B extends BaseSchema } ? InferType<B> : unknown
export type InferQuery<T> = T extends { query: infer Q extends BaseSchema } ? InferType<Q> : unknown
export type InferParams<T> = T extends { params: infer P extends BaseSchema } ? InferType<P> : unknown