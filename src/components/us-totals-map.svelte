<script>
  import { onMount, setContext } from 'svelte'
  import { mapKey, mapboxKey } from '$lib/keys.js'
  import { usMapState } from '$lib/stores.js'

  let container
  let map
  let mapbox
  let selectedProperty = 'accidents'

  function selectProperty (prop) {
    console.log('prop', prop)
    selectedProperty = prop
    let stops
    if (prop === 'accidents') {
      stops = [
        [ 0, '#fcde9c'],
        [ 500, '#faa476'],
        [ 1000, '#f0746e'],
        [ 2000, '#e34f6f'],
        [ 4000, '#dc3977'],
        [ 8000, '#b9257a'],
        [ 16000, '#7c1d6f']
      ]
    } else if (prop === 'killed') {
      stops = [
        [ 0, '#fcde9c'],
        [ 250, '#faa476'],
        [ 500, '#f0746e'],
        [ 750, '#e34f6f'],
        [ 1000, '#dc3977'],
        [ 1250, '#b9257a'],
        [ 1500, '#7c1d6f']
      ]
    } else if (prop === 'injured') {
      stops = [
        [ 0, '#fcde9c'],
        [ 825, '#faa476'],
        [ 1750, '#f0746e'],
        [ 2625, '#e34f6f'],
        [ 3500, '#dc3977'],
        [ 4375, '#b9257a'],
        [ 6175, '#7c1d6f']
      ]
    }
console.log('weeeooo')
    map.setPaintProperty('state_totals', 'fill-color', {
      property: selectedProperty,
      stops: stops
    })
  }

  setContext(mapKey, {
    getMap: () => map
  })

  setContext(mapboxKey, {
    getMapbox: () => mapbox
  })

  onMount(async () => {
    mapbox = window.mapboxgl
    mapbox.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN

    map = new mapbox.Map({
      container,
      style: 'mapbox://styles/mapbox/light-v10',
      center: $usMapState.lngLat,
      zoom: $usMapState.zoom,
      minZoom: 0,
      maxZoom: 8
    })

    map.on('load', () => {
      map.resize()

      map.addSource('state_totals', {
        type: 'vector',
        tiles: ['https://njam-tiles.s3.amazonaws.com/railroad-crossing-incident-totals/states/{z}/{x}/{y}.pbf']
      })

      map.addLayer({
        id: 'state_totals',
        type: 'fill',
        source: 'state_totals',
        'source-layer': 'state_totals',
        'layout': {},
        'paint': {
          'fill-color': {
            property: selectedProperty,
            stops: [
              [ 0, '#fcde9c'],
              [ 500, '#faa476'],
              [ 1000, '#f0746e'],
              [ 2000, '#e34f6f'],
              [ 4000, '#dc3977'],
              [ 8000, '#b9257a'],
              [ 16000, '#7c1d6f']
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
        id: 'state_totals_lines',
        type: 'line',
        source: 'state_totals',
        'source-layer': 'state_totals',
        'layout': {},
        'paint': {
          'line-color': '#444',
          'line-width': 2
        }
      })
    })

    let popup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false
    })

    let hoveredStateId = null

    map.on('mouseenter', 'state_totals', function (e) {
      map.getCanvas().style.cursor = 'pointer'

      // if (e.features.length > 0) {
      //   if (hoveredStateId !== null) {
      //     map.setFeatureState(
      //       { source: 'state_totals', sourceLayer: 'state_totals', id: hoveredStateId },
      //       { hover: false }
      //     )
      //   }
      //   hoveredStateId = e.features[0].id;
      //   map.setFeatureState(
      //     { source: 'state_totals', sourceLayer: 'state_totals', id: hoveredStateId },
      //     { hover: true }
      //   )
      // }
    })

    map.on('mouseleave', 'state_totals', function () {
      map.getCanvas().style.cursor = ''
      popup.remove()
      // if (hoveredStateId !== null) {
      //   map.setFeatureState(
      //     { source: 'state_totals', sourceLayer: 'state_totals', id: hoveredStateId },
      //     { hover: false }
      //   )
      // }
      // hoveredStateId = null;
    })

    map.on('click', 'state_totals', async function (e) {
      const feature = e.features[0]
      const properties = feature.properties
      console.log('feature', feature, e)
      const coordinates = e.lngLat

      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }

      const description = `<div class="pa-4 rounded">
        <h1 class="font-bold text-xl">${properties.name}</h1>
        <ul class="text-lg">
          <li>${properties.accidents} accidents</li>
          <li>${properties.killed} killed</li>
          <li>${properties.injured} injured</li>
        </ul>
      </div>`
      popup.setLngLat(coordinates).setHTML(description).addTo(map)
    })

    return () => {
      map = null
    }
  })
</script>

<style>
  .selected {
    @apply text-gray-900 bg-gray-100;
  }
</style>

<div bind:this={container} class="flex-grow z-0 h-full">
  {#if map}
    <slot></slot>
  {/if}

  <div class="relative z-10 inline-flex shadow-sm rounded-md top-2 left-2">
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
        rounded-l-md
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
        -ml-px
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
        -ml-px
        relative
        inline-flex
        items-center
        px-4
        py-2
        rounded-r-md
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
</div>
