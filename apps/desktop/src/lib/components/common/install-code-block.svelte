<script lang="ts">
	import * as m from "@/paraglide/messages"
	import { cn } from "@/utils"
	import { Button } from "@kksh/svelte5"
	import { Shiki } from "@kksh/ui"
	import { confirm } from "@tauri-apps/plugin-dialog"
	import { platform } from "@tauri-apps/plugin-os"
	import { toast } from "svelte-sonner"
	import { writeText } from "tauri-plugin-clipboard-api"
	import {
		executeBashScript,
		executePowershellScript,
		fixPathEnv,
		type ChildProcess
	} from "tauri-plugin-shellx-api"

	let {
		code,
		autoInstallable,
		alreadyInstalled,
		lang,
		class: className,
		onSuccess
	}: {
		code: string
		autoInstallable?: boolean
		alreadyInstalled?: boolean
		lang: "bash" | "powershell"
		class?: string
		onSuccess?: () => void
	} = $props()

	function copy() {
		return writeText(code).then(() =>
			toast.info(m.common_copied_to_clipboard(), { description: code })
		)
	}

	async function autoInstall() {
		let cmd: ChildProcess<string> | undefined
		if (alreadyInstalled) {
			const ans = await confirm(m.common_already_installed_confirm())
			if (!ans) return
		}
		try {
			toast.info(m.common_installing())
			if (platform() === "macos") {
				cmd = await executeBashScript(code)
			} else if (platform() === "windows") {
				cmd = await executePowershellScript(code)
			} else if (platform() === "linux") {
				cmd = await executeBashScript(code)
			} else {
				return toast.error(m.common_unsupported_platform())
			}
			if (cmd) {
				if (cmd.code === 0) {
					console.log(cmd.stdout)
					toast.success(m.common_installed_successfully(), {
						description: `Status Code: ${cmd.code}`
					})
					onSuccess?.()
				} else {
					console.log(cmd.stdout)
					console.log(cmd.stderr)
					toast.error(m.common_failed_to_install(), { description: cmd.stderr })
				}
			} else {
				toast.error(`${m.common_failed_to_install()}, ${m.common_unknown_error()}`)
			}
		} catch (error) {
			toast.error(m.common_failed_to_install(), {
				description: error instanceof Error ? error.message : m.common_unknown_error()
			})
			console.error(error)
		}
	}
</script>

<div class={cn("flex items-center gap-2", className)}>
	<Shiki class={cn("w-full overflow-x-scroll rounded-md p-1 px-2")} {code} {lang} />
	<Button class="" size="sm" variant="secondary" onclick={copy}>{m.common_copy()}</Button>
	<!-- <Button class="" size="sm" variant="secondary" onclick={autoInstall} disabled={!autoInstallable}>
		Auto Install
	</Button> -->
</div>
