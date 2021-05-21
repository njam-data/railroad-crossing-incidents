<script context="module">
  import { getRows } from '$lib/get-rows.js'

  export async function load ({ fetch, page }) {
    const url = 'https://railroad-crossing-data.vercel.app/railroad_crossing_data/RRData.json?&_sort=StateName'
    const res = await fetch(url)
    const json = await res.json()

    if (res.ok) {
      const { rows, columns } = getRows(json)
      const rowsCount = json.filtered_table_rows_count

      let next = null
      if (json.next) {
        if (json.next.includes(',')) {
          next = json.next.split(',')[1]
        } else {
          next = json.next
        }
      } else {
        next = json.next
      }

      console.log('next', next)
      return {
        props: {
          rows,
          columns,
          next,
          rowsCount
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
  export let next
  export let rowsCount

  let loaded = true
  let currentPage = 1

  let selectedView = $page.query.get('view') || 'map'

  async function requestRows (queryObject) {
    loaded = false
    const { sort, filters } = queryObject

    const nextFragment = next ? `_next=${next}` : ''

    let sortFragment = ''
    if (sort.column) {
      sortFragment = `_sort${sort.order === 'DESC' ? '_desc' : ''}=${sort.column}`
    }

    const filterFragments = []
    if (filters.length) {
      for (const filter of filters) {
        if (filter.column === 'StateName') {
          filterFragments.push(
            `StateName__exact=${filter.value}`
          )
        } else if (filter.column === 'CountyName') {
          filterFragments.push(
            `CountyName__like=${filter.value}`
          )
        } else if (filter.column === 'CityName') {
          filterFragments.push(
            `CityName__like=${filter.value}`
          )
        }
      }
    }

    const queryFragments = [
      nextFragment,
      ...filterFragments,
      sortFragment
    ]

    const querystring = queryFragments.join('&')
    const url = `https://railroad-crossing-data.vercel.app/railroad_crossing_data/RRData.json?${querystring}`
    const res = await fetch(url)
    const json = await res.json()
    const obj = getRows(json)
    rows = [...obj.rows]
    columns = [...obj.columns]
    rowsCount = json.filtered_table_rows_count
    const firstRowId = json.rows[0][0]

    if (json.next) {
      if (json.next.includes(',')) {
        next = json.next.split(',')[1]
      } else {
        next = json.next
      }
    } else {
      next = json.next
    }

    loaded = true
  }

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

  async function onListQuery (e) {
    next = null
    currentPage = 1
    await requestRows(e.detail)
  }

  async function onNextPage (e) {
    console.log('next')
    currentPage = currentPage + 1
    await requestRows(e.detail)
  }

  async function onPreviousPage (e) {
    console.log('previous')
    next = next - 200
    if (next < 0) {
      next = null
      currentPage = 1
    }
    currentPage = currentPage - 1
    await requestRows(e.detail)
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
  <script src='https://api.mapbox.com/mapbox-gl-js/v2.2.0/mapbox-gl.js'></script>
	<link href='https://api.mapbox.com/mapbox-gl-js/v2.2.0/mapbox-gl.css' rel='stylesheet' />
  <script src="https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v4.7.0/mapbox-gl-geocoder.min.js"></script>
  <link rel="stylesheet" href="https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v4.7.0/mapbox-gl-geocoder.css" type="text/css">
</svelte:head>

<div class="flex flex-col h-screen border border-gray-100  max-w-screen-lg mx-auto">
  <div class="flex-none p-4">
    <h1 class="font-bold text-gray-600">Railroad Crossing Incidents</h1>
  </div>

  <div class="flex-none block">
    <nav class="relative z-0 shadow flex divide-x divide-gray-200 border-t border-gray-100 border-" aria-label="Tabs">
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
      <span>Locations</span>
      <span
        aria-hidden="true"
        class="
          { selectedView === 'list' ? 'bg-njam-green' : 'group-hover:bg-gray-300' }
          absolute inset-x-0 bottom-0 h-0.5
        "
      ></span>
    </button>

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
    <div class="p-4 pb-12 h-full bg-gray-50">
      <div class="bg-white border h-full border-gray-200 rounded-md shadow">
        <List
          {rows}
          {columns}
          {next}
          {rowsCount}
          {loaded}
          {currentPage}
          on:query={onListQuery}
          on:nextPage={onNextPage}
          on:previousPage={onPreviousPage}
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
    Story by <a href="https://twitter.com/PaytonGuion" target="_blank" class="underline">Payton Guion</a>. Graphics by <a href="https://twitter.com/sethdvincent" target="_blank" class="underline">Seth Vincent</a>. <br class="sm:hidden">Data from the <a href="https://railroads.dot.gov" target="_blank" class="underline">Federal Railroad Administration</a>.
  </div>
</div>
