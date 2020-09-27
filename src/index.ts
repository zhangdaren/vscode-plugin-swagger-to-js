import * as vscode from "vscode";
import { fetchSwaggerJson } from "./package/fetch";
import { generateTypes } from "./package";
import * as clipboardy from "clipboardy";
import { Method } from "./types";
import { Selection } from "vscode";

const langList = [
  "typescript",
  "javascript",
  "typescriptreact",
  "javascriptreact",
];
const outputMessage =
  "Please select swagger-url or TypeScript or JavaScript function signature";

export const generate = async (method: Method) => {
  const lang = vscode.window.activeTextEditor?.document.languageId || "";
  if (!langList.includes(lang)) {
    vscode.window.showInformationMessage("Only support ts or js");
    return;
  }

  const selection = vscode.window.activeTextEditor?.selection as Selection;
  const startLine = selection.start.line - 1;
  const selectedText = vscode.window.activeTextEditor?.document.getText(
    selection
  ) as string;

  if (selectedText.length === 0) {
    vscode.window.showInformationMessage(outputMessage);
    return;
  }

  try {
    const jsonSchema = await fetchSwaggerJson();
    const result = generateTypes(jsonSchema, "/buffett-flow/interim", method);
    console.log(result);
    await clipboardy.write(result);
  } catch (error) {
    vscode.window.showErrorMessage("发送错误");
    throw new Error(error);
  }
};
