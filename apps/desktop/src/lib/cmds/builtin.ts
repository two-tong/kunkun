import { i18n } from "@/i18n"
import * as m from "@/paraglide/messages"
import { appConfig, appState, auth, extensions } from "@/stores"
import { checkUpdateAndInstall } from "@/utils/updater"
import { setTransparentTitlebar } from "@kksh/api/commands"
import { IconEnum } from "@kksh/api/models"
import type { BuiltinCmd } from "@kksh/ui/types"
import { commandScore } from "@kksh/ui/utils"
import { getVersion } from "@tauri-apps/api/app"
import { appDataDir } from "@tauri-apps/api/path"
import { WebviewWindow } from "@tauri-apps/api/webviewWindow"
import { exit } from "@tauri-apps/plugin-process"
import { dev } from "$app/environment"
import { goto } from "$app/navigation"
import Fuse from "fuse.js"
import { toast } from "svelte-sonner"
import { derived } from "svelte/store"
import * as clipboard from "tauri-plugin-clipboard-api"
import { open } from "tauri-plugin-shellx-api"
import { v4 as uuidv4 } from "uuid"

export const rawBuiltinCmds: BuiltinCmd[] = [
	{
		name: m.app_command_store(),
		icon: {
			type: IconEnum.Iconify,
			value: "streamline:store-2-solid"
		},
		description: m.app_command_store_description(),
		function: async () => {
			appState.clearSearchTerm()
			goto(i18n.resolveRoute("/app/extension/store"))
		}
	},
	{
		name: m.app_command_sign_in(),
		icon: {
			type: IconEnum.Iconify,
			value: "mdi:login-variant"
		},
		description: "",
		function: async () => {
			goto(i18n.resolveRoute("/app/auth"))
		}
	},
	{
		name: m.app_command_sign_out(),
		icon: {
			type: IconEnum.Iconify,
			value: "mdi:logout-variant"
		},
		description: "",
		function: async () => {
			auth
				.signOut()
				.then(() => toast.success(m.app_command_signed_out()))
				.catch((err) => toast.error(m.app_command_sign_out_failed(), { description: err.message }))
		}
	},
	{
		name: m.app_command_show_drag_area(),
		icon: {
			type: IconEnum.Iconify,
			value: "mingcute:move-fill"
		},
		description: "",
		function: async () => {
			// select all html elements with attribute data-tauri-drag-region
			const elements = document.querySelectorAll("[data-tauri-drag-region]")
			elements.forEach((el) => {
				el.classList.add("bg-red-500/30")
			})
			setTimeout(() => {
				elements.forEach((el) => {
					el.classList.remove("bg-red-500/30")
				})
			}, 2_000)
		}
	},
	{
		name: m.app_command_splashscreen_dev(),
		icon: {
			type: IconEnum.Iconify,
			value: "material-symbols:skeleton"
		},
		description: "",
		flags: {
			dev: true,
			developer: true
		},
		function: async () => {
			new WebviewWindow(`splashscreen`, {
				url: "/splashscreen"
			})
			appState.clearSearchTerm()
		}
	},
	{
		name: m.app_command_file_transfer(),
		icon: {
			type: IconEnum.Iconify,
			value: "clarity:file-share-solid"
		},
		description: "",
		function: async () => {
			goto(i18n.resolveRoute("/app/extension/file-transfer"))
			appState.clearSearchTerm()
		}
	},
	{
		name: m.app_command_add_dev_extension(),
		icon: {
			type: IconEnum.Iconify,
			value: "lineicons:dev",
			hexColor: "#0f0"
		},
		description: "",
		function: async () => {
			appState.clearSearchTerm()
			goto(i18n.resolveRoute("/app/settings/add-dev-extension"))
		}
	},
	{
		name: m.app_command_version(),
		icon: {
			type: IconEnum.Iconify,
			value: "stash:version-solid"
		},
		description: "",
		function: async () => {
			toast.success(m.app_command_version_value({ version: await getVersion() }))
		}
	},
	{
		name: m.app_command_set_dev_extension_path(),
		icon: {
			type: IconEnum.Iconify,
			value: "lineicons:dev",
			hexColor: "#0f0"
		},
		description: "",
		function: async () => {
			// const appStateStore = useAppStateStore()
			appState.clearSearchTerm()
			goto(i18n.resolveRoute("/app/settings/set-dev-ext-path"))
		}
	},
	{
		name: m.app_command_extension_window_troubleshooter(),
		icon: {
			type: IconEnum.Iconify,
			value: "material-symbols:window-outline"
		},
		description: "",
		function: async () => {
			appState.clearSearchTerm()
			const winLabel = `main:extension-window-troubleshooter-${uuidv4()}`
			console.log(winLabel)
			new WebviewWindow(winLabel, {
				url: "/app/troubleshooters/extension-window",
				title: m.troubleshooters_extension_window_title_label()
			})
		},
		keywords: ["extension", "window", "troubleshooter"]
	},
	{
		name: m.app_command_help(),
		icon: {
			type: IconEnum.Iconify,
			value: "material-symbols:help-outline"
		},
		description: m.app_command_help_description(),
		function: async () => {
			appState.clearSearchTerm()
			goto(i18n.resolveRoute("/app/help"))
		},
		keywords: ["help", "deno", "ffmpeg", "brew", "homebrew", "install", "dependency"]
	},
	{
		name: m.app_command_onboarding_dev(),
		icon: {
			type: IconEnum.Iconify,
			value: "fluent-mdl2:onboarding"
		},
		description: "",
		function: async () => {
			appState.clearSearchTerm()
			goto(i18n.resolveRoute("/app/help/onboarding"))
		},
		flags: {
			dev: true,
			developer: true
		}
	},
	{
		name: m.app_command_permission_inspector(),
		icon: {
			type: IconEnum.Iconify,
			value: "hugeicons:inspect-code"
		},
		description: "",
		function: async () => {
			appState.clearSearchTerm()
			goto(i18n.resolveRoute("/app/extension/permission-inspector"))
		},
		keywords: ["extension"]
	},
	{
		name: m.app_command_extension_loading(),
		icon: {
			type: IconEnum.Iconify,
			value: "material-symbols:troubleshoot"
		},
		description: "",
		function: async () => {
			appState.clearSearchTerm()
			goto(i18n.resolveRoute("/app/troubleshooters/extension-loading"))
		},
		keywords: ["extension", "troubleshooter"]
	},
	{
		name: m.app_command_orm(),
		icon: {
			type: IconEnum.Iconify,
			value: "material-symbols:database"
		},
		description: "",
		flags: {
			developer: true,
			dev: true
		},
		function: async () => {
			appState.clearSearchTerm()
			goto(i18n.resolveRoute("/app/troubleshooters/orm"))
		},
		keywords: ["extension", "troubleshooter", "database", "orm"]
	},
	{
		name: m.app_command_create_quicklink(),
		icon: {
			type: IconEnum.Iconify,
			value: "material-symbols:link"
		},
		description: m.app_command_create_quicklink_description(),
		function: async () => {
			appState.clearSearchTerm()
			goto(i18n.resolveRoute("/app/extension/create-quick-link"))
		}
	},
	{
		name: m.app_command_key_displayer(),
		icon: {
			type: IconEnum.Iconify,
			value: "material-symbols:keyboard"
		},
		description: m.app_command_key_displayer_description(),
		function: async () => {
			appState.clearSearchTerm()
			const label = `main:extension:key-displayer-${uuidv4()}`
			new WebviewWindow(label, {
				url: "/app/extension/key-displayer",
				title: m.app_command_key_displayer(),
				decorations: false,
				hiddenTitle: true,
				visible: false,
				alwaysOnTop: true,
				width: 200,
				height: 140
			})
			// setTransparentTitlebar(label)
		}
	},
	{
		name: m.app_command_settings(),
		icon: {
			type: IconEnum.Iconify,
			value: "solar:settings-linear"
		},
		description: m.app_command_settings_description(),
		function: async () => {
			goto(i18n.resolveRoute("/app/settings"))
			appState.clearSearchTerm()
		}
	},
	{
		name: m.app_command_check_update(),
		icon: {
			type: IconEnum.Iconify,
			value: "material-symbols:update"
		},
		description: m.app_command_check_update_description(),
		function: async () => {
			checkUpdateAndInstall()
			appState.clearSearchTerm()
		}
	},
	{
		name: m.app_command_check_beta_update(),
		icon: {
			type: IconEnum.Iconify,
			value: "material-symbols:update"
		},
		description: m.app_command_check_beta_update_description(),
		function: async () => {
			checkUpdateAndInstall({ beta: true })
			appState.clearSearchTerm()
		}
	},
	{
		name: m.app_command_reload(),
		icon: {
			type: IconEnum.Iconify,
			value: "tabler:reload"
		},
		description: m.app_command_reload_description(),
		function: async () => {
			location.reload()
		}
	},
	{
		name: m.app_command_reload_extensions(),
		icon: {
			type: IconEnum.Iconify,
			value: "tabler:reload"
		},
		description: m.app_command_reload_extensions(),
		function: async () => {
			extensions.init().then(() => {
				appState.clearSearchTerm()
			})
		}
	},
	{
		name: m.app_command_dance(),
		icon: {
			type: IconEnum.Iconify,
			value: "mdi:dance-pole"
		},
		description: m.app_command_dance(),
		function: async () => {
			goto(i18n.resolveRoute("/app/dance"))
		}
	},
	{
		name: m.app_command_quit(),
		icon: {
			type: IconEnum.Iconify,
			value: "emojione:cross-mark-button"
		},
		description: m.app_command_quit(),
		function: async () => {
			exit(0)
		}
	},
	{
		name: m.app_command_toggle_hmr(),
		icon: {
			type: IconEnum.Iconify,
			value: "ri:toggle-line"
		},
		description: m.app_command_toggle_hmr_description(),
		function: async () => {
			appConfig.update((config) => {
				toast.success(m.app_command_hmr_toggled({ enabled: String(!config.hmr) }))
				return {
					...config,
					hmr: !config.hmr
				}
			})
			appState.clearSearchTerm()
		}
	},
	{
		name: m.app_command_clipboard_history(),
		icon: {
			type: IconEnum.Iconify,
			value: "mdi:clipboard-outline"
		},
		description: m.app_command_clipboard_history(),
		function: async () => {
			appState.clearSearchTerm()
			goto(i18n.resolveRoute("/app/extension/clipboard"))
		}
	},
	{
		name: m.app_command_pin_screenshot(),
		icon: {
			type: IconEnum.Iconify,
			value: "material-symbols:screenshot-monitor-outline"
		},
		description: m.app_command_pin_screenshot(),
		function: async () => {
			appState.clearSearchTerm()
			if (!(await clipboard.hasImage())) {
				toast.error(m.app_command_no_screenshot())
				return
			}
			const window = new WebviewWindow(`main:pinned-screenshot-${uuidv4()}`, {
				url: "/app/extension/pin-screenshot",
				title: m.app_command_pinned_screenshot(),
				hiddenTitle: true,
				titleBarStyle: "transparent",
				decorations: false,
				visible: false
			})
			setTimeout(() => {
				window.show().then(() => window.setFocus())
			}, 2_000)
		}
	},
	{
		name: m.app_command_mdns_debugger(),
		icon: {
			type: IconEnum.Iconify,
			value: "material-symbols:wifi-find"
		},
		description: m.app_command_mdns_debugger(),
		function: async () => {
			goto(i18n.resolveRoute("/app/troubleshooters/mdns-debugger"))
		},
		flags: {
			developer: true
		},
		keywords: ["mdns", "debugger", "troubleshooter"]
	},
	{
		name: m.app_command_toggle_hide_on_blur(),
		icon: {
			type: IconEnum.Iconify,
			value: "ri:toggle-line"
		},
		description: m.app_command_toggle_hide_on_blur(),
		function: async () => {
			appConfig.update((config) => {
				toast.success(m.app_command_hide_on_blur_toggled({ enabled: String(!config.hideOnBlur) }))
				return {
					...config,
					hideOnBlur: !config.hideOnBlur
				}
			})
			appState.clearSearchTerm()
		}
	},
	{
		name: m.app_command_toggle_developer_mode(),
		icon: {
			type: IconEnum.Iconify,
			value: "hugeicons:developer"
		},
		description: m.app_command_toggle_developer_mode(),
		function: async () => {
			appConfig.update((config) => {
				toast.success(
					m.app_command_developer_mode_toggled({ enabled: String(!config.developerMode) })
				)
				return { ...config, developerMode: !config.developerMode }
			})
		}
	},
	{
		name: m.app_command_open_app_data_dir(),
		icon: {
			type: IconEnum.Iconify,
			value: "mdi:folder-open"
		},
		description: m.app_command_open_app_data_dir(),
		function: async () => {
			console.log(await appDataDir())
			open(await appDataDir())
		}
	}
].map((cmd) => ({ ...cmd, id: uuidv4() }))

export const fuse = new Fuse<BuiltinCmd>(rawBuiltinCmds, {
	includeScore: true,
	threshold: 0.2,
	keys: ["name", "description", "keywords"]
})

function isBuiltinCmdVisible(cmd: BuiltinCmd, developerMode: boolean) {
	return (!cmd.flags?.developer || developerMode) && (!cmd.flags?.dev || dev)
}

export const builtinCmds = derived([appConfig, appState], ([$appConfig, $appState]) => {
	const cmds = $appState.searchTerm
		? fuse.search($appState.searchTerm).map((result) => result.item)
		: rawBuiltinCmds
	return cmds.filter((cmd) => isBuiltinCmdVisible(cmd, $appConfig.developerMode))
})
