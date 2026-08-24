<script lang="ts">
	import DragNDrop from "@/components/common/DragNDrop.svelte"
	import * as m from "@/paraglide/messages"
	import { cn } from "@/utils"
	import { goBackOnEscape } from "@/utils/key"
	import { goBack } from "@/utils/route"
	import {
		downloadFile,
		downloadFiles,
		fileTransferPreviewBucket,
		getAllFileTransferBuckets,
		getPeers,
		localNetSendFile,
		type ProgressPayload
	} from "@kksh/api/commands"
	import {
		FileNode,
		FileTransferPayload,
		IconEnum,
		MdnsServiceInfo,
		type MdnsPeers
	} from "@kksh/api/models"
	import { Button, Card, Progress, Table } from "@kksh/svelte5"
	import { IconMultiplexer, Layouts } from "@kksh/ui"
	import { listen, type EventCallback, type UnlistenFn } from "@tauri-apps/api/event"
	import * as path from "@tauri-apps/api/path"
	import { confirm } from "@tauri-apps/plugin-dialog"
	import * as fs from "@tauri-apps/plugin-fs"
	import { ArrowLeftIcon, SendIcon } from "lucide-svelte"
	import prettyBytes from "pretty-bytes"
	import { onDestroy, onMount } from "svelte"
	import { toast } from "svelte-sonner"
	import FileIcon from "./file-icon.svelte"

	let peers: MdnsPeers = $state({})
	let dragging = $state(false)
	let files: string[] = $state([])
	let progressMap = $state<Record<string, ProgressPayload>>({})
	let previewBucketInfo = $state<{ total_bytes: number; total_files: number } | null>(null)
	let progresses = $derived(Object.values(progressMap))
	let unlistenReq: UnlistenFn

	$effect(() => {
		if (files.length > 0) {
			fileTransferPreviewBucket(files).then((info) => {
				previewBucketInfo = info
			})
		}
	})

	async function getAllBuckets() {
		const allBuckets = await getAllFileTransferBuckets()
		console.log(allBuckets)
	}

	onMount(async () => {
		peers = await getPeers()
		unlistenReq = await listen<FileTransferPayload>("file-transfer-request", async (e) => {
			console.log(e)
			const confirmed = await confirm(
				m.file_transfer_download_confirm({
					count: e.payload.totalFiles,
					size: prettyBytes(e.payload.totalBytes),
					ip: e.payload.ip
				})
			)
			if (!confirmed) return
			downloadFiles(e.payload, await path.downloadDir(), (progress) => {
				progressMap[e.payload.code] = progress
				console.log(progress)
			})
				.catch((err) => {
					console.error("Fail to download files", err)
					toast.error(m.file_transfer_fail_download(), { description: err.message })
				})
				.finally(() => {
					console.log("finally clean", e.payload.code)
					delete progressMap[e.payload.code]
				})
		})
	})

	onDestroy(async () => {
		unlistenReq()
	})

	const onDrop: EventCallback<{ paths: string[] }> = async (e) => {
		// keep only files not dirs
		const filesStats = await Promise.all(e.payload.paths.map((p) => fs.stat(p)))
		// keep only files based on stats
		// const filesPaths = e.payload.paths.filter((p, i) => filesStats[i].isFile)
		files = Array.from(new Set([...files, ...e.payload.paths]))

		dragging = false
	}

	function sendFile(peer: MdnsServiceInfo, files: string[]) {
		// console.log(peer.addresses[0], peer.port, peer.sslCert, files)
		localNetSendFile(peer.addresses[0], peer.port, peer.sslCert, files)
	}
</script>

<svelte:window on:keydown={goBackOnEscape} />
<Button variant="outline" size="icon" class="fixed left-2 top-2 z-50" onclick={goBack}>
	<ArrowLeftIcon class="h-4 w-4" />
</Button>
<div class="h-12" data-tauri-drag-region></div>
<div class="container space-y-2">
	{#if progresses.length > 0}
		{#each progresses as progress}
			{@const progressPerc = Math.round((progress.progressBytes / progress.totalBytes) * 100)}
			<div class="flex items-center space-x-2">
				<Progress value={progressPerc} class="whitespace-nowrap" />
				<span class="w-12 whitespace-nowrap text-right">{progressPerc}%</span>
				<span class="w-24 whitespace-nowrap text-right"
					>{prettyBytes(progress.transferSpeedBytesPerSecond)}ps</span
				>
			</div>
		{/each}
	{/if}

	<Layouts.Center>
		<DragNDrop {onDrop} onEnter={() => (dragging = true)} onCancelled={() => (dragging = false)}>
			<Card.Root
				class={cn(
					"w-96 space-y-2 px-2 py-3",
					dragging ? "border-lime-400/30" : "text-white hover:text-blue-200"
				)}
			>
				<button class="flex h-full w-full cursor-pointer items-center justify-center pt-2">
					<div class={cn("flex flex-col items-center", dragging ? "text-lime-400/70" : "")}>
						<IconMultiplexer
							icon={{ value: "mdi:file", type: IconEnum.Iconify }}
							class="h-10 w-10"
						/>
						<small class="select-none font-mono text-xs">{m.file_transfer_drag_and_drop()}</small>
						<small class="select-none font-mono text-xs">{m.file_transfer_file_to_send()}</small>
					</div>
				</button>
				{#if files.length > 0}
					<div>
						<pre><strong>{m.file_transfer_total_files()}</strong> {previewBucketInfo?.total_files ??
								0}</pre>
						<pre><strong>{m.file_transfer_total_bytes()}</strong> {prettyBytes(
								previewBucketInfo?.total_bytes ?? 0
							)}</pre>
					</div>
					<div class="w-full overflow-x-auto">
						<div class="flex flex-nowrap gap-2 py-2">
							{#each files as file}
								<FileIcon
									filepath={file}
									onDelete={() => {
										files = files.filter((f) => f !== file)
									}}
								/>
							{/each}
						</div>
					</div>
				{/if}
			</Card.Root>
		</DragNDrop>
	</Layouts.Center>
	<div class="container">
		<!-- <Button onclick={getAllBuckets}>Get All Buckets</Button> -->
		<Table.Root>
			<Table.Caption>{m.file_transfer_peers_caption()}</Table.Caption>
			<Table.Header>
				<Table.Row>
					<Table.Head class="w-[100px]">{m.file_transfer_hostname()}</Table.Head>
					<Table.Head>{m.file_transfer_address()}</Table.Head>
					<Table.Head>{m.file_transfer_port()}</Table.Head>
					<Table.Head class="text-right">{m.file_transfer_send()}</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each Object.values(peers) as peer}
					<Table.Row>
						<Table.Cell class="font-medium">{peer.hostname}</Table.Cell>
						<Table.Cell>{peer.addresses[0]}</Table.Cell>
						<Table.Cell>{peer.port}</Table.Cell>
						<Table.Cell class="text-right">
							<Button
								variant="outline"
								size="icon"
								onclick={() => {
									sendFile(peer, files)
								}}
							>
								<SendIcon class="h-4 w-4" />
							</Button>
						</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>
</div>
