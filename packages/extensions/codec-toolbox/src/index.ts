import {
	Action,
	clipboard,
	expose,
	Icon,
	IconEnum,
	List,
	Markdown,
	TemplateUiCommand,
	toast,
	ui
} from "@kksh/api/ui/template"
import he from "he"
import { md5 } from "js-md5"

type Operation = {
	id: string
	title: string
	category: string
	description: string
	icon: string
	keywords: string[]
	run: (input: string) => string | Promise<string>
}

type ResultItem = {
	id: string
	title: string
	category: string
	description: string
	result: string
	error?: string
	keywords: string[]
}

const decoder = new TextDecoder("utf-8", { fatal: true })
const encoder = new TextEncoder()

function bytesToBase64(bytes: Uint8Array) {
	let binary = ""
	const chunkSize = 0x8000
	for (let i = 0; i < bytes.length; i += chunkSize) {
		binary += String.fromCharCode(...bytes.slice(i, i + chunkSize))
	}
	return btoa(binary)
}

function base64ToBytes(value: string) {
	const normalized = value.replace(/\s+/g, "")
	const binary = atob(normalized)
	return Uint8Array.from(binary, (char) => char.charCodeAt(0))
}

function base64UrlToBase64(value: string) {
	const normalized = value.replace(/\s+/g, "").replace(/-/g, "+").replace(/_/g, "/")
	const padding = normalized.length % 4
	return padding ? normalized + "=".repeat(4 - padding) : normalized
}

function base64ToBase64Url(value: string) {
	return value.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "")
}

function encodeBase64(input: string) {
	return bytesToBase64(encoder.encode(input))
}

function decodeBase64(input: string) {
	return decoder.decode(base64ToBytes(input))
}

function encodeBase64Url(input: string) {
	return base64ToBase64Url(encodeBase64(input))
}

function decodeBase64Url(input: string) {
	return decodeBase64(base64UrlToBase64(input))
}

function encodeHex(input: string) {
	return Array.from(encoder.encode(input), (byte) => byte.toString(16).padStart(2, "0")).join("")
}

function decodeHex(input: string) {
	const normalized = input.replace(/[\s:,_-]+/g, "")
	if (!/^[0-9a-fA-F]*$/.test(normalized) || normalized.length % 2 !== 0) {
		throw new Error("不是有效的 Hex 字符串")
	}
	const bytes = new Uint8Array(normalized.length / 2)
	for (let i = 0; i < normalized.length; i += 2) {
		bytes[i / 2] = Number.parseInt(normalized.slice(i, i + 2), 16)
	}
	return decoder.decode(bytes)
}

function escapeHtml(input: string) {
	return he.encode(input, {
		useNamedReferences: true
	})
}

function unescapeHtml(input: string) {
	return he.decode(input)
}

function encodeUnicodeEscape(input: string) {
	return Array.from(input)
		.map((char) => {
			const codePoint = char.codePointAt(0) ?? 0
			if (codePoint <= 0xffff) {
				return `\\u${codePoint.toString(16).padStart(4, "0")}`
			}
			const value = codePoint - 0x10000
			const high = 0xd800 + (value >> 10)
			const low = 0xdc00 + (value & 0x3ff)
			return `\\u${high.toString(16)}\\u${low.toString(16)}`
		})
		.join("")
}

function decodeUnicodeEscape(input: string) {
	return input
		.replace(/\\u\{([0-9a-fA-F]+)\}/g, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
		.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(Number.parseInt(hex, 16)))
}

function formatJson(input: string) {
	return JSON.stringify(JSON.parse(input), null, 2)
}

function minifyJson(input: string) {
	return JSON.stringify(JSON.parse(input))
}

function toWords(input: string) {
	return input
		.replace(/([a-z0-9])([A-Z])/g, "$1 $2")
		.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]+/g, " ")
		.trim()
		.split(/\s+/)
		.filter(Boolean)
}

function capitalize(word: string) {
	return word ? word[0].toUpperCase() + word.slice(1).toLowerCase() : word
}

function toCamelCase(input: string) {
	const words = toWords(input)
	return words.map((word, index) => (index === 0 ? word.toLowerCase() : capitalize(word))).join("")
}

