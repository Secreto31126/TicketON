<script lang="ts">
	import type { ActionData } from './$types';

	export let form: ActionData;
</script>

<form method="post" class="flex flex-col items-center w-5/6 md:w-2/5 m-auto">
	<div class="mt-4 w-full">
		<label for="email" class="block text-sm font-medium text-slate-700 ml-2">Email</label>
		<input
			type="email"
			name="email"
			id="email"
			value={form?.email ?? ''}
			required
			class="mt-1 px-3 py-2 bg-white border shadow-sm border-slate-300 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-sky-500 block w-full rounded-md sm:text-sm focus:ring-1 invalid:border-pink-500 invalid:text-pink-600 focus:invalid:border-pink-500 focus:invalid:ring-pink-500 empty:border-slate-300"
			placeholder="you@example.com"
		/>
	</div>
	<div class="flex justify-end w-full mt-6">
		<button
			type="submit"
			class="bg-sky-500 hover:bg-sky-700 px-5 py-2.5 text-sm leading-5 rounded-md font-semibold text-white"
			disabled={form?.success}
		>
			Iniciar sesión
		</button>
	</div>
	{#if form}
		{#if form?.success}
			<p>Te enviamos un mail a {form.email} para que inicies sesión</p>
			<p>Ya podés cerrar esta pestaña</p>
		{:else}
			<p>{form.error}</p>
		{/if}
	{/if}
</form>
