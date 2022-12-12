import { Schema } from "../types";
import { comment, getNodeType, formatKey } from "./utils";

export function transformRef(ref: string): string {
  const parts = ref.replace(/^#\//, "").split("/");
  return `${parts[0]}["${parts.slice(1).join('"]["')}"]`;
}

export const tsIntersectionOf = (types: string[]): string => {
  return `(${types.join(") & (")})`;
};

export const tsArrayOf = (type: string): string => {
  return `${type}[]`;
};

export const transform = (
  node: Schema,
  type = "",
  hasToApi = false
): string => {
  if (type === "response") {
    console.log("---");
  }
  switch (getNodeType(node)) {
    case "ref": {
      return formatKey(node.$ref);
      // return transformRef(node.$ref);
    }
    case "string":
    case "number":
    case "boolean": {
      return getNodeType(node) || "any";
    }
    case "enum": {
      return (node.enum as string[])
        .map((item) =>
          typeof item === "number" || typeof item === "boolean"
            ? item
            : `'${item}'`
        )
        .join(" | ");
    }
    case "object": {
      if (
        (!node.properties || !Object.keys(node.properties).length) &&
        !node.allOf &&
        !node.additionalProperties
      ) {
        return `{ [key: string]: any }`;
      }

      let properties = "";
      let valueToApiStr = "";
      if (node.properties && Object.keys(node.properties).length) {
        properties = createKeys(node.properties || {}, node.required, type);
        if (hasToApi) {
          valueToApiStr = createValueFromApiKeys(
            node.properties || {},
            node.required
          );
        }
      }

      // if additional properties, add to end of properties
      if (node.additionalProperties) {
        properties += `[key: string]: ${
          getNodeType(node.additionalProperties) || "any"
        };\n`;
      }

      return `{ ${properties} \n ${valueToApiStr}}`;
      // return tsIntersectionOf([
      //   ...(node.allOf ? (node.allOf as any[]).map(transform) : []), // append allOf first
      //   ...(properties ? [`{ ${properties} }`] : []), // then properties + additionalProperties
      // ]);
    }
    case "array": {
      return tsArrayOf(transform(node.items as any));
    }
  }

  return "";
};

export const createValueFromApiKeys = (
  obj: { [key: string]: any },
  required: string[] = []
): string => {
  let output = "valueFromApi(apiData: any): void {";

  Object.entries(obj).forEach(([key, value]) => {
    // 1. name (with “?” if optional property)
    output += `this.${key} = apiData.${key};`;
  });
  output += "}\n";

  return output;
};

export const createKeys = (
  obj: { [key: string]: any },
  required: string[] = [],
  type = ""
): string => {
  let output = "";

  Object.entries(obj).forEach(([key, value]) => {
    // 1. JSDoc comment (goes above property)
    if (value.description) {
      output += comment(value.description);
    }

    // 2. name (with “?” if optional property)
    output += `"${key}"${!required || !required.includes(key) ? "?" : ""}: `;

    // 3. get value
    output += transform(value);

    if (type === "params") {
      // const valType = getNodeType(value) || 'any'
      // const defaultValue = getValueTypeDefult(valType)
      const defaultValue = getValueTypeDefultByKey(key, value.type);
      console.log(key, value.type, defaultValue);
      if (defaultValue) {
        output += ` = ${defaultValue}`;
      }
    }
    // 4. close type
    output += ";\n";
  });

  return output;
};

/**
 * 根据字段名或类型获取默认值
 * @param key    字段名
 * @param valueType   字段类型
 * @returns
 */
function getValueTypeDefultByKey(key: string, valueType: string) {
  let value: any = `""`;
  switch (key) {
    case "pageNum":
      value = `1`;
      break;
    case "pageSize":
      value = "10";
      break;
    default:
      value = getValueTypeDefult(valueType);
      break;
  }
  return value;
}

/**
 * 根据类型获取默认值
 * @param type  字段类型
 * @returns
 */
function getValueTypeDefult(type: any) {
  let value: any = `""`;
  switch (type) {
    case "string":
      value = `""`;
      break;
    case "number":
      value = "0";
      break;
    case "boolean":
      value = "false";
      break;
    case "array":
      value = "[]";
      break;
    case "object":
      value = "{}";
      break;
    default:
      break;
  }
  return value;
}

export const createInterface = (obj: { [key: string]: any }, type = "") => {
  let output = "";
  Object.entries(obj).forEach(([key, value]) => {
    if (value.description) {
      output += comment(value.description);
    }

    // const name = getDefinitionKey(key);

    if (type === "response" && key.includes("«")) {
      output += `export class ${formatKey(
        key
      )} implements HttpResponseData  ${transform(value, type, true)};\n`;
    } else {
      output += `export class ${formatKey(key)}  ${transform(value, type)};\n`;
    }
  });

  return output;
};
