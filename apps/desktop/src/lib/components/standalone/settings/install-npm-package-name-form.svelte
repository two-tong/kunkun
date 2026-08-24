<script lang="ts">
	import { i18n } from "@/i18n"
	import * as m from "@/paraglide/messages"
	import { appConfig, extensions } from "@/stores"
	import { Input } from "@kksh/svelte5"
	import { Form } from "@kksh/ui"
	import { goto } from "$app/navigation"
	import { toast } from "svelte-sonner"
	import SuperDebug, { defaults, superForm } from "sveltekit-superforms"
	import { valibot, valibotClient } from "sveltekit-superforms/adapters"
	import * as v from "valibot"

	const npmPackageNameFormSchema = v.object({
		name: v.pipe(v.string(), v.minLength(1))
	})

	async function onNpmPackageNameSubmit(data: v.InferOutput<typeof npmPackageNameFormSchema>) {
		if (!$appConfig.devExtensionPath) {
			toast.warning(m.dev_extension_set_path_hint())
			return goto(i18n.resolveRoute("/app/settings/set-dev-ext-path"))
		}
		await extensions
			.installFromNpmPackageName(data.name, $appConfig.devExtensionPath)
			.then(() => {
				toast.success(m.common_success(), { description: m.dev_extension_installed() })
			})
			.catch((err) => {
				toast.warning(m.dev_extension_install_failed(), { description: err })
			})
	}

	const form = superForm(defaults(valibot(npmPackageNameFormSchema)), {
		validators: valibotClient(npmPackageNameFormSchema),
		SPA: true,
		onUpdate({ form, cancel }) {
			if (!form.valid) {
				console.log("invalid")
				return
			}
			console.log(form.data)
			onNpmPackageNameSubmit(form.data)
			cancel()
		}
	})

	const { form: formData, enhance, errors } = form
</script>

<form method="POST" use:enhance>
	<Form.Field {form} name="name">
		<Form.Control>
			{#snippet children({ props })}
				<div class="flex items-center gap-2">
					<Input
						{...props}
						bind:value={$formData.name}
						placeholder={m.dev_extension_npm_package_name()}
					/>
					<Form.Button class="my-1">{m.common_install()}</Form.Button>
				</div>
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
</form>
