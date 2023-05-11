<script lang="ts">
	import { page } from '$app/stores';
</script>

<div class="text-center">
	{#if $page.status == 404}
		<h2>Oh no! Esta entrada no existe en nuestro servidor</h2>
		<p>¿Estás seguro que es el link correcto?</p>
	{:else if $page.status == 409}
		<h2>No se encontró la fiesta en el servidor</h2>
		<p>Por favor, contacta al administrador de la fiesta si crees que es un error</p>
	{:else if $page.status == 410}
		<h2>Esta entrada ya fue usada</h2>
	{/if}
</div>

<h3 class="text-center">{$page.status}: {$page.error?.message || 'Unknown error'}</h3>
