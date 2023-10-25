<h2 style="text-align:center"><img src="./ui/src/assets/logo.png" height="128"><br>API Builder</h2>
<h4 style="text-align:center"><strong>nestjs api builder</strong></h4>



api_builder 是一个可以快速搭建后端框架的工具，可完成实体定义，及基础的CRUD接口，节省重复性工作，提高编写效率。

[TOC]

# 💾使用说明

打开两个窗口，分别运行以下代码，即可安装依赖，并跑通代码

```
pnpm run dev:api
pnpm run dev:ui
```

# 总文件结构

```markdown
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
|  |  |    ├─third
|  |  |    ├─frontcodegen
|  |  |    ├─enum
|  |  |    ├─coding
|  |  |    ├─codegen
|  |  |    ├─base
|  |  ├─core
|  |  |  ├─index.ts
|  |  |  ├─transforms
|  |  |  ├─services
|  |  |  ├─pipes
|  |  |  ├─interfaces
|  |  |  ├─interceptors
|  |  |  ├─guards
|  |  |  ├─filters
|  |  |  ├─entities
|  |  |  ├─decorators
|  |  ├─config
|  |  |   └configuration.ts
├─.vscode
|    ├─launch.json
|    ├─settings.json
|    └tasks.json
```

> 以上结构只输出前4层，详细树结构可点击[treer.md](treer.md)，其中.git | node_module | dist 目录文件，因内容过多，未做展示

# api 

## ⚙️相关配置

文件中含有[.env.sample](./api/.env.sample)，可做参考配置环境变量
其中GITLAB_DEFAULT_NAMESPACE_ID，需在[https://gitlab.com](https://gitlab.com)注册登陆后，创建Namespace，运行以下代码，调用脚本可得id

```
cd api

npx ts-node src/scripts/getAllNamespaces.ts
```

# ui

## 🖱️功能描述

### 菜单栏

#### [项目管理页面](http://127.0.0.1:5173/projects)
1. 列出所有项目信息(仓库id，仓库名称，项目名称，克隆地址)
2. 新增功能：填入仓库项目名称、项目名称，可在所配space中自动新建对应项目，由main分支中新建 dev 分支，创建 README 文件
3. 修改功能：可修改项目名称

#### [功能模块页面](http://127.0.0.1:5173/projectModules)
1. 选择对应项目后，才可进行其余功能
2. 列出该项目中的所有模块信息(编号，模块，简称，说明，创建时间)
3. 新增功能：填入模块、简介、说明，可新建模块文件
4. 搜索功能

#### [表管理页面](http://127.0.0.1:5173/entities)
1. 选择对应项目后，才可进行其余功能
2. 列出该项目中的所有表信息(编号，模块，表名，简称，下拉显示列，创建时间，修改时间)
3. 新增功能：选择模块，填入表名、表简称
	故需先新增模块，再新增表，否则无可选模块，则无法添加相应表
4. 搜索功能：支持该页面所列所有表信息的全局搜索
5. 编辑功能：
- 5.1 新增字段
在表中输入字段信息(字段，类型，描述，样例数据，必填，搜索)，即可新加字段
- 5.2 编辑字段
  点击设置icon即可进入高级配置，包含是否为关系字段，是则需设置关联表，默认值，下拉框展示，是否可查询、可创建、可更新，设置虚拟字段等。
  - 若字段设置关联表，该字段需以'Id'结尾，会自动生成相应信息(属性，关联表，关系，启用)；右侧代码框中选择'all'，根目录为root，可查看关系字段，并勾选对应关系(BelongsTo，HasMany)
- 5.3 字段排序
拖动每行最右侧锚点，即可更改排序
- 5.4 删除字段
点击删除标识，弹窗二次确认是否需删除该列，“确认删除”后即可完成操作
6. 生成ER图：可根据现有的实体及关系，显示所绘制的ER图及层数
7. 字段预览：以表格形式展示字段基本信息(序号，字段名，数据类型，示例数据，字段含义)，点击按钮，可将逗号分隔的字段增添到剪贴板
8. 字段导入：上传照片，可提取关键字词，自动填入新增字段
9. 设置索引：可选择字段，设置为唯一索引或普通索引
10. sql同步：根据对字段的修改，生成相应sql语言
11. 代码生成：勾选右上角文件形式(enty，dto/req，ctl，serv，mdu，schema)，可生成相应代码；快捷键('仅实体'，'全部')可一键选择生成 .entity.ts 和全部代码
12. 查看 diff：将生成代码与远程仓库所有代码对比，新增语句前缀为'+'，删除为'-'，可查看本次操作所更改的代码
13. 保存设置：点击'保存'，即可保存当前设置与代码
14. 在上方表格中输入分支，点击'提交'，即可将所生成代码上传至远程仓库的固定分支


#### [枚举值一览页面](http://127.0.0.1:5173/enumReport)
选择项目后，可罗列该项目所有枚举值及基本信息(一级类目，二级类目，类型代码，枚举值中文名，枚举值英文名，枚举值代码，系统值，状态)

#### [小工具页面](http://127.0.0.1:5173/tools)


#### [JSONViewer](http://127.0.0.1:5173/json)
引入 JSON 查看器，可查看 JSON 中各实体间关系架构，及复制黏贴、格式化、清空等基本操作

## 💣问题描述
☑️ 项目管理页面中，因不支持修改仓库名称，故需将仓库名称的修改功能禁用

🔲 功能模块页面中，搜索功能无效，应为包含所有信息的全局搜索，实现效果可参考表管理页面中的搜索功能

🔲 小工具功能待开发

## 📬邀请修改
1. 发现 bug：如果您发现任何问题，请提一个 issue 告诉我们
2. 修改代码：如果您是开发人员，想添加功能或修改代码，请安装以下说明进行
3. 建议： 如果您不想编写代码，但些很棒的想法和建议，请提一个 issue 描述您希望看到的更新与改进


#### 如果你发现了一些问题，并愿意为其提供修改，我们非常欢迎！请按照以下步骤进行：
1. fork 源代码到您的账号空间
2. 拉取项目，添加你的见解（修改代码或文档）
3. 提交修改并创建创一个 pr，详细描述你的修改和解决方法

> 我们会在最短的时间内审查您的 pr，并合并到源项目中，或给予反馈，感谢您的贡献！
