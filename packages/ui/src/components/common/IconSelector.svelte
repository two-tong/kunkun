<script lang="ts">
	import { Icon, IconEnum, IconType } from "@kksh/api/models"
	import { Button, Checkbox, Label, Select, Textarea } from "@kksh/svelte5"
	import { cn } from "@kksh/ui/utils"
	import { open } from "tauri-plugin-shellx-api"
	import IconMultiplexer from "./IconMultiplexer.svelte"

	let {
		icon = $bindable<Icon>(),
		class: className,
		labels = {
			type: "Icon Type",
			value: "Icon Value",
			pickName: "Pick Iconify icon name",
			invertColor: "Invert Icon Color",
			preview: "Icon Preview"
		}
	}: {
		icon?: Icon
		class?: string
		labels?: {
			type: string
			value: string
			pickName: string
			invertColor: string
			preview: string
		}
	} = $props()
	const iconOptions: Record<string, IconType> = {
		"Remote Url": IconEnum.RemoteUrl,
		Iconify: IconEnum.Iconify,
		Svg: IconEnum.Svg,
		"Base64 PNG": IconEnum.Base64PNG
	}
	const iconOptionsArray = $derived(Object.entries(iconOptions))
	const triggerContent = $derived(
		iconOptionsArray.find(([_, value]) => value === icon.type)?.[0] ?? labels.type
	)
</script>

<div class="flex flex-col gap-2">
	<Select.Root type="single" name="icontype" bind:value={icon.type}>
		<Select.Trigger class="w-[180px]">
			{triggerContent}
		</Select.Trigger>
		<Select.Content>
			<Select.Group>
				<Select.GroupHeading>{labels.type}</Select.GroupHeading>
				{#each iconOptionsArray as [label, value]}
					<Select.Item {value}>{label}</Select.Item>
				{/each}
			</Select.Group>
		</Select.Content>
	</Select.Root>
	<Textarea bind:value={icon.value} placeholder={labels.value} />
	{#if icon.type === IconEnum.Iconify}
		<Button onclick={() => open("https://icon-sets.iconify.design/")} size="sm" variant="secondary">
			{labels.pickName}
		</Button>
	{/if}

	<div class="flex items-center space-x-2">
		<Checkbox id="terms" bind:checked={icon.invert} aria-labelledby="terms-label" />
		<Label
			id="terms-label"
			for="terms"
			class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
		>
			{labels.invertColor}
		</Label>
	</div>
	<h2 class="font-semibold">{labels.preview}</h2>
	{#if icon.type && icon.value && icon.value.length > 0}
		<IconMultiplexer class="h-12 w-12" {icon} />
	{/if}
</div>
