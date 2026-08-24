# 编码与字符串工具箱

Kunkun 插件：从剪贴板读取文本，快速生成常用编码、解码、字符串处理、格式化和哈希结果，并复制回剪贴板。

## 使用

1. 先复制要处理的文本。
2. 在 Kunkun 里打开“编码与字符串工具箱”。
3. 搜索需要的转换类型，回车或点击条目即可复制结果。

## 功能

- Base64 编码 / 解码
- Base64URL 编码 / 解码
- URL 编码 / 解码
- HTML 实体转义 / 反转义
- Unicode Escape / Unescape
- Hex 编码 / 解码
- JSON 格式化 / 压缩
- JWT 解码
- 大小写转换
- camelCase / PascalCase / snake_case / kebab-case
- Trim / 合并空白
- 反转文本
- 行排序 / 去重
- 文本统计
- 时间戳转换
- MD5
- SHA-1 / SHA-256 / SHA-512

## 开发

```bash
pnpm --filter codec-toolbox build
```

在 Kunkun 中使用“添加开发插件”并选择本目录，即可本地加载。

## 开源依赖

插件使用 `he` 处理 HTML 实体，使用 `js-md5` 生成 MD5，其余转换逻辑在插件内实现。