function toPascalCase(input: string) {
	return toWords(input).map(capitalize).join("")
}

function toSnakeCase(input: string) {
	return toWords(input)
		.map((word) => word.toLowerCase())
		.join("_")
}

function toKebabCase(input: string) {
	return toWords(input)
		.map((word) => word.toLowerCase())
		.join("-")
}

function toTitleCase(input: string) {
	return toWords(input).map(capitalize).join(" ")
}

function collapseWhitespace(input: string) {
	return input.replace(/\s+/g, " ").trim()
}

function reverseText(input: string) {
	return Array.from(input).reverse().join("")
}

function sortLines(input: string) {
	return input
		.split(/\r?\n/)
		.sort((a, b) => a.localeCompare(b))
		.join("\n")
}

function dedupeLines(input: string) {
	const seen = new Set<string>()
	return input
		.split(/\r?\n/)
		.filter((line) => {
			if (seen.has(line)) {
				return false
			}
			seen.add(line)
			return true
		})
		.join("\n")
}

function textStats(input: string) {
	const lines = input ? input.split(/\r?\n/).length : 0
	const words = input.trim() ? input.trim().split(/\s+/).length : 0
	return JSON.stringify(
		{
			characters: Array.from(input).length,
			bytes: encoder.encode(input).length,
			words,
			lines
		},
		null,
		2
	)
}

function timestampToDate(input: string) {
	const value = Number(input.trim())
	if (!Number.isFinite(value)) {
		throw new Error("不是有效的数字时间戳")
	}
	const millis = value < 10_000_000_000 ? value * 1000 : value
	return new Date(millis).toISOString()
}

function dateToTimestamp(input: string) {
	const millis = Date.parse(input.trim())
	if (Number.isNaN(millis)) {
		throw new Error("不是有效的日期时间")
	}
	return JSON.stringify(
		{
			seconds: Math.floor(millis / 1000),
			milliseconds: millis,
			iso: new Date(millis).toISOString()
		},
		null,
		2
	)
}

function decodeJwt(input: string) {
	const token = input.trim()
	const parts = token.split(".")
	if (parts.length < 2) {
		throw new Error("JWT 至少需要 header 和 payload 两段")
	}
	const header = JSON.parse(decodeBase64Url(parts[0]))
	const payload = JSON.parse(decodeBase64Url(parts[1]))
	return JSON.stringify(
		{
			header,
			payload,
			signature: parts[2] || ""
		},
		null,
		2
	)
}

async function hash(input: string, algorithm: "SHA-1" | "SHA-256" | "SHA-512") {
	const digest = await crypto.subtle.digest(algorithm, encoder.encode(input))
	return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("")
}

function preview(value: string) {
	const compact = value.replace(/\s+/g, " ").trim()
	if (!compact) {
		return "空结果"
	}
	return compact.length > 96 ? `${compact.slice(0, 96)}...` : compact
}

