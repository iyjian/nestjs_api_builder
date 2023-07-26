export type Column = {
  id?: number;
  name: string;
  defaultValue?: string;
  enumKeys?: string;
  comment?: string;
  dataType?: DataType;
  dataTypeId: number;
  allowNull: boolean;
  refTableId?: number | null;
  refTable?: TableSimple;
  relation?: string | null;
  isEnable?: boolean;
  order: number;
  isFK?: boolean;
  searchable?: boolean;
  findable?: boolean;
  createable?: boolean;
  updateable?: boolean;
  relationColumnId?: number | null;
  updatedAt?: string;
  createdAt?: string;
  listShow?: boolean;
  getCode: string;
  setCode: string;
  enumTypeCode: string;
  remark: string;
  sampleData: string;
  relationColumn?: Column;
  forSelectDisplay?: boolean;
};

export type DataType = {
  id: number;
  dataType: string;
};

export type Project = {
  id: string;
  name: string;
  repo: string;
  repoId: string;
  version?: number;
};

export type Table = {
  id: number;
  name: string;
  module: string;
  comment: string;
  project: Project;
  columns: Column[];
  relationNodes?: RelationNode[];
  relationNodesForOne?: RelationNode[];
};

export type TableSimple = {
  id: number;
  name: string;
  module: string;
  comment: string;
  projectId: string;
};

export type CodeType =
  | "enty"
  | "dto/req"
  | "ctl"
  | "serv"
  | "mdu"
  | "dto/idx"
  | "enty/idx"
  | "ctl/idx"
  | "serv/idx"
  | "mdu/idx";

export type Code = {
  content: string;
  originContent: string;
  /**
   * label不是必须的，只有生成出的代码是有label的
   * 从代码库中查询到的code没有label
   */
  label: CodeType;
  isExist: boolean;
  path: string;
  name?: string;
  codeMirrorOptions?: object;
  showContent?: string;
  type?: string;
};

export type columnAttribute = {
  listShow?: boolean;
  updateShow?: boolean;
  detailShow?: boolean;
  sortable?: boolean;
  searchable?: boolean;
  findable?: boolean;
};

export type RelationNode = {
  label: string;
  tableId: number;
  attributes?: { [key: string]: columnAttribute };
  include: RelationNode[];
  level: number;
  parentNodeId: string;
  leaf: boolean;
  nodeId: string;
  isChecked: boolean;
  required?: boolean;
  as?: string;
  model?: string;
};

export type RelationOutputNode = {
  model: string;
  as: string;
  required: boolean;
  include?: RelationOutputNode[];
  isChecked?: boolean;
};

export type GitInfo = {
  sourceBranch: string;
  // targetBranch: string;
  comment: string;
  mergeRequestUrl: string;
  codes: Code[];
};

export type NestCodeGenState = {
  isTriggerCodePreviewThrottleCalling: boolean;
  tableSaving: boolean;
  codePreviewing: boolean;
  ERPreviewer: boolean;
  previewTimer?: ReturnType<typeof setTimeout>;
  skipNextSaving: boolean;
  selectedCodeTypes: string[];
  currentPreviewMode: string;
  columnSettingDialogVisible: boolean;
};
