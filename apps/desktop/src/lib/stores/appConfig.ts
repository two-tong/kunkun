import { getExtensionsFolder } from "@/constants"
import * as m from "@/paraglide/messages"
import type { SearchPath } from "@kksh/api/models"
import { updateTheme, type ThemeConfig } from "@kksh/svelte5"
import { LoadingAnimation, PersistedAppConfig, type AppConfigState } from "@kksh/types"
import { debug, error, info } from "@tauri-apps/plugin-log"
import * as os from "@tauri-apps/plugin-os"
import { load } from "@tauri-apps/plugin-store"
import { Store } from "@tauri-store/svelte"
import { browser } from "$app/environment"
import { resetMode, setMode } from "mode-watcher"
import { toast } from "svelte-sonner"
import { get, writable } from "svelte/store"
import * as v from "valibot"

export const defaultAppConfig: AppConfigState = {
	isInitialized: false,
	platform: "macos",
	language: "zh",
	theme: {
		theme: "zinc",
		radius: 0.5,
		lightMode: "auto"
	},
	triggerHotkey: null,
	showInTray: true,
	devExtensionPath: null,
	extensionsInstallDir: undefined,
	hmr: false,
	hideOnBlur: true,
	extensionAutoUpgrade: true,
	joinBetaProgram: false,
	onBoarded: false,
	developerMode: false,
	appSearchPaths: [],
	loadingAnimation: "kunkun-dancing"
}

export const appConfigLoaded = writable(false)

function applyTheme(theme: ThemeConfig) {
	updateTheme(theme)
	if (!browser) {
		return
	}
	if (theme.lightMode === "auto") {
		resetMode()
		return
	}
	setMode(theme.lightMode)
}

interface AppConfigAPI {
	init: () => Promise<void>
	get: () => AppConfigState
	setTheme: (theme: ThemeConfig) => void
	setDevExtensionPath: (devExtensionPath: string | null) => void
	setTriggerHotkey: (triggerHotkey: string[]) => void
	setOnBoarded: (onBoarded: boolean) => void
	setLanguage: (language: string) => void
	addAppSearchPath: (appSearchPath: SearchPath) => void
	removeAppSearchPath: (appSearchPath: SearchPath) => void
}

class AppConfigStore extends Store<AppConfigState> implements AppConfigAPI {
	private startPromise: Promise<void> | null = null

	constructor() {
		super("app-config", defaultAppConfig, {
			saveOnChange: true
		})
		if (browser) {
			this.startPromise = this.startStore()
		}
	}

	private async startStore() {
		try {
			await this.start()
		} catch (err) {
			error(`Failed to start app config store: ${err instanceof Error ? err.message : String(err)}`)
			toast.error(m.config_store_start_failed(), {
				description: err instanceof Error ? err.message : String(err)
			})
		}
	}

	private async ensureStarted() {
		if (!browser) {
			return
		}
		this.startPromise ??= this.startStore()
		await this.startPromise
	}

	async init() {
		debug("Initializing app config")
		await this.ensureStarted()
		const extensionsInstallDir = await getExtensionsFolder()
		const config = this.get()
		applyTheme(config.theme as ThemeConfig)
		this.update((config) => ({
			...config,
			isInitialized: true,
			platform: os.platform(),
			extensionsInstallDir
		}))
		appConfigLoaded.set(true)
	}

	get() {
		return get(this)
	}
	setTheme(theme: ThemeConfig) {
		applyTheme(theme)
		this.update((config) => ({ ...config, theme }))
	}
	setDevExtensionPath(devExtensionPath: string | null) {
		info(`setDevExtensionPath ${devExtensionPath}`)
		this.update((config) => ({ ...config, devExtensionPath }))
	}
	setTriggerHotkey(triggerHotkey: string[]) {
		this.update((config) => ({ ...config, triggerHotkey }))
	}
	setOnBoarded(onBoarded: boolean) {
		this.update((config) => ({ ...config, onBoarded }))
	}
	setLanguage(language: string) {
		this.update((config) => ({ ...config, language }))
	}
	addAppSearchPath(appSearchPath: SearchPath) {
		this.update((config) => ({
			...config,
			appSearchPaths: [...config.appSearchPaths, appSearchPath]
		}))
	}
	removeAppSearchPath(appSearchPath: SearchPath) {
		this.update((config) => ({
			...config,
			appSearchPaths: config.appSearchPaths.filter((path) => path.path !== appSearchPath.path)
		}))
	}
	setLoadingAnimation(loadingAnimation: LoadingAnimation) {
		this.update((config) => ({ ...config, loadingAnimation }))
	}
}

// export const appConfig = createAppConfig()
export const appConfig = new AppConfigStore()
