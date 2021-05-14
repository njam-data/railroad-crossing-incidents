<script context="module">
  export async function load ({ fetch, page }) {
    const url = 'https://railroad-crossing-data.vercel.app/railroad_crossing_data/RRData.json?StateName__exact=NJ&_sort=CountyName'
    const res = await fetch(url)
    const json = await res.json()
    console.log('json', json)

    const excludeColumns = [
      'rowid',
      'Latitude',
      'Longitude',
    ]

    const orderColumns = [
      'Meets minimum safety guidelines',
      'Total Killed',
      'Total injured',
      'Number of accidents',
      'Street',
      'CityName',
      'CountyName',
      'StateName',
      'Active or Passive?',
      'Distance from highway (feet)',
      'Daily trains',
      'Max train speed',
      'Gates',
      'Lights',
      'Daily traffic',
      'Last time traffic counted',
      'School buses',
      'Bus count',
      'Railroad',
      'CrossingID'
    ]

    if (res.ok) {
      const columns = ['link', ...json.columns]

      let rows = json.rows.map((row) => {
        return columns.map((column, i) => {
          const exclude = excludeColumns.find((prop) => {
            return prop.includes(column)
          })

          if (!exclude) {
            if (column === 'link') {
              return {
                key: 'Map view',
                value: [row[12], row[11]]
              }
            }

            return {
              key: column,
              value: row[i - 1]
            }
          }
        })
        .filter((column) => !!column)
        .sort((a, b) => {
          return orderColumns.indexOf(a.key) - orderColumns.indexOf(b.key)
        })
      })

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
  import { sendHeightOnPoll, sendFrameHeight } from '@newswire/frames'
  import { browser } from '$app/env'
  import { page } from '$app/stores'
  import { base } from '$app/paths';
  import { goto } from '$app/navigation'
  import Map from '$components/map.svelte'
  import List from '$components/list.svelte'
  import UsTotalsMap from '$components/us-totals-map.svelte'
  import NjTotalsMap from '$components/nj-totals-map.svelte'

  export let rows
  export let columns
  let selectedView = $page.query.get('view') || 'nj-totals'

  $: lng = $page.query.get('lng')
  $: lat = $page.query.get('lat')
  $: center = (lng & lat) ? [lng, lat] : null

  $: if (selectedView !== 'map') {
    if ($page.query.has('lng') || $page.query.has('lat')) {
      $page.query.delete('lng')
      $page.query.delete('lat')
      const queryString = $page.query.toString()

      if (browser) {
        goto(`${base}?${queryString}`)
      }
    }
  }

  if (browser) {
    sendFrameHeight(1000)
    sendHeightOnPoll(150)
  }

  async function selectView (view) {
    $page.query.set('view', view)
    selectedView = view
    const queryString = $page.query.toString()

    if (browser) {
      await goto(`${base}?${queryString}`) 
    }
  }

  function onListFilter (e) {
    console.log('filter', e)
  }

  function onListSort (e) {
    console.log('sort', e)
  }

  function onListSearch (e) {
    console.log('search', e)
  }

  function onViewLocation (e) {
    const [lng, lat] = e.detail
    $page.query.set('lng', lng)
    $page.query.set('lat', lat)
    center = [lng, lat]
    selectView('map')
  }
</script>

<svelte:head>
  <title>Railroad Crossing Incidents</title>
  <script src='https://api.mapbox.com/mapbox-gl-js/v1.13.1/mapbox-gl.js'></script>
	<link href='https://api.mapbox.com/mapbox-gl-js/v1.13.1/mapbox-gl.css' rel='stylesheet' />
  <script src="https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v4.7.0/mapbox-gl-geocoder.min.js"></script>
  <link rel="stylesheet" href="https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v4.7.0/mapbox-gl-geocoder.css" type="text/css">
</svelte:head>

<div class="flex flex-col h-screen border border-gray-100">
  <div class="flex-none p-4">
    <h1 class="font-bold text-gray-600">Railroad Crossing Incidents</h1>
  </div>

  <div class="flex-none sm:hidden p-4 pt-0">
    <label for="tabs" class="sr-only">Select a visualization</label>
    <select bind:value={selectedView} on:change={(e) => { selectView(e.target.value )}} id="tabs" name="tabs" class="block w-full focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-md">
      <option value="nj-totals">N.J. County totals</option>
      <option value="us-totals">U.S. State totals</option>
      <option value="map" selected>Map</option>
      <option value="list">List</option>
    </select>
  </div>

  <div class="flex-none hidden sm:block">
    <nav class="relative z-0 shadow flex divide-x divide-gray-200 border-t border-gray-100 border-" aria-label="Tabs">
      <button
        on:click={() => { selectView('nj-totals') }}
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
        on:click={() => { selectView('us-totals') }}
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
        on:click={() => { selectView('map') }}
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
        on:click={() => { selectView('list') }}
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

  <div class="flex-grow border-t border-gray-200 overflow-hidden">
  {#if selectedView === 'map'}
    <div class="p-4 h-full bg-gray-50">
      <div class="bg-white border h-full border-gray-200 rounded-md shadow">
        <Map center={center} />
      </div>
    </div>
  {:else if selectedView === 'list'}
    <div class="p-4 h-full bg-gray-50">
      <div class="bg-white border h-full border-gray-200 rounded-md shadow">
        <List
          rows={rows}
          columns={columns}
          on:filter={onListFilter}
          on:sort={onListSort}
          on:search={onListSearch}
          on:viewLocation={onViewLocation}
        />
      </div>
    </div>
  {:else if selectedView === 'us-totals'}
    <div class="p-4 h-full bg-gray-50">
      <div class="bg-white border h-full border-gray-200 rounded-md shadow">
        <UsTotalsMap />
      </div>
    </div>
    {:else if selectedView === 'nj-totals'}
    <div class="p-4 h-full bg-gray-50">
      <div class="bg-white border h-full border-gray-200 rounded-md shadow">
        <NjTotalsMap />
      </div>
    </div>
  {/if}
  </div>

  <div class="flex-none p-4 text-xs text-gray-500 border-t border-gray-200">
    Story by Payton Guion. Graphics by Seth Vincent. <br>Data from the Federal Railroad Administration.
  </div>
</div>
