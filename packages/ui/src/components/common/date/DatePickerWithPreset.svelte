<script lang="ts">
	import { DateFormatter, getLocalTimeZone, today, type DateValue } from "@internationalized/date"
	import { Button, ButtonModule, Calendar, Popover, Select } from "@kksh/svelte5"
	import { cn } from "@kksh/ui/utils"
	import CalendarIcon from "lucide-svelte/icons/calendar"

	const df = new DateFormatter("en-US", {
		dateStyle: "long"
	})

	let {
		date = $bindable(),
		dateValue = $bindable(),
		class: className,
		value = $bindable(),
		labels = {
			pickDate: "Pick a date",
			today: "Today",
			tomorrow: "Tomorrow",
			inDays: (count: number) => `In ${count} days`,
			inWeek: "In a week"
		}
	}: {
		date?: Date
		dateValue?: DateValue
		class?: string
		value?: string
		labels?: {
			pickDate: string
			today: string
			tomorrow: string
			inDays: (count: number) => string
			inWeek: string
		}
	} = $props()
	const valueString = $derived(dateValue ? df.format(dateValue.toDate(getLocalTimeZone())) : "")
	$effect(() => {
		value = dateValue ? dateValue.toString() : ""
		if (dateValue) {
			date = dateValue?.toDate(getLocalTimeZone())
		}
	})
	const items = [
		{ value: 0, label: labels.today },
		{ value: 1, label: labels.tomorrow },
		{ value: 3, label: labels.inDays(3) },
		{ value: 7, label: labels.inWeek }
	]
</script>

<Popover.Root>
	<Popover.Trigger
		class={cn(
			ButtonModule.buttonVariants({
				variant: "outline",
				class: "w-[280px] justify-start text-left font-normal"
			}),
			!dateValue && "text-muted-foreground",
			className
		)}
	>
		<CalendarIcon class="mr-2 size-4" />
		{dateValue ? df.format(dateValue.toDate(getLocalTimeZone())) : labels.pickDate}
	</Popover.Trigger>
	<Popover.Content class="flex w-auto flex-col space-y-2 p-2">
		<Select.Root
			type="single"
			value={valueString}
			controlledValue
			onValueChange={(v: string) => {
				if (!v) return
				dateValue = today(getLocalTimeZone()).add({ days: Number.parseInt(v) })
			}}
		>
			<Select.Trigger>
				{valueString}
			</Select.Trigger>
			<Select.Content>
				{#each items as item}
					<Select.Item value={`${item.value}`}>{item.label}</Select.Item>
				{/each}
			</Select.Content>
		</Select.Root>
		<div class="rounded-md border">
			<Calendar.Calendar type="single" bind:value={dateValue} />
		</div>
	</Popover.Content>
</Popover.Root>
