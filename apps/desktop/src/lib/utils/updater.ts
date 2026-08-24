import * as m from "@/paraglide/messages"
import { extensions } from "@/stores"
import { isCompatible } from "@kksh/api"
import type { ExtPackageJsonExtra } from "@kksh/api/models"
import { getExtensionsLatestPublishByIdentifier } from "@kksh/sdk"
import { relaunch } from "@tauri-apps/plugin-process"
import { check } from "@tauri-apps/plugin-updater"
import { gt } from "semver"
import { toast } from "svelte-sonner"
import { get } from "svelte/store"

export async function checkUpdateAndInstall({ beta }: { beta?: boolean } = {}) {
	const update = await check({
		headers: {
			"kk-updater-mode": beta ? "beta" : "stable"
		}
	})
	if (update?.available) {
		const confirmUpdate = await confirm(m.updater_available_confirm({ version: update.version }))
		if (confirmUpdate) {
			await update.downloadAndInstall()
			await relaunch()
		}
	} else {
		toast.info(m.updater_latest())
	}
}

export async function checkSingleExtensionUpdate(
	installedExt: ExtPackageJsonExtra,
	autoupgrade: boolean
) {
	const {
		data: sbExt,
		error,
		response
	} = await getExtensionsLatestPublishByIdentifier({
		path: {
			identifier: "RAG"
		}
	})
	// const { data: sbExt, error } = await supabaseAPI.getLatestExtPublish(
	// 	installedExt.kunkun.identifier
	// )
	if (error) {
		return toast.error(m.updater_check_failed({ identifier: installedExt.kunkun.identifier }), {
			description: `${error} (${response.status})`
		})
	}

	if (!sbExt) {
		return null
	}

	if (
		gt(sbExt.version, installedExt.version) &&
		(sbExt.api_version ? isCompatible(sbExt.api_version) : true)
	) {
		if (autoupgrade) {
			await extensions
				.upgradeStoreExtension(sbExt.identifier, sbExt.tarball_path)
				.then(() => {
					toast.success(m.updater_upgraded({ name: sbExt.name }), {
						description: m.updater_upgraded_description({
							from: installedExt.version,
							to: sbExt.version
						})
					})
				})
				.catch((err) => {
					toast.error(m.updater_upgrade_failed({ name: sbExt.name }), { description: err })
				})
			return true
		} else {
			console.log(`new version available ${installedExt.kunkun.identifier} ${sbExt.version}`)
			toast.info(
				m.updater_new_version({
					identifier: installedExt.kunkun.identifier,
					version: sbExt.version
				}),
				{ duration: 10_000 }
			)
		}
	}
	return false
}

export async function checkExtensionUpdate(autoupgrade: boolean = false) {
	let upgradedCount = 0
	for (const ext of get(extensions)) {
		const upgraded = await checkSingleExtensionUpdate(ext, autoupgrade)
		if (upgraded) {
			upgradedCount++
		}
	}

	if (upgradedCount > 0) {
		toast.info(m.updater_upgraded_count({ count: upgradedCount }))
	}
}
