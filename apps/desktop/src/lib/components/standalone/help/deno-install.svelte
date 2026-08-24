<script lang="ts">
	import InstallCodeBlock from "@/components/common/install-code-block.svelte"
	import * as m from "@/paraglide/messages"
	import { goBackOnEscape } from "@/utils/key"
	import { goBack } from "@/utils/route"
	import { Button, Tabs } from "@kksh/svelte5"
	import { platform } from "@tauri-apps/plugin-os"
	import { onMount } from "svelte"
	import ArrowLeft from "svelte-radix/ArrowLeft.svelte"
	import { toast } from "svelte-sonner"
	import { whereIsCommand } from "tauri-plugin-shellx-api"

	let brewPath = $state("")
	let denoPath = $state("")
	let cargoPath = $state("")
	let scoopPath = $state("")
	let chocoPath = $state("")
	let wingetPath = $state("")
	let _platform = $state(platform())

	onMount(async () => {
		;[denoPath, brewPath, cargoPath, scoopPath, chocoPath, wingetPath] = await Promise.all([
			whereIsCommand("deno"),
			whereIsCommand("brew"),
			whereIsCommand("cargo"),
			whereIsCommand("scoop"),
			whereIsCommand("choco"),
			whereIsCommand("winget")
		])
	})

	async function onInstallSuccess() {
		denoPath = await whereIsCommand("deno")
		console.log("new denoPath", denoPath)
		if (!denoPath) {
			toast.warning(m.help_deno_path_warning(), {
				description: m.help_verify_restart_hint()
			})
		}
	}

	let alreadyInstalled = $derived(denoPath != "")
</script>

<svelte:window on:keydown={goBackOnEscape} />
<Button variant="outline" size="icon" onclick={goBack} class="absolute left-2 top-2">
	<ArrowLeft class="size-4" />
</Button>
<h1 class="font-mono text-2xl font-bold">{m.help_install_deno()}</h1>
<p class="font-mono text-sm">
	{m.help_deno_dependency_hint()}
</p>
<p class="font-mono text-sm">{m.help_install_method_hint()}</p>
<!-- <p class="font-mono text-sm">
		{m.help_auto_install_hint()}
</p> -->
<p class="font-mono text-sm text-red-400">
	{m.help_deno_path_hint()}
</p>
<!-- {#if _platform === "macos" || _platform === "linux"}
	<p class="font-mono text-sm text-red-400">
		Installation with <span class="font-bold text-green-500">curl</span> command likely requires manual
		configuration. So auto install is disabled. Please copy the command and run it in a terminal.
	</p>
{/if} -->
{#if denoPath}
	<div class="flex items-center gap-2">
		<span>✅</span>
		<span>{m.help_deno_installed_at()}</span>
		<pre class="text-sm">{denoPath}</pre>
	</div>
{:else}
	<div class="flex items-center gap-2">
		<span>❌</span>
		<span>{m.help_deno_not_installed()}</span>
	</div>
{/if}
<Tabs.Root value={_platform} class="mt-2 w-full">
	<div class="flex w-full justify-center">
		<Tabs.List>
			<Tabs.Trigger value="windows">{m.help_install_windows()}</Tabs.Trigger>
			<Tabs.Trigger value="macos">{m.help_install_macos()}</Tabs.Trigger>
			<Tabs.Trigger value="linux">{m.help_install_linux()}</Tabs.Trigger>
		</Tabs.List>
	</div>
	<Tabs.Content value="macos" class="space-y-2">
		<InstallCodeBlock
			onSuccess={onInstallSuccess}
			code="curl -fsSL https://deno.land/install.sh | sh"
			lang="bash"
			{alreadyInstalled}
		/>
		{#if brewPath}
			<InstallCodeBlock
				onSuccess={onInstallSuccess}
				code="brew install deno"
				lang="bash"
				{alreadyInstalled}
				autoInstallable={true}
			/>
		{/if}
	</Tabs.Content>
	<Tabs.Content value="windows" class="space-y-2">
		<InstallCodeBlock
			onSuccess={onInstallSuccess}
			code="irm https://deno.land/install.ps1 | iex"
			lang="bash"
			{alreadyInstalled}
		/>
		{#if scoopPath}
			<InstallCodeBlock
				onSuccess={onInstallSuccess}
				code="scoop install deno"
				lang="bash"
				autoInstallable={true}
				{alreadyInstalled}
			/>
		{/if}
		{#if chocoPath}
			<InstallCodeBlock
				onSuccess={onInstallSuccess}
				code="choco install deno"
				lang="bash"
				autoInstallable={true}
				{alreadyInstalled}
			/>
		{/if}
		{#if wingetPath}
			<InstallCodeBlock
				onSuccess={onInstallSuccess}
				code="winget install deno"
				lang="bash"
				autoInstallable={true}
				{alreadyInstalled}
			/>
		{/if}
	</Tabs.Content>
	<Tabs.Content value="linux" class="space-y-2">
		<InstallCodeBlock
			onSuccess={onInstallSuccess}
			code="curl -fsSL https://deno.land/install.sh | sh"
			lang="bash"
			{alreadyInstalled}
		/>
	</Tabs.Content>
</Tabs.Root>
{#if cargoPath}
	<p class="mt-2 font-mono text-sm">
		Seeing this message means `cargo` is detected and you are a programmer. `cargo install` allows
		you to install `deno` from rust source code. But rust compiles super slow (a few minutes), so
		auto install is disabled. If you really want to use this method, please copy the command and run
		it in a terminal.
	</p>
	<InstallCodeBlock
		onSuccess={onInstallSuccess}
		class="mt-2"
		code="cargo install deno --locked"
		lang="bash"
		{alreadyInstalled}
	/>
{/if}
