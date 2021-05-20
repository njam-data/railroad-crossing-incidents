<script>
  import { onMount, setContext } from 'svelte'
  import { mapKey, mapboxKey } from '$lib/keys.js'
  import { njMapState } from '$lib/stores.js'

  import Legend from '$components/legend-scale.svelte'

  let container
  let map
  let mapbox
  let selectedProperty = 'accidents'
  let selectedFeature = null

  const legendTitles = {
    accidents: 'Number of accidents',
    injured: 'Number of accidents with injuries',
    killed: 'Number of accidents with fatalities'
  }

  $: legendTitle = legendTitles[selectedProperty]

  setContext(mapKey, {
    getMap: () => map
  })

  setContext(mapboxKey, {
    getMapbox: () => mapbox
  })

  const scale = [
    [ 0, '#fcde9c'],
    [ 15, '#faa476'],
    [ 30, '#f0746e'],
    [ 45, '#e34f6f'],
    [ 60, '#dc3977'],
    [ 75, '#b9257a'],
    [ 90, '#7c1d6f']
  ]

  function selectProperty (prop) {
    selectedProperty = prop
    map.setPaintProperty('county_totals', 'fill-color', {
      property: selectedProperty,
      stops: scale
    })
  }

  onMount(async () => {
    mapbox = window.mapboxgl
    mapbox.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN

    map = new mapbox.Map({
      container,
      style: 'mapbox://styles/mapbox/light-v10',
      center: $njMapState.lngLat,
      zoom: $njMapState.zoom,
      minZoom: 7,
      maxZoom: 14
    })

    map.on('load', () => {
      map.resize()

      map.addSource('county_totals', {
        type: 'vector',
        tiles: ['https://njam-tiles.s3.amazonaws.com/railroad-crossing-incident-totals/counties/{z}/{x}/{y}.pbf']
      })

      map.addLayer({
        id: 'county_totals',
        type: 'fill',
        source: 'county_totals',
        'source-layer': 'county_totals',
        'layout': {},
        'paint': {
          'fill-color': {
            property: selectedProperty,
            stops: [
              [ 0, '#fcde9c'],
              [ 15, '#faa476'],
              [ 30, '#f0746e'],
              [ 45, '#e34f6f'],
              [ 60, '#dc3977'],
              [ 75, '#b9257a'],
              [ 90, '#7c1d6f']
            ]
          },
          'fill-opacity': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            1,
            0.8
          ]
        }
      })

      map.addLayer({
        id: 'county_totals_lines',
        type: 'line',
        source: 'county_totals',
        'source-layer': 'county_totals',
        'layout': {},
        'paint': {
          'line-color': '#444',
          'line-width': 2
        }
      })
    })

    map.on('mousemove', 'county_totals', function (e) {
      map.getCanvas().style.cursor = 'pointer'
    })

    map.on('mouseleave', 'county_totals', function () {
      map.getCanvas().style.cursor = ''
    })

    map.on('click', async function (e) {
      const features = map.queryRenderedFeatures(e.point)
      selectedFeature = features.find((feature) => {
        return feature.layer.id === 'county_totals'
      })
    })

    return () => {
      map = null
    }
  })
</script>

<div bind:this={container} class="flex-grow z-0 h-full">
  {#if map}
    <slot></slot>
  {/if}

  <div class="absolute z-10 flex flex-col sm:flex-row shadow-sm rounded-md top-2 left-2">
    <button
      type="button"
      on:click={() => { selectProperty('accidents') }}
      class:selected="{selectedProperty === 'accidents'}"
      class="
        relative
        inline-flex
        items-center
        px-4
        py-2
        rounded-t-md
        sm:rounded-l-md
        sm:rounded-tr-none
        border
        border-gray-300
        bg-white
        text-sm
        font-medium
        text-gray-700
        hover:bg-gray-50
        focus:z-10
        focus:outline-none
        focus:ring-1
        focus:ring-indigo-500
        focus:border-indigo-500
      "
    >
      Accidents
    </button>
    <button
      type="button"
      on:click={() => { selectProperty('killed') }}
      class:selected="{selectedProperty === 'killed'}"
      class="
        sm:-ml-px
        relative
        inline-flex
        items-center
        px-4
        py-2
        border
        border-gray-300
        bg-white
        text-sm
        font-medium
        text-gray-700
        hover:bg-gray-50
        focus:z-10
        focus:outline-none
        focus:ring-1
        focus:ring-indigo-500
        focus:border-indigo-500
      "
    >
      Killed
    </button>
    <button
      type="button"
      on:click={() => { selectProperty('injured') }}
      class:selected="{selectedProperty === 'injured'}"
      class="
        sm:-ml-px
        relative
        inline-flex
        items-center
        px-4
        py-2
        rounded-b-md
        sm:rounded-r-md
        sm:rounded-bl-none
        border
        border-gray-300
        bg-white
        text-sm
        font-medium
        text-gray-700
        hover:bg-gray-50
        focus:z-10
        focus:outline-none
        focus:ring-1
        focus:ring-indigo-500
        focus:border-indigo-500
      "
    >
      Injured
    </button>
  </div>

  <Legend scale={scale} title={legendTitle} />

  {#if selectedFeature}
  <div class="bg-white shadow overflow-hidden rounded-md absolute top-4 right-0 mr-4 w-1/2 lg:w-1/3 pb-2">
    <div class="px-4 py-4 sm:px-6">
      <h3 class="text-2xl leading-6 font-bold text-gray-900 pb-2 mb-2 border-b border-gray-100">
        {selectedFeature.properties.name}
      </h3>
      <p class="font-bold my-0 py0 max-w-2xl text-lg text-gray-600">
        {selectedFeature.properties.accidents} <span class="font-normal">Accidents</span>
      </p>
      <p class="font-bold my-0 py0 max-w-2xl text-lg text-gray-600">
        {selectedFeature.properties.killed} <span class="font-normal">Killed</span>
      </p>
      <p class="font-bold my-0 py0 max-w-2xl text-lg text-gray-600">
        {selectedFeature.properties.injured} <span class="font-normal">Injured</span>
      </p>
    </div>
  </div>
  {/if}
</div>
