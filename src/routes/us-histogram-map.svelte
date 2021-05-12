<script>
  import { onMount } from 'svelte';
  import { sendHeightOnPoll } from '@newswire/frames'
	import Map from '$components/muni-map.svelte'
  import Credit from '$components/credit.svelte'

	onMount(async () => {
		sendHeightOnPoll()
	})
</script>

<svelte:head>
	<script src='https://api.mapbox.com/mapbox-gl-js/v2.2.0/mapbox-gl.js'></script>
	<link href='https://api.mapbox.com/mapbox-gl-js/v2.2.0/mapbox-gl.css' rel='stylesheet' />
	<title>N.J. town by town COVID cases</title>
</svelte:head>

<div class="max-w-screen-lg m-auto flex flex-col h-full min-h-[1000px] pt-6">
	<Map></Map>
	<Credit />
</div>
