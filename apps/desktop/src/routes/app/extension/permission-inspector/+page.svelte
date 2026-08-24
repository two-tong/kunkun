<script lang="ts">
	import * as m from "@/paraglide/messages"
	import { goBackOnEscape } from "@/utils/key"
	import { goBack } from "@/utils/route"
	import { listenToFileDrop } from "@/utils/tauri-events"
	import type { ExtPackageJsonExtra } from "@kksh/api/models"
	import { loadExtensionManifestFromDisk } from "@kksh/extension"
	import { Button, Card } from "@kksh/svelte5"
	import { PermissionInspector } from "@kksh/ui/extension"
	import type { UnlistenFn } from "@tauri-apps/api/event"
	import { join } from "@tauri-apps/api/path"
	import { getCurrentWebview } from "@tauri-apps/api/webview"
	import { open as openDialog } from "@tauri-apps/plugin-dialog"
	import { exists } from "@tauri-apps/plugin-fs"
	import { ArrowLeftIcon } from "lucide-svelte"
	import { onDestroy, onMount } from "svelte"
	import { toast } from "svelte-sonner"

	let pkgJsons = $state<ExtPackageJsonExtra[]>([])
	let unlistenDropEvt: UnlistenFn

	onMount(async () => {
		unlistenDropEvt = await getCurrentWebview().onDragDropEvent((event) => {
			if (event.payload.type === "drop") {
				inspectPaths(event.payload.paths)
			}
		})
	})

	onDestroy(() => {
		unlistenDropEvt?.()
	})

	async function inspectPaths(paths: string[]) {
		for (const path of paths) {
			if (!(await exists(path))) {
				toast.error(m.permission_inspector_path_not_exist(), { description: path })
				continue
			}
			const manifestPath = await join(path, "package.json")
			if (!(await exists(manifestPath))) {
				toast.error(m.permission_inspector_not_extension(), { description: path })
				continue
			}
			try {
				pkgJsons.push(await loadExtensionManifestFromDisk(manifestPath))
				toast.success(m.permission_inspector_manifest_loaded(), { description: path })
			} catch (err) {
				toast.error(m.permission_inspector_manifest_load_failed(), {
					description: `${path}: ${err}`
				})
			}
		}
	}

	async function onPick() {
		const paths = await openDialog({
			directory: true,
			multiple: true
		})
		if (!paths) {
			return toast.error(m.common_no_folder_selected())
		}
		inspectPaths(paths)
	}
</script>

<svelte:window on:keydown={goBackOnEscape} />

<main class="container w-screen pt-10">
	<Button variant="outline" size="icon" class="absolute left-2 top-2 z-50" onclick={goBack}>
		<ArrowLeftIcon class="h-4 w-4" />
	</Button>
	<h1 class="text-2xl font-bold">{m.permission_inspector_title()}</h1>
	<Button class="my-5" onclick={onPick}>{m.permission_inspector_pick_folder()}</Button>
	<div class="mb-5 flex flex-col gap-4">
		{#each pkgJsons as pkgJson}
			<Card.Root>
				<Card.Header>
					<Card.Title>{pkgJson.kunkun.name}</Card.Title>
					<Card.Description>{pkgJson.kunkun.shortDescription}</Card.Description>
				</Card.Header>
				<Card.Content>
					<PermissionInspector permissions={pkgJson.kunkun.permissions} />
				</Card.Content>
				<Card.Footer class="block">
					<p class="text-sm">
						<strong>{m.permission_inspector_identifier()}</strong>
						<code>{pkgJson.kunkun.identifier}</code>
					</p>
					<p class="text-sm">
						<strong>{m.permission_inspector_extension_path()}</strong>
						<code>{pkgJson.extPath}</code>
					</p>
				</Card.Footer>
			</Card.Root>
		{/each}
	</div>
</main>

<style>
	:global(body) {
		overflow-x: hidden;
	}
</style>
