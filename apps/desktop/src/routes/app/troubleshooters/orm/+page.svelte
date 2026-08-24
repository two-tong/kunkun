<script lang="ts">
	import * as m from "@/paraglide/messages"
	import {
		getAllCmds,
		getAllExtensions,
		getExtensionDataById,
		getUniqueExtensionByIdentifier,
		getUniqueExtensionByPath,
		searchExtensionData,
		updateCmdByID
	} from "@kksh/drizzle/api"
	import * as schema from "@kksh/drizzle/schema"
	import { Button, Input } from "@kksh/svelte5"
	import { CmdTypeEnum, Ext } from "@kunkunapi/src/models/extension"
	import { SearchModeEnum, SQLSortOrderEnum } from "@kunkunapi/src/models/sql"
	// import * as orm from "drizzle-orm"
	import { Inspect } from "svelte-inspect-value"
	import { toast } from "svelte-sonner"
	import * as v from "valibot"

	let searchText = $state("")
	/* eslint-disable */
	let data: any = $state(null)
	let inspectTitle = $state("")
</script>

<main class="container space-y-2">
	<Button
		onclick={async () => {
			getAllCmds()
				.then((cmds) => {
					console.log(cmds)
					data = cmds
					inspectTitle = m.troubleshooters_orm_all_commands()
				})
				.catch((e) => {
					console.error(e)
					toast.error(m.troubleshooters_orm_failed_get_all_commands(), {
						description: m.troubleshooters_orm_see_console()
					})
				})
		}}
	>
		{m.troubleshooters_orm_get_all_commands()}
	</Button>
	<Button
		onclick={() => {
			getAllExtensions()
				.then((exts) => {
					data = exts
					inspectTitle = m.troubleshooters_orm_all_extensions()
				})
				.catch((e) => {
					console.error(e)
					toast.error(m.troubleshooters_orm_failed_get_all_extensions(), {
						description: m.troubleshooters_orm_see_console()
					})
				})
		}}
	>
		{m.troubleshooters_orm_get_all_extensions()}
	</Button>

	<Button
		onclick={async () => {
			// get all extensions with path not null
			const exts = await getAllExtensions()
			for (const ext of exts) {
				if (ext.path === null) continue
				const _ext = await getUniqueExtensionByIdentifier(ext.identifier)
				console.log(_ext)
				if (ext.path) {
					const __ext = await getUniqueExtensionByPath(ext.path)
					console.log(__ext)
				}
			}
			// data = exts
		}}
	>
		{m.troubleshooters_orm_get_unique_extension()}
	</Button>
	<!-- <Button
		onclick={async () => {
			updateCmdByID({
				cmdId: 1,
				name: "google",
				cmdType: CmdTypeEnum.QuickLink,
				data: `{"link":"https://google.com/search?query={argument}","icon":{"type":"remote-url","value":"https://google.com/favicon.ico","invert":false}}`,
				enabled: true
			})
		}}
	>
		Update Command By ID
	</Button> -->
	<Button
		onclick={async () => {
			const _data = await getExtensionDataById(1, ["search_text", "data"])
			data = _data
			inspectTitle = m.troubleshooters_orm_extension_data()
		}}
	>
		{m.troubleshooters_orm_get_extension_data_by_id()}
	</Button>
	<form
		class="flex gap-1"
		onsubmit={async (e) => {
			e.preventDefault()
			const _data = await searchExtensionData({
				extId: 1,
				searchMode: SearchModeEnum.FTS,
				searchText: searchText,
				orderByCreatedAt: SQLSortOrderEnum.Desc,
				limit: 10,
				fields: ["search_text", "data"]
			})
			console.log(_data)
			data = _data
			inspectTitle = m.troubleshooters_orm_search_results()
		}}
	>
		<Input class="" bind:value={searchText} placeholder={m.troubleshooters_orm_search_text()} />
		<Button class="" type="submit">{m.troubleshooters_orm_search_extension_data()}</Button>
	</form>
	<Inspect name={inspectTitle} value={data} expandLevel={2} />
</main>
