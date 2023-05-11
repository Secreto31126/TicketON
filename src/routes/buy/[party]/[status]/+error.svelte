<script lang="ts">
	import { page } from '$app/stores';
</script>

<div class="text-center">
	{#if (($page.status / 100) | 0) == 5}
		<p>
			Parece que hubo un error de nuestra parte. Por favor, contacta a un administrador para
			confirmar tu compra.
		</p>
	{/if}
	<h1>{$page.status}: {$page.error?.message}</h1>
</div>
