<script lang="ts">
	import { i18n } from "@/i18n"
	import * as m from "@/paraglide/messages"
	import { goHomeOnEscape } from "@/utils/key"
	import { goHome } from "@/utils/route"
	import Icon from "@iconify/svelte"
	import { Badge, Button, Card } from "@kksh/svelte5"
	import { platform } from "@tauri-apps/plugin-os"
	import { goto } from "$app/navigation"
	import { ArrowLeft, CheckCircle2, CircleAlert, LoaderCircle } from "lucide-svelte"
	import { onMount } from "svelte"
	import { whereIsCommand } from "tauri-plugin-shellx-api"

	type DependencyId = "deno" | "ffmpeg" | "brew"
	type DependencyStatus = "checking" | "installed" | "missing" | "unsupported"

	type Dependency = {
		id: DependencyId
		name: string
		command: string
		icon: string
		route: string
		description: string
		supported: boolean
	}

	let checking = $state(true)
	let paths = $state<Record<DependencyId, string>>({
		deno: "",
		ffmpeg: "",
		brew: ""
	})

	const currentPlatform = platform()

	const dependencies = $derived<Dependency[]>([
		{
			id: "deno",
			name: "Deno",
			command: "deno",
			icon: "simple-icons:deno",
			route: "/app/help/deno-install",
			description: m.help_deno_dependency_hint(),
			supported: true
		},
		{
			id: "ffmpeg",
			name: "ffmpeg",
			command: "ffmpeg",
			icon: "logos:ffmpeg-icon",
			route: "/app/help/ffmpeg-install",
			description: m.help_ffmpeg_dependency_hint(),
			supported: true
		},
		{
			id: "brew",
			name: "Homebrew",
			command: "brew",
			icon: "devicon:homebrew",
			route: "/app/help/brew-install",
			description: m.help_homebrew_dependency_hint(),
			supported: currentPlatform === "macos"
		}
	])

	onMount(async () => {
		const [denoPath, ffmpegPath, brewPath] = await Promise.all([
			whereIsCommand("deno"),
			whereIsCommand("ffmpeg"),
			whereIsCommand("brew")
		])
		paths = {
			deno: denoPath,
			ffmpeg: ffmpegPath,
			brew: brewPath
		}
		checking = false
	})

	function getStatus(dependency: Dependency): DependencyStatus {
		if (!dependency.supported) {
			return "unsupported"
		}
		if (checking) {
			return "checking"
		}
		return paths[dependency.id] ? "installed" : "missing"
	}

	function statusLabel(status: DependencyStatus) {
		if (status === "installed") {
			return m.help_status_installed()
		}
		if (status === "missing") {
			return m.help_status_missing()
		}
		if (status === "unsupported") {
			return m.help_status_unsupported()
		}
		return m.help_status_checking()
	}

	function openHelp(route: string) {
		goto(i18n.resolveRoute(route))
	}
</script>

<svelte:window on:keydown={goHomeOnEscape} />

<Button variant="outline" size="icon" onclick={goHome} class="absolute left-2 top-2 z-50">
	<ArrowLeft class="size-4" />
</Button>

<main class="container max-w-3xl space-y-6 pt-12">
	<header class="space-y-2">
		<h1 class="text-2xl font-bold">{m.help_title()}</h1>
		<p class="text-muted-foreground text-sm">{m.help_description()}</p>
	</header>

	<section class="space-y-3">
		<h2 class="text-lg font-semibold">{m.help_optional_dependencies()}</h2>
		<div class="grid gap-3">
			{#each dependencies as dependency}
				{@const status = getStatus(dependency)}
				<Card.Root>
					<Card.Header class="flex-row items-center justify-between gap-4 space-y-0">
						<div class="flex min-w-0 items-center gap-3">
							<Icon icon={dependency.icon} class="size-8 shrink-0" />
							<div class="min-w-0">
								<Card.Title class="text-base">{dependency.name}</Card.Title>
								<Card.Description class="line-clamp-2">{dependency.description}</Card.Description>
							</div>
						</div>
						<Badge
							variant={status === "installed" ? "default" : "secondary"}
							class="shrink-0 gap-1"
						>
							{#if status === "installed"}
								<CheckCircle2 class="size-3.5" />
							{:else if status === "checking"}
								<LoaderCircle class="size-3.5 animate-spin" />
							{:else}
								<CircleAlert class="size-3.5" />
							{/if}
							{statusLabel(status)}
						</Badge>
					</Card.Header>
					<Card.Content class="flex items-center justify-between gap-3">
						<code class="bg-muted min-w-0 truncate rounded px-2 py-1 text-xs">
							{paths[dependency.id] || dependency.command}
						</code>
						<Button
							variant="outline"
							size="sm"
							onclick={() => openHelp(dependency.route)}
							disabled={status === "unsupported"}
						>
							{m.help_open_detail()}
						</Button>
					</Card.Content>
				</Card.Root>
			{/each}
		</div>
	</section>
</main>
