<script lang="ts">
	import { page } from '$app/stores';
</script>

{#if $page.status == 404}
	<h2>Oh no! Esta entrada no existe en nuestro servidor</h2>
	<p>¿Estás seguro que es el link correcto?</p>
{/if}

<h3 class="text-center">{$page.status}: {$page.error?.message || 'Unknown error'}</h3>
