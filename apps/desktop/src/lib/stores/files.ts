import { fileSearch } from "@kksh/api/commands"
import * as path from "@tauri-apps/api/path"
import { stat } from "@tauri-apps/plugin-fs"
import { derived, get, writable } from "svelte/store"
import { appConfig } from "./appConfig"
import { appState } from "./appState"

export type FileSearchResult = {
	path: string
	name: string
	parent: string
	isDirectory: boolean
}

const MIN_QUERY_LENGTH = 2
const MAX_RESULTS = 30
const SEARCH_DEBOUNCE_MS = 250

async function toResult(filePath: string): Promise<FileSearchResult | null> {
	try {
		const metadata = await stat(filePath)
		return {
			path: filePath,
			name: await path.basename(filePath),
			parent: await path.dirname(filePath),
			isDirectory: metadata.isDirectory
		}
	} catch (err) {
		console.warn(`Failed to stat file search result: ${filePath}`, err)
		return null
	}
}

async function searchFiles(query: string): Promise<FileSearchResult[]> {
	const locations = get(appConfig).appSearchPaths
	if (query.trim().length < MIN_QUERY_LENGTH || locations.length === 0) {
		return []
	}
	const perLocationLimit = Math.max(5, Math.ceil(MAX_RESULTS / locations.length))
	const resultPaths = await Promise.all(
		locations.map((location) =>
			fileSearch({
				locations: [location.path],
				query,
				depth: location.depth,
				limit: perLocationLimit,
				hidden: false,
				ignore_case: true
			}).catch((err) => {
				console.warn(`File search failed in ${location.path}`, err)
				return []
			})
		)
	)
	const uniquePaths = Array.from(new Set(resultPaths.flat())).slice(0, MAX_RESULTS)
	const results = await Promise.all(uniquePaths.map(toResult))
	return results.filter((result): result is FileSearchResult => result !== null)
}

function createFileSearchStore() {
	const store = writable<FileSearchResult[]>([])
	let timer: ReturnType<typeof setTimeout> | undefined
	let searchId = 0

	derived([appState, appConfig], ([$appState]) => $appState.searchTerm).subscribe((term) => {
		const currentSearchId = ++searchId
		if (timer) {
			clearTimeout(timer)
		}
		const query = term.trim()
		if (query.length < MIN_QUERY_LENGTH) {
			store.set([])
			return
		}
		timer = setTimeout(() => {
			searchFiles(query).then((results) => {
				if (currentSearchId === searchId) {
					store.set(results)
				}
			})
		}, SEARCH_DEBOUNCE_MS)
	})

	return {
		...store,
		search: async (query = get(appState).searchTerm) => {
			const currentSearchId = ++searchId
			const results = await searchFiles(query)
			if (currentSearchId === searchId) {
				store.set(results)
			}
			return results
		}
	}
}

export const filesFiltered = createFileSearchStore()
