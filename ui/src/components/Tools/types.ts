export type TransformerOptions = {
  name: string;
  func: string;
  signature: string;
  content: string;
  manual: boolean;
  params: {
    [key: string]: {
      name: string;
      type: string;
    };
  };
};
