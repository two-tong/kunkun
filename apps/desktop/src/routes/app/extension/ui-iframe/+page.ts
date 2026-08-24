import { KunkunIframeExtParams } from "@/cmds/ext"
import { i18n } from "@/i18n"
import * as m from "@/paraglide/messages"
import type { Ext as ExtInfoInDB, ExtPackageJsonExtra } from "@kksh/api/models"
import { db } from "@kksh/drizzle"
import { loadExtensionManifestFromDisk } from "@kksh/extension"
import { error as svError } from "@sveltejs/kit"
import { join } from "@tauri-apps/api/path"
import { error } from "@tauri-apps/plugin-log"
import { goto } from "$app/navigation"
import { toast } from "svelte-sonner"
import * as v from "valibot"
import { z } from "zod"
import type { PageLoad } from "./$types"

export const load: PageLoad = async ({
	url,
	params,
	route
}): Promise<{
	extPath: string
	url: string
	loadedExt: ExtPackageJsonExtra
	extInfoInDB: ExtInfoInDB
}> => {
	// both query parameter must exist
	const rawKunkunIframeExtParams = localStorage.getItem("kunkun-iframe-ext-params")
	if (!rawKunkunIframeExtParams) {
		toast.error(m.extension_invalid_path_url())
		return svError(404, m.extension_invalid_path_url())
	}
	// localStorage.removeItem("kunkun-iframe-ext-params")
	const parsed = v.safeParse(KunkunIframeExtParams, JSON.parse(rawKunkunIframeExtParams))
	if (!parsed.success) {
		toast.error(m.extension_parse_params_failed(), {
			description: `${v.flatten<typeof KunkunIframeExtParams>(parsed.issues)}`
		})
		return svError(400, m.extension_parse_params_failed())
	}
	const { url: extUrl, extPath } = parsed.output
	console.log("extUrl extPath", extUrl, extPath)

	const _extPath = url.searchParams.get("extPath")
	const _extUrl = url.searchParams.get("url")
	console.log("_extPath", _extPath)
	console.log("_extUrl", _extUrl)
	// if (!_extPath || !_extUrl) {
	// 	toast.error("Invalid extension path or url", {
	// 		description: `_extPath: ${_extPath}; _extUrl: ${_extUrl}`
	// 	})
	// 	error("Invalid extension path or url")
	// 	goto(i18n.resolveRoute("/app/"))
	// }
	// const extPath = z.string().parse(_extPath)
	// const extUrl = z.string().parse(_extUrl)
	let _loadedExt: ExtPackageJsonExtra | undefined
	try {
		_loadedExt = await loadExtensionManifestFromDisk(await join(extPath, "package.json"))
	} catch (err) {
		error(`Error loading extension manifest: ${err}`)
		toast.error(m.extension_manifest_load_error(), {
			description: `${err}`
		})
		goto(i18n.resolveRoute("/app/"))
	}
	const loadedExt = _loadedExt!
	const extInfoInDB = await db.getUniqueExtensionByPath(loadedExt.extPath)
	if (!extInfoInDB) {
		toast.error(m.extension_unexpected_error(), {
			description: m.extension_not_in_db({ identifier: loadedExt.kunkun.identifier })
		})
		goto(i18n.resolveRoute("/app/"))
	}
	return { extPath, url: extUrl, loadedExt, extInfoInDB: extInfoInDB! }
}
