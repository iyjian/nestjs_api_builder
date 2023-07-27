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
