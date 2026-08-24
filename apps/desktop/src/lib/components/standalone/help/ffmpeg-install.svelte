<script lang="ts">
	import InstallCodeBlock from "@/components/common/install-code-block.svelte"
	import * as m from "@/paraglide/messages"
	import Icon from "@iconify/svelte"
	import { Button, Tabs } from "@kksh/svelte5"
	import { TauriLink } from "@kksh/ui"
	import { platform } from "@tauri-apps/plugin-os"
	import { onMount } from "svelte"
	import { toast } from "svelte-sonner"
	import { whereIsCommand } from "tauri-plugin-shellx-api"

	let brewPath = $state("")
	let chocoPath = $state("")
	let ffmpegPath = $state("")
	let aptPath = $state("")
	let _platform = $state(platform())

	onMount(async () => {
		;[ffmpegPath, brewPath, chocoPath, aptPath] = await Promise.all([
			whereIsCommand("ffmpeg"),
			whereIsCommand("brew"),
			whereIsCommand("choco"),
			whereIsCommand("apt")
		])
	})

	function onInstallSuccess() {}
	let alreadyInstalled = $derived(ffmpegPath != "")

	let command = {
		macos: "brew install ffmpeg",
		windows: "choco install ffmpeg",
		linux: `sudo apt update && sudo apt upgrade && sudo apt install ffmpeg`
	}
</script>

<h1 class="font-mono text-2xl font-bold">{m.help_install_ffmpeg()}</h1>
<p class="font-mono text-sm">
	{m.help_ffmpeg_dependency_hint()}
</p>
<p class="font-mono text-sm">
	{m.help_ffmpeg_example_hint()}
</p>
{#if alreadyInstalled}
	<div class="flex items-center gap-2 font-mono text-sm">
		<span>✅</span>
		<span>{m.help_ffmpeg_installed_at()}</span>
		<pre class="text-sm">{ffmpegPath}</pre>
	</div>
{:else}
	<div class="flex items-center gap-2 font-mono text-sm">
		<span>❌</span>
		<span>{m.help_ffmpeg_not_installed()}</span>
	</div>
{/if}
<TauriLink href="/app/help/ffmpeg-install" class="flex items-center gap-2">
	<span class="font-mono text-lg font-bold">{m.help_ffmpeg_website()}</span>
	<Icon icon="logos:ffmpeg-icon" class="h-6 w-6" />
</TauriLink>
<p class="font-mono text-sm">
	{m.help_ffmpeg_package_manager_hint()}
</p>
<Tabs.Root value={_platform} class="mt-2 w-full">
	<div class="flex w-full justify-center">
		<Tabs.List>
			<Tabs.Trigger value="windows">{m.help_install_windows()}</Tabs.Trigger>
			<Tabs.Trigger value="macos">{m.help_install_macos()}</Tabs.Trigger>
			<Tabs.Trigger value="linux">{m.help_install_linux()}</Tabs.Trigger>
		</Tabs.List>
	</div>
	<Tabs.Content value="macos" class="space-y-2">
		{#if !brewPath}
			<p class="font-mono text-sm text-red-400">
				{m.help_homebrew_missing()}
			</p>
		{/if}
		<InstallCodeBlock
			onSuccess={onInstallSuccess}
			code={command.macos}
			lang="bash"
			{alreadyInstalled}
			autoInstallable={true}
		/>
	</Tabs.Content>
	<Tabs.Content value="windows" class="space-y-2">
		{#if !chocoPath}
			<p class="font-mono text-sm text-red-400">
				{m.help_chocolatey_missing()}
			</p>
		{/if}
		<InstallCodeBlock
			onSuccess={onInstallSuccess}
			code={command.windows}
			lang="bash"
			{alreadyInstalled}
		/>
	</Tabs.Content>
	<Tabs.Content value="linux" class="space-y-2">
		{#if !aptPath}
			<p class="font-mono text-sm text-red-400">
				{m.help_apt_missing()}
			</p>
			<p class="font-mono text-sm text-red-400">
				{m.help_linux_user_hint()}
			</p>
		{/if}
		<InstallCodeBlock
			onSuccess={onInstallSuccess}
			code={command.linux}
			lang="bash"
			{alreadyInstalled}
		/>
	</Tabs.Content>
</Tabs.Root>