function resultMarkdown(item: ResultItem) {
	if (item.error) {
		return `## ${item.title}\n\n${item.error}`
	}
	const longestFence = Math.max(
		3,
		...Array.from(item.result.matchAll(/`+/g), (match) => match[0].length)
	)
	const fence = "`".repeat(longestFence + 1)
	return `## ${item.title}\n\n${fence}text\n${item.result}\n${fence}`
}

const operations: Operation[] = [
	{
		id: "base64-encode",
		title: "Base64 编码",
		category: "Base64",
		description: "UTF-8 文本转 Base64",
		icon: "material-symbols:lock-outline",
		keywords: ["base64", "encode", "编码"],
		run: encodeBase64
	},
	{
		id: "base64-decode",
		title: "Base64 解码",
		category: "Base64",
		description: "Base64 转 UTF-8 文本",
		icon: "material-symbols:lock-open-outline",
		keywords: ["base64", "decode", "解码"],
		run: decodeBase64
	},
	{
		id: "base64url-encode",
		title: "Base64URL 编码",
		category: "Base64URL",
		description: "生成 URL 安全的 Base64",
		icon: "material-symbols:link",
		keywords: ["base64url", "jwt", "url", "编码"],
		run: encodeBase64Url
	},
	{
		id: "base64url-decode",
		title: "Base64URL 解码",
		category: "Base64URL",
		description: "Base64URL 转 UTF-8 文本",
		icon: "material-symbols:link-off",
		keywords: ["base64url", "jwt", "url", "解码"],
		run: decodeBase64Url
	},
	{
		id: "url-encode",
		title: "URL 编码",
		category: "URL",
		description: "encodeURIComponent",
		icon: "material-symbols:travel-explore",
		keywords: ["url", "uri", "percent", "编码"],
		run: encodeURIComponent
	},
	{
		id: "url-decode",
		title: "URL 解码",
		category: "URL",
		description: "decodeURIComponent",
		icon: "material-symbols:travel-explore",
		keywords: ["url", "uri", "percent", "解码"],
		run: decodeURIComponent
	},
	{
		id: "html-escape",
		title: "HTML 转义",
		category: "HTML",
		description: "转义 &, <, >, 引号",
		icon: "material-symbols:html",
		keywords: ["html", "escape", "转义"],
		run: escapeHtml
	},
	{
		id: "html-unescape",
		title: "HTML 反转义",
		category: "HTML",
		description: "还原常见 HTML 实体",
		icon: "material-symbols:html",
		keywords: ["html", "unescape", "反转义"],
		run: unescapeHtml
	},
	{
		id: "unicode-escape",
		title: "Unicode Escape",
		category: "Unicode",
		description: "文本转 \\uXXXX",
		icon: "material-symbols:language",
		keywords: ["unicode", "escape", "编码"],
		run: encodeUnicodeEscape
	},
	{
		id: "unicode-unescape",
		title: "Unicode Unescape",
		category: "Unicode",
		description: "\\uXXXX 转文本",
		icon: "material-symbols:language",
		keywords: ["unicode", "unescape", "解码"],
		run: decodeUnicodeEscape
	},
	{
		id: "hex-encode",
		title: "Hex 编码",
		category: "Hex",
		description: "UTF-8 文本转十六进制",
		icon: "material-symbols:tag",
		keywords: ["hex", "十六进制", "编码"],
		run: encodeHex
	},
	{
		id: "hex-decode",
		title: "Hex 解码",
		category: "Hex",
		description: "十六进制转 UTF-8 文本",
		icon: "material-symbols:tag",
		keywords: ["hex", "十六进制", "解码"],
		run: decodeHex
	},
	{
		id: "json-format",
		title: "JSON 格式化",
		category: "JSON",
		description: "格式化 JSON",
		icon: "material-symbols:data-object",
		keywords: ["json", "format", "格式化"],
		run: formatJson
	},
	{
		id: "json-minify",
		title: "JSON 压缩",
		category: "JSON",
		description: "移除 JSON 空白字符",
		icon: "material-symbols:data-object",
		keywords: ["json", "minify", "压缩"],
		run: minifyJson
	},
	{
		id: "jwt-decode",
		title: "JWT 解码",
		category: "JWT",
		description: "解析 header 和 payload，不校验签名",
		icon: "material-symbols:key",
		keywords: ["jwt", "token", "decode", "解码"],
		run: decodeJwt
	},
	{
		id: "uppercase",
		title: "转大写",
		category: "String",
		description: "全部字符转大写",
		icon: "material-symbols:text-fields",
		keywords: ["string", "uppercase", "大写"],
		run: (input) => input.toUpperCase()
	},
	{
		id: "lowercase",
		title: "转小写",
		category: "String",
		description: "全部字符转小写",
		icon: "material-symbols:text-fields",
		keywords: ["string", "lowercase", "小写"],
		run: (input) => input.toLowerCase()
	},
	{
		id: "title-case",
		title: "Title Case",
		category: "String",
		description: "单词首字母大写",
		icon: "material-symbols:title",
		keywords: ["string", "title", "case", "标题"],
		run: toTitleCase
	},
	{
		id: "camel-case",
		title: "camelCase",
		category: "String",
		description: "转换为 camelCase",
		icon: "material-symbols:format-letter-spacing",
		keywords: ["string", "camel", "case"],
		run: toCamelCase
	},
	{
		id: "pascal-case",
		title: "PascalCase",
		category: "String",
		description: "转换为 PascalCase",
		icon: "material-symbols:format-letter-spacing",
		keywords: ["string", "pascal", "case"],
		run: toPascalCase
	},
	{
		id: "snake-case",
		title: "snake_case",
		category: "String",
		description: "转换为 snake_case",
		icon: "material-symbols:format-letter-spacing",
		keywords: ["string", "snake", "case"],
		run: toSnakeCase
	},
	{
		id: "kebab-case",
		title: "kebab-case",
		category: "String",
		description: "转换为 kebab-case",
		icon: "material-symbols:format-letter-spacing",
		keywords: ["string", "kebab", "case"],
		run: toKebabCase
	},
	{
		id: "trim",
		title: "Trim",
		category: "String",
		description: "去除首尾空白",
		icon: "material-symbols:format-align-left",
		keywords: ["string", "trim", "空白"],
		run: (input) => input.trim()
	},
	{
		id: "collapse-whitespace",
		title: "合并空白",
		category: "String",
		description: "连续空白合并为一个空格",
		icon: "material-symbols:space-bar",
		keywords: ["string", "space", "whitespace", "空白"],
		run: collapseWhitespace
	},
	{
		id: "reverse",
		title: "反转文本",
		category: "String",
		description: "按 Unicode 字符反转",
		icon: "material-symbols:swap-horiz",
		keywords: ["string", "reverse", "反转"],
		run: reverseText
	},
	{
		id: "sort-lines",
		title: "行排序",
		category: "String",
		description: "按行升序排序",
		icon: "material-symbols:sort-by-alpha",
		keywords: ["string", "sort", "lines", "排序"],
		run: sortLines
	},
	{
		id: "dedupe-lines",
		title: "行去重",
		category: "String",
		description: "保留首次出现的行",
		icon: "material-symbols:filter-list",
		keywords: ["string", "dedupe", "unique", "去重"],
		run: dedupeLines
	},
	{
		id: "text-stats",
		title: "文本统计",
		category: "String",
		description: "统计字符数、字节数、词数和行数",
		icon: "material-symbols:calculate",
		keywords: ["string", "count", "stats", "统计"],
		run: textStats
	},
	{
		id: "timestamp-to-date",
		title: "时间戳转日期",
		category: "Time",
		description: "Unix 秒/毫秒时间戳转 ISO 时间",
		icon: "material-symbols:schedule",
		keywords: ["timestamp", "date", "time", "时间戳"],
		run: timestampToDate
	},
	{
		id: "date-to-timestamp",
		title: "日期转时间戳",
		category: "Time",
		description: "日期字符串转 Unix 时间戳",
		icon: "material-symbols:schedule",
		keywords: ["timestamp", "date", "time", "时间戳"],
		run: dateToTimestamp
	},
	{
		id: "md5",
		title: "MD5",
		category: "Hash",
		description: "生成 MD5 十六进制摘要",
		icon: "material-symbols:fingerprint",
		keywords: ["md5", "hash", "哈希"],
		run: md5
	},
	{
		id: "sha1",
		title: "SHA-1",
		category: "Hash",
		description: "生成 SHA-1 十六进制摘要",
		icon: "material-symbols:fingerprint",
		keywords: ["sha1", "hash", "哈希"],
		run: (input) => hash(input, "SHA-1")
	},
	{
		id: "sha256",
		title: "SHA-256",
		category: "Hash",
		description: "生成 SHA-256 十六进制摘要",
		icon: "material-symbols:fingerprint",
		keywords: ["sha256", "hash", "哈希"],
		run: (input) => hash(input, "SHA-256")
	},
	{
		id: "sha512",
		title: "SHA-512",
		category: "Hash",
		description: "生成 SHA-512 十六进制摘要",
		icon: "material-symbols:fingerprint",
		keywords: ["sha512", "hash", "哈希"],
		run: (input) => hash(input, "SHA-512")
	}
]

class CodecToolbox extends TemplateUiCommand {
	private input = ""
	private results: ResultItem[] = []

	async load() {
		await ui.setSearchBarPlaceholder("搜索转换类型，回车复制选中结果")
		await this.refresh()
	}

	async onEnterPressedOnSearchBar() {
		if (this.highlightedListItemValue) {
			await this.copyResult(this.highlightedListItemValue)
		}
	}

	async onListItemSelected(value: string) {
		await this.copyResult(value)
	}

	async onActionSelected(value: string) {
		if (value === "refresh") {
			await this.refresh()
			return
		}
		if (value === "copy") {
			await this.copyResult(this.highlightedListItemValue ?? this.results[0]?.id ?? "")
			return
		}
		await this.copyResult(value)
	}

	private async refresh() {
		try {
			this.input = await clipboard.readText()
		} catch (err) {
			toast.error(`读取剪贴板失败：${err}`)
			this.input = ""
		}
		this.results = await this.runOperations(this.input)
		await this.render()
	}

	private async runOperations(input: string) {
		const results: ResultItem[] = []
		for (const operation of operations) {
			try {
				const result = await operation.run(input)
				results.push({
					id: operation.id,
					title: operation.title,
					category: operation.category,
					description: operation.description,
					result,
					keywords: operation.keywords
				})
			} catch (err) {
				results.push({
					id: operation.id,
					title: operation.title,
					category: operation.category,
					description: operation.description,
					result: "",
					error: err instanceof Error ? err.message : String(err),
					keywords: operation.keywords
				})
			}
		}
		return results
	}

	private async copyResult(id: string) {
		const item = this.results.find((result) => result.id === id)
		if (!item) {
			return
		}
		if (item.error) {
			toast.error(`${item.title} 不可用`, { description: item.error })
			return
		}
		await clipboard.writeText(item.result)
		toast.success(`已复制：${item.title}`)
	}

	private async render() {
		const highlightedResult = this.getHighlightedResult()
		await ui.render(
			new List.List({
				filter: "default",
				defaultAction: "复制结果",
				actions: new Action.ActionPanel({
					title: "操作",
					items: [
						new Action.Action({
							title: "复制结果",
							value: "copy",
							icon: new Icon({ type: IconEnum.Iconify, value: "material-symbols:content-copy" })
						}),
						new Action.Action({
							title: "重新读取剪贴板",
							value: "refresh",
							icon: new Icon({ type: IconEnum.Iconify, value: "material-symbols:refresh" })
						})
					]
				}),
				sections: [
					new List.Section({
						title: `剪贴板输入：${preview(this.input)}`,
						items: this.results.map(
							(item) =>
								new List.Item({
									title: item.title,
									subTitle: item.error ? item.error : preview(item.result),
									value: item.id,
									defaultAction: "复制结果",
									icon: new Icon({
										type: IconEnum.Iconify,
										value:
											operations.find((operation) => operation.id === item.id)?.icon ??
											"tabler:code"
									}),
									keywords: item.keywords,
									accessories: [
										new List.ItemAccessory({
											tag: item.error
												? { color: "#ef4444", text: "不可用" }
												: { color: "#22c55e", text: item.category }
										})
									],
									actions: new Action.ActionPanel({
										title: item.title,
										items: [
											new Action.Action({
												title: "复制结果",
												value: item.id,
												icon: new Icon({
													type: IconEnum.Iconify,
													value: "material-symbols:content-copy"
												})
											}),
											new Action.Action({
												title: "重新读取剪贴板",
												value: "refresh",
												icon: new Icon({
													type: IconEnum.Iconify,
													value: "material-symbols:refresh"
												})
											})
										]
									})
								})
						)
					})
				],
				detail: new List.ItemDetail({
					width: 420,
					children: [new Markdown(resultMarkdown(highlightedResult))]
				})
			})
		)
	}

	private getHighlightedResult() {
		return (
			this.results.find((result) => result.id === this.highlightedListItemValue) ??
			this.results[0] ?? {
				id: "empty",
				title: "暂无结果",
				category: "Empty",
				description: "",
				result: "",
				keywords: []
			}
		)
	}

	async onHighlightedListItemChanged(value: string) {
		await super.onHighlightedListItemChanged(value)
		await ui.render(
			new List.List({
				filter: "default",
				inherits: ["items", "sections", "actions", "defaultAction"],
				detail: new List.ItemDetail({
					width: 420,
					children: [new Markdown(resultMarkdown(this.getHighlightedResult()))]
				})
			})
		)
	}
}

expose(new CodecToolbox())
