export type FrontendEnv = { backendURL: URL; nextEdgeFunctionURL: URL }
export const FrontendEnv: FrontendEnv = {
  backendURL: new URL('http://localhost:3000'),
  nextEdgeFunctionURL: new URL('http://localhost:3000/api'),
}
