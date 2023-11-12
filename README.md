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


## TODO

[-] DTO中增加@Expose()装饰器 然后再使用 excludeExtraneousValues 选项即可避免传入无效的参数(项目模板中也需要改进)
```javascript
const object = plainToClass(metatype, value, { excludeExtraneousValues: true, exposeUnsetFields: false })
```

[-] 完整性检查1 - 所有关系字段都应该有关联字段id  不能引用已经删除的表
```sql
select s.tableId, 
       s.id               as columnId,
       p.name             as projectName,
       t.name             as tableName,
       s.name             as columnName,
       d.dataType         as dataType,
       s.relation         as relation,
       s.relationColumnId as relationColumnId,
       s.comment          as comment,
       s.refTableId       as refTableId,
       u.name             as refTableName,
       s.deleted          as deleted
from t_meta_column     s
join t_meta_data_type  d on s.dataTypeId = d.id
join t_meta_table      t on s.tableId = t.id
left join t_meta_table u on s.refTableId = u.id
join t_meta_project    p on t.projectId = p.id
where s.relation is not null and 
      s.relationColumnId is null;
```

[-] relationTree中对于已展开的节点需要实现重新加载，因为可能下级会有新增的关系节点，比如新增了外键。

[-] 删除字段后没有无法手动保存(没有调接口)
其实调用了，是删除的时候调用了，但是没有刷新代码预览

[-] 可以针对应用场景建立DTO

[-] 字段类型预测
https://blog.csdn.net/stay_foolish12/article/details/123655750
docker pull paddlecloud/paddlenlp:develop-cpu-latest

## 已经解决
[x] 实体定义中如果有自依赖，在import的时候会把自己这个class也import进来（需要剔除）。  
[x] 先新建一个字段叫column, 待字段保存后, 再把这个字段改为columnId, 并设置为外键, 由于外键会自动新建一个叫column的字段，所以此时会报重复。  
[x] hasMany的生成需要加as? 如果 A表中2个字段依赖B表，则B表应该有两个hasMany  
[x] page和pageSize需要设置默认值,否则在接口调用的时候不方便  
[x] controller里的方法名字需要加上实体名，否则如果有需要把controller合并的时候会名字冲突(注意这里是controller) (不应该有这个合并controller的场景)  
[x] service中需要加一个findOne的方法，不仅仅是findById  
[x] 前端需要增加 无需创建 选项，因为有些字段是内部字段，通过内部逻辑创建的，无需通过接口传入。  
[x] dataType迁移，需要用dataTypeId 而不是文字  
[x] removeTable removeColumn需要做依赖检测  因为字段上有metaColumn.refTableId会有关联表  
[x] 软删除表的时候也需要软删除字段(现在是不允许删除有依赖关系的表以及字段)  

通过加可查询/可创建/可搜索/可更新来解决

## 前端代码发布
./releasefront

## 后端项目重新加载
./reload
## 初始化数据

```sql
drop table t_meta_column;
drop table t_meta_table;
drop table t_meta_project;

insert into t_meta_project (name, repo, createdAt, updatedAt)
values('商船系统', 'git@e.coding.net:chenawy/fleet/fleet-mangement-api.git', now(), now());

-- 全量新增表信息

insert into bgdevtool.t_meta_table (name, projectId, createdAt, updatedAt, module)
select distinct 
       table_name as table_name, 
       1          as projectId, 
       now()      as createdAt, 
       now()      as updatedAt, 
       '***'      as module
from information_schema.columns 
where table_schema = 'fleet_wc' and table_name <> 'deleteme' and column_name not in ('syncKey', 'createdAt', 'updatedAt', 'deleted');

insert into t_meta_column (tableId, name, `comment`, dataType, refTableName, createdAt, updatedAt)      
with reference_table as (
      select table_name,
              column_name,
              referenced_table_name 
      from information_schema.KEY_COLUMN_USAGE 
      where referenced_table_name is not null and 
            table_schema = 'fleet_wc'
)
select  t.id                      as tableId,
        s.column_name, 
        s.column_comment,
        s.column_type, 
        u.referenced_table_name,              
        now(),
        now()
from information_schema.columns s
join t_meta_table               t on s.table_name = t.name
left join reference_table       u on s.table_name = u.table_name and 
                                     s.column_name = u.column_name
where s.table_schema = 'fleet_wc' and 
      s.table_name <> 'deleteme' and 
      s.column_name not in ('syncKey', 'createdAt', 'updatedAt', 'deleted', 'id')
order by length(column_type) desc;
```


## bgdevtools中缺少的表

```sql
  select s.table_name, 
        s.table_comment
  from information_schema.tables s
  left join t_meta_table         t on s.table_name = t.name and t.projectId = 1
  where s.table_schema = 'fleet_wc2' and t.id is null;
```

## bgdevtools中多的表

```sql
  select s.*
  from      t_meta_table              s
  left join information_schema.tables t on s.name = t.table_name and t.table_schema = 'fleet_wc2'
  where s.projectId = 1 and 
        s.deleted = 0 and 
        t.table_name is null;
```

## 数据库中实际的列（应该是最准的）

```sql
drop database if exists fleet_wc2;
create database fleet_wc2 character set 'utf8mb4';

drop table if exists tmp_t_meta_table;

create temporary table tmp_t_meta_table as
with reference_table as (
  select table_name                         as table_name,
          column_name                       as column_name,
          referenced_table_name             as referenced_table_name
  from information_schema.KEY_COLUMN_USAGE 
  where referenced_table_name is not null and 
        table_schema = 'fleet_wc'
)
select  t.id                            as tableId,
        s.column_name                   as name,
        case when s.IS_NULLABLE = 'YES' 
             then 1 
             else 0 
        end                             as allowNull,
        s.column_comment                as comment,
        case when s.column_type = 'tinyint(1)'
             then 'boolean'
             when s.column_type = 'int(11)'
             then 'int'
             else s.column_type
        end                             as dataType, 
        v.id                            as refTableId,             
        now()                           as createdAt,
        now()                           as updatedAt
from information_schema.columns  s
join bgdevtool.t_meta_table      t on s.table_name = t.name
left join reference_table        u on s.table_name = u.table_name and 
                                      s.column_name = u.column_name
left join bgdevtool.t_meta_table v on u.referenced_table_name = v.name and
                                      v.projectId = 1
where s.table_schema = 'fleet_wc' and 
      s.table_name <> 'deleteme' and 
      s.column_name not in ('syncKey', 'createdAt', 'updatedAt', 'deleted', 'id')
      -- and s.table_name in ('t_equipment_component', 't_ship_equipment', 't_equipment_spareparts')
order by length(column_type) desc;

-- 插入字段信息
insert into t_meta_column (tableId, name, allowNull, `comment`, dataType, refTableId, createdAt, updatedAt, isAutoGen,isEnable,`order`)      
select *,0,1,1 from tmp_t_meta_table;
```

# codemirror merge view
https://renncheung.github.io/codemirror-editor-vue3/merge/index.html
