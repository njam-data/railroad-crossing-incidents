<script context="module">
  export async function load ({ fetch }) {
    const url = 'https://railroad-crossing-data.vercel.app/railroad_crossing_data/RRData.json?StateName__exact=NJ&_sort=CountyName'
    const res = await fetch(url)
    const json = await res.json()
    console.log('json', json)
    const columns = json.columns
    const rows = json.rows.map((row) => {
      return row.reduce((arr, cell, i) => {
        arr.push({ key: columns[i], value: cell })
        return arr
      }, [])
    })

    if (res.ok) {
      return {
        props: {
          rows,
          columns
        }
      }
    }

    return {
      status: res.status,
      error: new Error('Could not load data')
    }
  }
</script>

<script>
  import Map from '$components/map.svelte'
  import List from '$components/list.svelte'
  import UsTotalsMap from '$components/us-totals-map.svelte'
  import NjTotalsMap from '$components/nj-totals-map.svelte'

  export let rows
  export let columns
  let selectedView
</script>

<svelte:head>
  <title>Railroad Crossing Incidents</title>
  <script src='https://api.mapbox.com/mapbox-gl-js/v2.2.0/mapbox-gl.js'></script>
	<link href='https://api.mapbox.com/mapbox-gl-js/v2.2.0/mapbox-gl.css' rel='stylesheet' />
</svelte:head>

<div class="flex flex-col h-screen">
  <div class="flex-none p-4">
    <h1 class="font-bold text-gray-600">Railroad Crossing Incidents</h1>
  </div>

  <div class="flex-none sm:hidden p-4 pt-0">
    <label for="tabs" class="sr-only">Select a visualization</label>
    <select bind:value={selectedView} id="tabs" name="tabs" class="block w-full focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-md">
      <option value="nj-totals" selected>N.J. County totals</option>
      <option value="us-totals">U.S. State totals</option>
      <option value="map">Map</option>
      <option value="list">List</option>
    </select>
  </div>

  <div class="flex-none hidden sm:block">
    <nav class="relative z-0 shadow flex divide-x divide-gray-200 border-t border-gray-200 border-" aria-label="Tabs">
      <button
        on:click={() => { selectedView = 'nj-totals' }}
        class="
          { selectedView === 'nj-totals' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700' }
          group relative min-w-0 flex-1 overflow-hidden bg-white py-4 px-4 text-sm font-medium text-center hover:bg-gray-50 focus:z-10
        "
        aria-current="page"
      >
        <span>N.J. Totals</span>
        <span
          aria-hidden="true"
          class="
            { selectedView === 'nj-totals' ? 'bg-njam-green' : 'group-hover:bg-gray-300' }
            absolute inset-x-0 bottom-0 h-0.5
          "
        ></span>
      </button>

      <button
        on:click={() => { selectedView = 'us-totals' }}
        class="
          { selectedView === 'us-totals' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700' }
          group relative min-w-0 flex-1 overflow-hidden bg-white py-4 px-4 text-sm font-medium text-center hover:bg-gray-50 focus:z-10
        "
        aria-current="page"
      >
        <span>U.S. Totals</span>
        <span
          aria-hidden="true"
          class="
            { selectedView === 'us-totals' ? 'bg-njam-green' : 'group-hover:bg-gray-300' }
            absolute inset-x-0 bottom-0 h-0.5
          "
        ></span>
      </button>

      <button
        on:click={() => { selectedView = 'map' }}
        class="
          { selectedView === 'map' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700' }
          group relative min-w-0 flex-1 overflow-hidden bg-white py-4 px-4 text-sm font-medium text-center hover:bg-gray-50 focus:z-10
        "
        aria-current="page"
      >
        <span>Map</span>
        <span
          aria-hidden="true"
          class="
            { selectedView === 'map' ? 'bg-njam-green' : 'group-hover:bg-gray-300' }
            absolute inset-x-0 bottom-0 h-0.5
          "
        ></span>
      </button>

      <button
        on:click={() => { selectedView = 'list' }}
        class="
          { selectedView === 'list' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700' }
          group relative min-w-0 flex-1 overflow-hidden bg-white py-4 px-4 text-sm font-medium text-center hover:bg-gray-50 focus:z-10
        "
        aria-current="page"
      >
        <span>List</span>
        <span
          aria-hidden="true"
          class="
            { selectedView === 'list' ? 'bg-njam-green' : 'group-hover:bg-gray-300' }
            absolute inset-x-0 bottom-0 h-0.5
          "
        ></span>
      </button>
    </nav>
  </div>

  <div class="flex-grow border-t border-gray-300 overflow-hidden">
  {#if selectedView === 'map'}
    <div class="p-4 h-full bg-gray-50">
      <div class="bg-white border h-full border-gray-300 rounded-md shadow">
        <Map />
      </div>
    </div>
  {:else if selectedView === 'list'}
    <div class="p-4 h-full bg-gray-50">
      <div class="bg-white border h-full border-gray-300 rounded-md shadow">
        <List rows={rows} columns={columns} />
      </div>
    </div>
  {:else if selectedView === 'us-totals'}
    <div class="p-4 h-full bg-gray-50">
      <div class="bg-white border h-full border-gray-300 rounded-md shadow">
        <UsTotalsMap />
      </div>
    </div>
    {:else if selectedView === 'nj-totals'}
    <div class="p-4 h-full bg-gray-50">
      <div class="bg-white border h-full border-gray-300 rounded-md shadow">
        <NjTotalsMap />
      </div>
    </div>
  {/if}
  </div>

  <div class="flex-none p-4 text-sm text-gray-500 border border-gray-300">
    Credits
  </div>
</div>
