<script lang="ts">
	import InstallCodeBlock from "@/components/common/install-code-block.svelte"
	import * as m from "@/paraglide/messages"
	import Icon from "@iconify/svelte"
	import { TauriLink } from "@kksh/ui"
	import { platform } from "@tauri-apps/plugin-os"
	import { onMount } from "svelte"
	import { whereIsCommand } from "tauri-plugin-shellx-api"

	let brewPath = $state("")
	let _platform = $state(platform())

	onMount(async () => {
		brewPath = await whereIsCommand("brew")
	})

	function onInstallSuccess() {}
	let alreadyInstalled = $derived(brewPath != "")
</script>

<h1 class="font-mono text-2xl font-bold">{m.help_install_homebrew()}</h1>
<TauriLink href="/app/help/brew-install" class="flex items-center">
	<span class="text-lg">{m.help_homebrew_website()}</span>
	<Icon icon="devicon:homebrew" class="h-6 w-6" />
</TauriLink>
{#if _platform !== "macos"}
	<p class="font-mono text-sm text-red-500">{m.help_homebrew_macos_only()}</p>
{/if}
{#if alreadyInstalled}
	<div class="flex items-center gap-2 font-mono text-sm">
		<span>✅</span>
		<span>{m.help_homebrew_installed_at()}</span>
		<pre class="text-sm">{brewPath}</pre>
	</div>
{:else}
	<div class="flex items-center gap-2 font-mono text-sm">
		<span>❌</span>
		<span>{m.help_homebrew_not_installed()}</span>
	</div>
{/if}
<p class="font-mono text-sm">
	{m.help_homebrew_dependency_hint()}
</p>

<InstallCodeBlock
	onSuccess={onInstallSuccess}
	code={`/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"`}
	lang="bash"
	{alreadyInstalled}
	autoInstallable={!alreadyInstalled}
/>
