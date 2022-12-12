# swagger-to-ts

通过 swagger schema 生成 ts 接口描述

⚠️ 使用前，请先配置 package.json 中的 `swaggerUrl` 字段，该字段为项目 swagger 接口地址。格式如 ${host}/v2/api-docs

使用方式： command + shift + p ，搜索「swagger-to-ts」关键字。

**Enjoy!**


# 使用方式：
## Typescript interface
鼠标选取需要生成的url， 然后 command + shift + p ，搜索「swagger-to-ts」关键字。 目前支持 GET PUT 请求方式。

## mock
鼠标选取需要生成的url， 然后 command + shift + p ，搜索「swagger-to-mock」关键字。 目前支持 GET PUT 请求方式。


# 说明
因原插件[swagger-to-ts](https://github.com/Farewing/vscode-plugin-swagger-to-js)使用时报错，刚好项目里需要用到，因此对代码进行相应调整，以适用于当前项目的开发。


## 增加功能
1.自动识别request和response(如遇不太准确的情况，需手动调整)

2.对请求参数增加默认值

做了一点微小的工作!……

