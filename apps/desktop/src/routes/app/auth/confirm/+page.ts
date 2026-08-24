import * as m from "@/paraglide/messages"
import { error } from "@sveltejs/kit"
import type { PageLoad } from "./$types"

export const load: PageLoad = async ({ params, url }) => {
	const code = url.searchParams.get("code")
	if (!code) {
		throw error(400, m.auth_exchange_code_required())
	}
	return { params, code }
}
