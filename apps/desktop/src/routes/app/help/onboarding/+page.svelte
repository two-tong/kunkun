<script lang="ts">
	import GeneralSettings from "@/components/standalone/general-settings.svelte"
	import DenoInstall from "@/components/standalone/help/deno-install.svelte"
	import FFmpegInstall from "@/components/standalone/help/ffmpeg-install.svelte"
	import { i18n } from "@/i18n"
	import * as m from "@/paraglide/messages"
	import { appConfig } from "@/stores/appConfig"
	import { Button } from "@kksh/svelte5"
	import { goto } from "$app/navigation"
	import { ArrowRightIcon } from "lucide-svelte"
	import { onMount } from "svelte"
	import { whereIsCommand } from "tauri-plugin-shellx-api"
	import { Step } from "./steps"

	let step = $state(0)
	let denoPath = $state("")
	let ffmpegPath = $state("")

	onMount(async () => {
		denoPath = await whereIsCommand("deno")
		ffmpegPath = await whereIsCommand("ffmpeg")
	})

	function nextStep() {
		step++
	}

	$effect(() => {
		if (step > Step.GeneralSettings) {
			appConfig.setOnBoarded(true)
			goto(i18n.resolveRoute("/app"))
		}
		// if (step === Step.DenoInstall) {
		// 	if (denoPath) {
		// 		step++
		// 	}
		// } else if (step === Step.FFmpegInstall) {
		// 	if (ffmpegPath) {
		// 		step++
		// 	}
		// } else if (step > Step.FFmpegInstall) {
		// 	appConfig.setOnBoarded(true)
		// 	goto(i18n.resolveRoute("/app"))
		// }
	})
</script>

<main class="container">
	<div class="left-0 top-0 h-10 w-full" data-tauri-drag-region></div>
	{#if step === Step.Welcome}
		<h1 class="text-3xl font-bold">{m.help_onboarding_welcome()}</h1>
		<p>{m.help_onboarding_description()}</p>
		<div>{m.help_onboarding_next_hint()}</div>
	{:else if step === Step.GeneralSettings}
		<h1 class="text-2xl font-bold">{m.help_onboarding_general_settings()}</h1>
		<small>{m.help_onboarding_settings_later()}</small>
		<GeneralSettings />
	{:else if step === Step.DenoInstall}
		<DenoInstall />
	{:else if step === Step.FFmpegInstall}
		<FFmpegInstall />
	{/if}
</main>
<Button class="fixed bottom-4 right-4" variant="outline" size="icon" onclick={nextStep}>
	<ArrowRightIcon />
</Button>
