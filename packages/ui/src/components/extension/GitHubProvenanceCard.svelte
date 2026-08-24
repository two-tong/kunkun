<script lang="ts">
	import { Card } from "@kksh/svelte5"
	import { BadgeCheckIcon } from "lucide-svelte"

	let {
		repoOwner,
		repoName,
		githubActionInvocationId,
		commit,
		rekorLogIndex,
		workflowPath,
		labels = {
			builtSignedOn: "Built and signed on",
			viewBuildSummary: "View build summary",
			sourceCommit: "Source Commit",
			buildFile: "Build File",
			publicLedger: "Public Ledger",
			transparencyLog: "Transparency log entry",
			mirror: "Mirror",
			mirrorRepo: "Mirror Repo"
		}
	}: {
		repoOwner: string
		repoName: string
		githubActionInvocationId: string
		commit: string
		rekorLogIndex: string
		workflowPath: string
		labels?: {
			builtSignedOn: string
			viewBuildSummary: string
			sourceCommit: string
			buildFile: string
			publicLedger: string
			transparencyLog: string
			mirror: string
			mirrorRepo: string
		}
	} = $props()
	const workflowRunId = githubActionInvocationId.split("/").at(-3)
	const workflowRunUrl = `https://github.com/${repoOwner}/${repoName}/actions/runs/${workflowRunId}/workflow`
	const giteaMirrorUrl = `https://gitea.kunkun.sh/kunkun-extensions-mirror/${repoOwner}-${repoName}`
</script>

<Card.Root>
	<Card.Content class="flex flex-col items-center justify-between space-x-4 md:flex-row">
		<div class="flex w-60 items-center space-x-4">
			<BadgeCheckIcon class="h-8 w-8 text-green-500" />
			<div>
				<span class="text-sm text-gray-800 dark:text-gray-200">{labels.builtSignedOn}</span>
				<h1 class="text-xl font-bold">GitHub Actions</h1>
				<a href={githubActionInvocationId} class="text-sm underline" target="_blank">
					{labels.viewBuildSummary}
				</a>
			</div>
		</div>
		<div>
			<p class="flex flex-col text-sm sm:flex-row">
				<strong class="mt-2 inline-block w-28 md:mt-0">{labels.sourceCommit}</strong>
				<a
					href={`https://github.com/${repoOwner}/${repoName}/tree/${commit}`}
					target="_blank"
					rel="noreferrer"
					class="font-mono underline"
				>
					github.com/{repoOwner}/{repoName}/{commit.slice(0, 8)}
				</a>
			</p>
			<p class="flex flex-col text-sm sm:flex-row">
				<strong class="mt-2 inline-block w-28 md:mt-0">{labels.buildFile}</strong>
				<a href={workflowRunUrl} target="_blank" rel="noreferrer" class="font-mono underline">
					{workflowPath}
				</a>
			</p>
			<p class="flex flex-col text-sm sm:flex-row">
				<strong class="mt-2 inline-block w-28 md:mt-0">{labels.publicLedger}</strong>
				<a
					href={`https://search.sigstore.dev/?logIndex=${rekorLogIndex}`}
					target="_blank"
					rel="noreferrer"
					class="underline">{labels.transparencyLog}</a
				>
			</p>
			<p class="flex flex-col text-sm sm:flex-row">
				<strong class="mt-2 inline-block w-28 md:mt-0">{labels.mirror}</strong>
				<a href={giteaMirrorUrl} target="_blank" rel="noreferrer" class="underline">
					{labels.mirrorRepo}
				</a>
			</p>
		</div>
	</Card.Content>
</Card.Root>
