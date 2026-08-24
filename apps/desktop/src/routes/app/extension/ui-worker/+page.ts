import { KunkunTemplateExtParams } from "@/cmds/ext"
import { i18n } from "@/i18n"
import * as m from "@/paraglide/messages"
import type { ExtPackageJsonExtra } from "@kksh/api/models"
import { db } from "@kksh/drizzle"
import { loadExtensionManifestFromDisk } from "@kksh/extension"
import { error as sbError, error as svError } from "@sveltejs/kit"
import { join } from "@tauri-apps/api/path"
import { getCurrentWindow } from "@tauri-apps/api/window"
import { exists, readTextFile } from "@tauri-apps/plugin-fs"
import { error } from "@tauri-apps/plugin-log"
import { goto } from "$app/navigation"
import { toast } from "svelte-sonner"
import * as v from "valibot"
import type { PageLoad } from "./$types"

export const load: PageLoad = async ({ url }) => {
	// both query parameter must exist
	const rawKunkunTemplateExtParams = localStorage.getItem("kunkun-template-ext-params")
	if (!rawKunkunTemplateExtParams) {
		toast.error(m.extension_invalid_path_url())
		return svError(404, m.extension_invalid_path_url())
	}
	const json = JSON.parse(rawKunkunTemplateExtParams)
	const parsed = v.safeParse(KunkunTemplateExtParams, json)
	if (!parsed.success) {
		getCurrentWindow().show()
		console.error(v.flatten<typeof KunkunTemplateExtParams>(parsed.issues))
		toast.error(m.extension_parse_params_failed(), {
			description: `${v.flatten<typeof KunkunTemplateExtParams>(parsed.issues)}`
		})
		return svError(404, m.extension_parse_params_failed())
	}
	const { cmdName, extPath } = parsed.output

	let _loadedExt: ExtPackageJsonExtra | undefined
	try {
		_loadedExt = await loadExtensionManifestFromDisk(await join(extPath!, "package.json"))
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
	const pkgJsonPath = await join(extPath!, "package.json")
	if (!(await exists(extPath!))) {
		sbError(404, `Extension not found at ${extPath}`)
	}
	if (!(await exists(pkgJsonPath))) {
		sbError(404, `Extension package.json not found at ${pkgJsonPath}`)
	}

	const cmd = loadedExt.kunkun.templateUiCmds?.find((cmd) => cmd.name === cmdName)
	if (!cmd) {
		sbError(404, `Command ${cmdName} not found in extension ${loadedExt.kunkun.identifier}`)
	}
	const scriptPath = await join(loadedExt.extPath, cmd.main)
	if (!(await exists(scriptPath))) {
		sbError(404, `Command script not found at ${scriptPath}`)
	}

	// const workerScript = await readTextFile(scriptPath)
	return {
		extPath: extPath!,
		pkgJsonPath,
		scriptPath,
		// workerScript,
		cmdName: cmdName!,
		loadedExt,
		extInfoInDB: extInfoInDB!
	}
}
