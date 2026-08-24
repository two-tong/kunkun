<script lang="ts">
	import * as m from "@/paraglide/messages"
	import { goHome } from "@/utils/route"
	import { Error, Layouts } from "@kksh/ui"
	import { page } from "$app/stores"

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === "Enter") {
			window.history.back()
		}
	}
</script>

<svelte:window on:keydown={handleKeyDown} />

<div class="fixed h-12 w-full" data-tauri-drag-region></div>
<Layouts.Center class="min-h-screen py-5">
	<Error.RawErrorJSONPreset
		title={m.error_title()}
		class="w-fit max-w-screen-sm border-2 border-red-500"
		message={$page.error?.message ?? m.common_unknown_error()}
		labels={{ rawJson: m.common_raw_error_json(), goBack: m.common_go_back() }}
		onGoBack={goHome}
		rawJsonError={JSON.stringify($page, null, 2)}
	/>
</Layouts.Center>
