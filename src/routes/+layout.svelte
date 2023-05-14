<script>
	import '../app.css';
	import { inject } from '@vercel/analytics';

	inject({ mode: import.meta.env.DEV ? 'development' : 'production' });
</script>

<div class="w-screen h-full overflow-x-hidden">
	<slot />
</div>
