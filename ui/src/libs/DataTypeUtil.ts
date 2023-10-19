function isJson(str: string) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}

export function getDataType(str: string) {
  if (isJson(str)) {
    return "jsonStr";
  } else {
    return "str";
  }
}

export function formatStr(str: string, dataType: string) {
  if (dataType === "jsonStr") {
    return JSON.parse(str);
  } else {
    return str;
  }
}
