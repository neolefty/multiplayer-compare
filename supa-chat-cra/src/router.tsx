// see https://tanstack.com/router/v1/docs/guide/route-configs — especially for nested routes
import { createReactRouter, createRouteConfig } from "@tanstack/react-router"
import React from "react"
import { PageFrame } from "./PageFrame"
import ProfilePage from "./pages/ProfilePage"

const rootRoute = createRouteConfig({
    component: PageFrame,
})
const indexRoute = rootRoute.createRoute({ path: "/", component: () => <div>Index</div> })
const profileRoute = rootRoute.createRoute({ path: "profile", component: ProfilePage })
const routeConfig = rootRoute.addChildren([indexRoute, profileRoute])

const router = createReactRouter({ routeConfig })

export default router
