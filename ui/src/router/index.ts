import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import NestCodeGen from "../components/NestCodeGen.vue";
import Tools from "../components/Tools.vue";
import Projects from "./../components/Projects.vue";
import Entities from "./../components/Entities.vue";
import Login from "./../components/Login.vue";
import ProjectModule from "./../components/ProjectModule.vue";
import Home from "./../views/HomeView.vue";
import { AuthenticationClient } from "authing-js-sdk";
import JOSNViewer from "./../views/JSONViewer.vue";
import EnumReport from "./../components/EnumReport.vue";
import { projectTableStore } from "@/store/projectTable";

const authClient = new AuthenticationClient({
  appId: "62315258ab0a42505a0d6bb8",
});

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    component: Home,
    children: [
      {
        path: "/projects",
        name: "Projects",
        component: Projects,
        meta: {
          displayName: "项目管理",
        },
      },
      {
        path: "/entities",
        name: "Entities",
        component: Entities,
        meta: {
          displayName: "表管理",
        },
      },
      {
        path: "/projectModules",
        name: "ProjectModule",
        component: ProjectModule,
        meta: {
          displayName: "项目模块",
        },
      },
      {
        path: "/enumReport",
        name: "EnumReport",
        component: EnumReport,
        meta: {
          displayName: "枚举值一览",
        },
      },
      {
        path: "/nestCodeGen",
        name: "nestCodeGen",
        component: NestCodeGen,
        meta: {
          menuIgnore: true,
        },
      },
      {
        path: "/tools",
        name: "Transformer",
        component: Tools,
        meta: {
          displayName: "小工具",
        },
      },
      {
        path: "/json",
        name: "JSONViewer",
        component: JOSNViewer,
        meta: {
          displayName: "JSONViewer",
        },
      },
    ],
    meta: {
      menuIgnore: true,
    },
  },
  {
    path: "/login",
    name: "Login",
    meta: {
      menuIgnore: true,
    },
    component: Login,
  },
  {
    path: "/:catchAll(.*)",
    redirect: {
      name: "login",
      replace: true,
    },
    meta: {
      menuIgnore: true,
    },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  console.log(`router/index - beforeEach - from: ${from?.path} to.path: ${to?.path}`);
  if (to.path !== "/login" && to.path !== "/") {
    const user = await authClient.getCurrentUser();
    if (user?.token) {
      const { status } = await authClient.checkLoginStatus(user.token);
      if (status) {
        const store = projectTableStore();
        await store.initAsync();
        next();
      } else {
        router.push("/login");
      }
    } else {
      router.push("/login");
    }
  } else {
    next();
  }
});

export default router;
