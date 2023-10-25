D:\code\nestjs_api_builder
├─backup
├─docker-compose.yml
├─format
├─package-lock.json
├─package.json
├─pnpm-lock.yaml
├─README.md
├─README_TEST.md
├─reload
├─.git // 该目录文件过多，不做展示
├─treer.md
├─ui 
| ├─ node_modules // 该目录文件过多，不做展示
| ├─.dockerignore
| ├─.env.development
| ├─.env.production
| ├─.prettierignore
| ├─Dockerfile
| ├─index.html
| ├─index.js
| ├─package.json
| ├─pnpm-lock.yaml
| ├─README.md
| ├─tsconfig.json
| ├─vite.config.ts
| ├─src
| |  ├─App.vue
| |  ├─main.ts
| |  ├─style.styl
| |  ├─vite-env.d.ts
| |  ├─views
| |  |   ├─AboutView.vue
| |  |   ├─HomeView.vue
| |  |   └JSONViewer.vue
| |  ├─types
| |  |   └index.ts
| |  ├─store
| |  |   ├─index.ts
| |  |   ├─projectTable.ts
| |  |   └tools.ts
| |  ├─router
| |  |   └index.ts
| |  ├─plugins
| |  |    ├─devtools.ts
| |  |    ├─index.ts
| |  |    ├─RequestBase.ts
| |  |    └tools.ts
| |  ├─libs
| |  |  ├─CodeUtil.ts
| |  |  └DataTypeUtil.ts
| |  ├─components
| |  |     ├─CodePreview.vue
| |  |     ├─ColumnSummary.vue
| |  |     ├─Entities.vue
| |  |     ├─EnumReport.vue
| |  |     ├─ERPreviewer.vue
| |  |     ├─IndexManager.vue
| |  |     ├─Login.vue
| |  |     ├─NavMenu.vue
| |  |     ├─NestCodeGen.vue
| |  |     ├─ParseImg.vue
| |  |     ├─ProjectModule.vue
| |  |     ├─Projects.vue
| |  |     ├─RelationTree.vue
| |  |     ├─SyncPreview.vue
| |  |     ├─Tools.vue
| |  |     ├─Tools
| |  |     |   └types.ts
| |  ├─assets
| |  |   └logo.png
| ├─quickStart
| |     ├─nginx
| |     |   ├─nginx.conf
| |     |   ├─site-enabled
| |     |   |      └default.conf
| ├─public
| |   ├─favicon.ico
| |   └vite.svg
├─api
|  ├─ node_modules // 该目录文件过多，不做展示
|  ├─ dist // 该目录文件过多，不做展示
|  ├─.dockerignore
|  ├─.env
|  ├─.env.sample
|  ├─.npmrc
|  ├─.prettierrc
|  ├─Dockerfile
|  ├─nest-cli.json
|  ├─package.json
|  ├─pnpm-lock.yaml
|  ├─README.md
|  ├─tsconfig.build.json
|  ├─tsconfig.json
|  ├─src
|  |  ├─app.module.ts
|  |  ├─main.ts
|  |  ├─templates
|  |  |     └crudTable.vue.txt
|  |  ├─scripts
|  |  |    ├─deleteProject.ts
|  |  |    ├─getAllNamespaces.ts
|  |  |    ├─getAllProjectFiles.ts
|  |  |    ├─getAllProjects.ts
|  |  |    ├─loadEntityMembers.ts
|  |  |    ├─loadMissingRelation.ts
|  |  |    ├─logRoutes.ts
|  |  |    ├─moveTable.ts
|  |  |    ├─seed.ts
|  |  |    └setupSwagger.ts
|  |  ├─features
|  |  |    ├─tool
|  |  |    |  ├─cache.service.ts
|  |  |    |  ├─data.type.service.spec.ts
|  |  |    |  ├─data.type.service.ts
|  |  |    |  ├─README.md
|  |  |    |  ├─tool.controller.ts
|  |  |    |  ├─tool.module.ts
|  |  |    |  ├─transformer.service.ts
|  |  |    |  ├─types.ts
|  |  |    |  ├─services
|  |  |    |  |    └tool.service.ts
|  |  |    |  ├─config
|  |  |    |  |   ├─OpenSans-Regular.ttf
|  |  |    |  |   └transformers.ts
|  |  |    ├─third
|  |  |    |   ├─aliyun.api.service.spec.ts
|  |  |    |   ├─aliyun.api.service.ts
|  |  |    |   ├─openai.service.spec.ts
|  |  |    |   ├─openai.service.ts
|  |  |    |   ├─openapi.controller.ts
|  |  |    |   ├─third.controller.ts
|  |  |    |   ├─third.module.ts
|  |  |    |   ├─testData
|  |  |    |   |    ├─tableImg.base64
|  |  |    |   |    ├─tableImg2.base64
|  |  |    |   |    └tableReco.ts
|  |  |    |   ├─services
|  |  |    |   |    └qianfan.service.ts
|  |  |    |   ├─controllers
|  |  |    |   |      └qianfan.controller.ts
|  |  |    ├─frontcodegen
|  |  |    |      ├─frontcodegen.controller.ts
|  |  |    |      ├─frontcodegen.module.ts
|  |  |    |      ├─frontcodegen.service.spec.ts
|  |  |    |      ├─frontcodegen.service.ts
|  |  |    |      └template.service.ts
|  |  |    ├─enum
|  |  |    |  ├─enum.constants.ts
|  |  |    |  ├─enum.controller.ts
|  |  |    |  ├─enum.module.ts
|  |  |    |  ├─enum.service.ts
|  |  |    |  ├─index.ts
|  |  |    |  ├─entities
|  |  |    |  |    └enum.entity.ts
|  |  |    |  ├─dto
|  |  |    |  |  └index.ts
|  |  |    ├─coding
|  |  |    |   ├─coding.module.ts
|  |  |    |   ├─coding.service.spec.ts
|  |  |    |   ├─coding.service.ts
|  |  |    |   ├─gitlab.project.service.spec.ts
|  |  |    |   ├─gitlab.project.service.ts
|  |  |    |   ├─gitlab.service.spec.ts
|  |  |    |   ├─gitlab.service.ts
|  |  |    |   ├─index.ts
|  |  |    |   ├─dto
|  |  |    |   |  ├─coding.dto.ts
|  |  |    |   |  ├─gitlab.dto.ts
|  |  |    |   |  └index.ts
|  |  |    |   ├─controllers
|  |  |    |   |      ├─coding.controller.ts
|  |  |    |   |      └gitlab.controller.ts
|  |  |    ├─codegen
|  |  |    |    ├─codegen.module.ts
|  |  |    |    ├─types
|  |  |    |    |   └index.ts
|  |  |    |    ├─services
|  |  |    |    |    ├─codegen.controller.service.spec.ts
|  |  |    |    |    ├─codegen.controller.service.ts
|  |  |    |    |    ├─codegen.entity.service.spec.ts
|  |  |    |    |    ├─codegen.entity.service.ts
|  |  |    |    |    ├─codegen.module.service.ts
|  |  |    |    |    ├─codegen.response.service.spec.ts
|  |  |    |    |    ├─codegen.response.service.ts
|  |  |    |    |    ├─codegen.service.service.spec.ts
|  |  |    |    |    ├─codegen.service.service.ts
|  |  |    |    |    ├─codegen.service.ts
|  |  |    |    |    ├─codegen.util.service.spec.ts
|  |  |    |    |    ├─codegen.util.service.ts
|  |  |    |    |    ├─datatype.reduction.service.spec.ts
|  |  |    |    |    ├─datatype.reduction.service.ts
|  |  |    |    |    ├─db.sync.service.spec.ts
|  |  |    |    |    ├─db.sync.service.ts
|  |  |    |    |    ├─er.service.ts
|  |  |    |    |    ├─module.decorator.spec.ts
|  |  |    |    |    ├─rule.csv
|  |  |    |    |    ├─test.csv
|  |  |    |    |    ├─train.csv
|  |  |    |    |    ├─tsmorph.service.spec.ts
|  |  |    |    |    └tsmorph.service.ts
|  |  |    |    ├─dto
|  |  |    |    |  ├─codegen.request.dto.ts
|  |  |    |    |  └index.ts
|  |  |    |    ├─controllers
|  |  |    |    |      ├─codegen.controller.ts
|  |  |    |    |      ├─datatype.reduction.controller.ts
|  |  |    |    |      ├─db.sync.controller.ts
|  |  |    |    |      └er.controller.ts
|  |  |    ├─base
|  |  |    |  ├─base.module.ts
|  |  |    |  ├─index.ts
|  |  |    |  ├─services
|  |  |    |  |    ├─front.project.service.ts
|  |  |    |  |    ├─index.ts
|  |  |    |  |    ├─log.service.ts
|  |  |    |  |    ├─meta.column.service.ts
|  |  |    |  |    ├─meta.data.type.service.ts
|  |  |    |  |    ├─meta.project.service.ts
|  |  |    |  |    ├─meta.table.service.ts
|  |  |    |  |    ├─project.module.service.ts
|  |  |    |  |    └route.service.ts
|  |  |    |  ├─entities
|  |  |    |  |    ├─front.project.entity.ts
|  |  |    |  |    ├─index.ts
|  |  |    |  |    ├─log.entity.ts
|  |  |    |  |    ├─meta.column.entity.ts
|  |  |    |  |    ├─meta.data.type.entity.ts
|  |  |    |  |    ├─meta.project.entity.ts
|  |  |    |  |    ├─meta.table.entity.ts
|  |  |    |  |    ├─project.module.entity.ts
|  |  |    |  |    └route.entity.ts
|  |  |    |  ├─dto
|  |  |    |  |  ├─front.project.request.dto.ts
|  |  |    |  |  ├─i18n.request.dto.ts
|  |  |    |  |  ├─index.ts
|  |  |    |  |  ├─log.request.dto.ts
|  |  |    |  |  ├─meta.column.request.dto.ts
|  |  |    |  |  ├─meta.data.type.request.dto.ts
|  |  |    |  |  ├─meta.project.request.dto.ts
|  |  |    |  |  ├─meta.project.response.schema.ts
|  |  |    |  |  ├─meta.table.request.dto.ts
|  |  |    |  |  ├─project.module.request.dto.ts
|  |  |    |  |  └route.request.dto.ts
|  |  |    |  ├─controllers
|  |  |    |  |      ├─front.project.controller.ts
|  |  |    |  |      ├─index.ts
|  |  |    |  |      ├─log.controller.ts
|  |  |    |  |      ├─meta.column.controller.ts
|  |  |    |  |      ├─meta.data.type.controller.ts
|  |  |    |  |      ├─meta.project.controller.ts
|  |  |    |  |      ├─meta.table.controller.ts
|  |  |    |  |      ├─project.module.controller.ts
|  |  |    |  |      ├─route.controller.ts
|  |  |    |  |      └swagger.controller.ts
|  |  ├─core
|  |  |  ├─index.ts
|  |  |  ├─transforms
|  |  |  |     └index.ts
|  |  |  ├─services
|  |  |  |    ├─base.service.ts
|  |  |  |    └index.ts
|  |  |  ├─pipes
|  |  |  |   ├─index.ts
|  |  |  |   └validation.pipe.ts
|  |  |  ├─interfaces
|  |  |  |     ├─CodeType.ts
|  |  |  |     ├─index.ts
|  |  |  |     ├─requestDto.ts
|  |  |  |     └response.dto.ts
|  |  |  ├─interceptors
|  |  |  |      ├─index.ts
|  |  |  |      ├─logging.interceptor.ts
|  |  |  |      └transform.interceptor.ts
|  |  |  ├─guards
|  |  |  |   ├─api.guard.ts
|  |  |  |   └index.ts
|  |  |  ├─filters
|  |  |  |    ├─exception.interceptor.ts
|  |  |  |    └index.ts
|  |  |  ├─entities
|  |  |  |    ├─base.entity.ts
|  |  |  |    └index.ts
|  |  |  ├─decorators
|  |  |  |     ├─codegen.decorator.ts
|  |  |  |     ├─index.ts
|  |  |  |     └req.decorator.ts
|  |  ├─config
|  |  |   └configuration.ts
├─.vscode
|    ├─launch.json
|    ├─settings.json
|    └tasks.json