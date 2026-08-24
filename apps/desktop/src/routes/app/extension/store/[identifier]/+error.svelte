<script lang="ts">
	import { i18n } from "@/i18n"
	import * as m from "@/paraglide/messages"
	import { Error, Layouts } from "@kksh/ui"
	import { goto } from "$app/navigation"
	import { page } from "$app/stores"

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === "Enter") {
			goto(i18n.resolveRoute("/app/"))
		}
	}
</script>

<svelte:window on:keydown={handleKeyDown} />

<Layouts.Center class="min-h-screen py-5">
	<Error.RawErrorJSONPreset
		title={m.error_fail_load_extension()}
		class="w-fit max-w-screen-sm border-2 border-red-500"
		message={$page.error?.message ?? m.common_unknown_error()}
		labels={{ rawJson: m.common_raw_error_json(), goBack: m.common_go_back() }}
		onGoBack={() => goto(i18n.resolveRoute("/app/"))}
		rawJsonError={JSON.stringify($page, null, 2)}
	/>
</Layouts.Center>
