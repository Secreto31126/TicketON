<script lang="ts">
	import type { PageData, ActionData } from './$types';

	export let data: PageData;
	export let form: ActionData;

	// let camera = false;
</script>

<form class="flex flex-col items-center" method="POST">
	<!-- Party -->
	<select name="party" value={form?.party ?? ''}>
		{#each data.parties as { name, slug }}
			<option value={slug}>{name}</option>
		{/each}
	</select>
	<!-- Camera -->
	<button on:click={() => alert('Not implemented yet')}>Activar cámara</button>
	<!-- String -->
	<input type="text" name="ticket" value={form?.id ?? ''} />
	<!-- Submit -->
	<button type="submit">Verificar</button>
</form>

{#if form}
	{#if form.success}
		<p class="text-green-600">¡Bienvenido!</p>
	{:else}
		<p class="text-red-600">{form.message}</p>
	{/if}
{/if}
