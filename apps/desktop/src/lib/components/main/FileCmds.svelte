<script lang="ts">
	import * as m from "@/paraglide/messages"
	import { appState } from "@/stores"
	import type { FileSearchResult } from "@/stores/files"
	import { IconEnum } from "@kksh/api/models"
	import { Command } from "@kksh/svelte5"
	import { IconMultiplexer } from "@kksh/ui"
	import { DraggableCommandGroup } from "@kksh/ui/custom"
	import { getCurrentWindow } from "@tauri-apps/api/window"
	import { toast } from "svelte-sonner"
	import { open } from "tauri-plugin-shellx-api"

	let { files, heading }: { files: FileSearchResult[]; heading: string } = $props()
</script>

<DraggableCommandGroup {heading}>
	{#each files as file (`file-${file.path}`)}
		<Command.Item
			class="flex justify-between"
			onSelect={async () => {
				try {
					await open(file.path)
					await getCurrentWindow().hide()
					appState.clearSearchTerm()
				} catch (err) {
					toast.error(m.file_search_open_failed(), { description: String(err) })
				}
			}}
			keywords={[file.name, file.parent, file.path]}
			value={`file:${file.path}`}
		>
			<span class="flex min-w-0 items-center gap-2">
				<IconMultiplexer
					icon={{
						type: IconEnum.Iconify,
						value: file.isDirectory ? "mdi:folder-outline" : "mdi:file-outline"
					}}
					class="!h-5 !w-5 shrink-0"
				/>
				<span class="min-w-0 truncate">{file.name}</span>
				<span class="text-muted-foreground min-w-0 truncate text-xs">{file.parent}</span>
			</span>
			<span class="text-muted-foreground shrink-0 text-xs">
				{file.isDirectory ? m.file_search_kind_folder() : m.file_search_kind_file()}
			</span>
		</Command.Item>
	{/each}
</DraggableCommandGroup>
