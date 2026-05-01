import { createRootRoute, createRoute, createRouter, Outlet, redirect } from '@tanstack/react-router'
import App from './App'
import { UtilitiesLayout } from './components/utilities/UtilitiesLayout'
import { JsonTool } from './components/utilities/JsonTool/JsonTool'
import { JwtDecoder } from './components/utilities/JwtDecoder/JwtDecoder'
import { Base64Tool } from './components/utilities/Base64Tool/Base64Tool'
import { EpochConverter } from './components/utilities/EpochConverter/EpochConverter'
import { RegexTester } from './components/utilities/RegexTester/RegexTester'
import { DiffTool } from './components/utilities/DiffTool/DiffTool'
import { UrlTool } from './components/utilities/UrlTool/UrlTool'
import { HashGenerator } from './components/utilities/HashGenerator/HashGenerator'

const rootRoute = createRootRoute({ component: () => <Outlet /> })

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: App,
})

const utilitiesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/utilities',
  component: UtilitiesLayout,
})

const utilitiesIndexRoute = createRoute({
  getParentRoute: () => utilitiesRoute,
  path: '/',
  beforeLoad: () => { throw redirect({ to: '/utilities/json' }) },
})

const jsonRoute = createRoute({
  getParentRoute: () => utilitiesRoute,
  path: '/json',
  component: JsonTool,
})

const jwtRoute = createRoute({
  getParentRoute: () => utilitiesRoute,
  path: '/jwt',
  component: JwtDecoder,
})

const base64Route = createRoute({
  getParentRoute: () => utilitiesRoute,
  path: '/base64',
  component: Base64Tool,
})

const epochRoute = createRoute({
  getParentRoute: () => utilitiesRoute,
  path: '/epoch',
  component: EpochConverter,
})

const regexRoute = createRoute({
  getParentRoute: () => utilitiesRoute,
  path: '/regex',
  component: RegexTester,
})

const diffRoute = createRoute({
  getParentRoute: () => utilitiesRoute,
  path: '/diff',
  component: DiffTool,
})

const urlRoute = createRoute({
  getParentRoute: () => utilitiesRoute,
  path: '/url',
  component: UrlTool,
})

const hashRoute = createRoute({
  getParentRoute: () => utilitiesRoute,
  path: '/hash',
  component: HashGenerator,
})

const routeTree = rootRoute.addChildren([
  dashboardRoute,
  utilitiesRoute.addChildren([
    utilitiesIndexRoute,
    jsonRoute,
    jwtRoute,
    base64Route,
    epochRoute,
    regexRoute,
    diffRoute,
    urlRoute,
    hashRoute,
  ]),
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
