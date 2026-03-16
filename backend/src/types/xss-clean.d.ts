declare module 'xss-clean' {
  import { RequestHandler } from 'express'

  interface XssCleanOptions {
    allowedTags?: string[]
    allowedAttrs?: string[]
    allowedSchemes?: string[]
  }

  function xss(options?: XssCleanOptions): RequestHandler

  export = xss
}

