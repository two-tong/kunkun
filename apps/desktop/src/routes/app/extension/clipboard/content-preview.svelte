<script lang="ts">
	import * as m from "@/paraglide/messages"
	import { cn } from "@/utils"
	import type { ExtData } from "@kksh/api/models"
	import { db } from "@kksh/drizzle"
	import { Resizable, Separator } from "@kksh/svelte5"
	import { convertFileSrc } from "@tauri-apps/api/core"
	import DOMPurify from "dompurify"

	function formatDate(date: Date) {
		const now = new Date()
		const isToday = date.toDateString() === now.toDateString()

		const options: Intl.DateTimeFormatOptions = {
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
			hour12: true
		} as const
		const timeString = date.toLocaleTimeString("en-US", options)

		if (isToday) {
			return m.clipboard_today_at({ time: timeString })
		} else {
			const dateOptions: Intl.DateTimeFormatOptions = {
				month: "short",
				day: "numeric",
				year: "numeric"
			} as const
			const dateString = date.toLocaleDateString("en-US", dateOptions)
			return m.clipboard_at({ date: dateString, time: timeString })
		}
	}

	let { highlighted }: { highlighted: ExtData } = $props()
	let imgSrc = $state<string>("")
	let txtData = $state<string>("")
	let createTime = $state<Date>()
	let imgRef = $state<HTMLImageElement>()

	$effect(() => {
		;(async () => {
			if (highlighted.dataType === "Image") {
				const dbRecord = await db.getExtensionDataById(highlighted.dataId, []) // do not load "data" field
				imgSrc = await convertFileSrc(`/?id=${highlighted.dataId}`, "cbimg")
				createTime = dbRecord?.createdAt
			} else {
				const dbRecord = await db.getExtensionDataById(highlighted.dataId) // do not load "data" field
				txtData = dbRecord?.data || ""
				createTime = dbRecord?.createdAt
			}
		})()
	})
</script>

<Resizable.PaneGroup direction="vertical">
	<Resizable.Pane defaultSize={50} class="px-2 py-1">
		<div
			class={cn({
				hidden: highlighted.dataType !== "Image",
				"h-full": highlighted.dataType === "Image",
				"flex justify-center": highlighted.dataType === "Image"
			})}
		>
			<img src={imgSrc} alt="" class="h-full w-auto object-contain" bind:this={imgRef} />
		</div>
		{#if highlighted.dataType === "Image"}{:else if highlighted.dataType === "Text"}
			<div class="text-sm">{txtData}</div>
		{:else if highlighted.dataType === "Html"}
			<div class="">
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				{@html DOMPurify.sanitize(txtData)}
			</div>
		{:else}
			<div class="text-sm">{m.clipboard_no_preview_short()}</div>
		{/if}
		<!-- </div> -->
	</Resizable.Pane>
	<Resizable.Handle withHandle />
	<Resizable.Pane defaultSize={50} class="space-y-1 px-4 pt-2">
		<h2 class="font-mono font-bold">{m.clipboard_information()}</h2>
		{#if createTime}
			{@render row(m.clipboard_copied_at(), formatDate(createTime))}
		{/if}
		<Separator />
		{@render row(m.clipboard_content_type(), highlighted.dataType || "")}
		{#if highlighted.dataType === "Image"}
			{#if imgRef}
				<Separator />
				{@render row(m.clipboard_dimension(), `${imgRef.naturalWidth}x${imgRef.naturalHeight}`)}
			{/if}
		{:else}
			<Separator />
			{@render row(m.clipboard_character_count(), txtData.length.toString())}
			<Separator />
			{@render row(m.clipboard_word_count(), txtData.split(/\s+/).length.toString())}
		{/if}
	</Resizable.Pane>
</Resizable.PaneGroup>
{#snippet row(label: string, value: string)}
	<div class="flex justify-between">
		<span class="text-sm font-semibold">{label}</span>
		<span class="text-sm">{value}</span>
	</div>
{/snippet}
