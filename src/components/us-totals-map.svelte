<script>
  import { onMount, setContext, createEventDispatcher } from 'svelte'
  import createBbox from '@turf/bbox'

  import { mapKey, mapboxKey } from '$lib/keys.js'
  import { usMapState } from '$lib/stores.js'

  import Legend from '$components/legend-scale.svelte'

  const dispatch = createEventDispatcher()

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

  const scales = {
    accidents: [
      [0, '#fcde9c'],
      [500, '#faa476'],
      [1000, '#f0746e'],
      [2000, '#e34f6f'],
      [4000, '#dc3977'],
      [8000, '#b9257a'],
      [16000, '#7c1d6f']
    ],
    injured: [
      [0, '#fcde9c'],
      [250, '#faa476'],
      [500, '#f0746e'],
      [750, '#e34f6f'],
      [1000, '#dc3977'],
      [1250, '#b9257a'],
      [1500, '#7c1d6f']
    ],
    killed: [
      [0, '#fcde9c'],
      [825, '#faa476'],
      [1750, '#f0746e'],
      [2625, '#e34f6f'],
      [3500, '#dc3977'],
      [4375, '#b9257a'],
      [6175, '#7c1d6f']
    ]
  }

  $: legendTitle = legendTitles[selectedProperty]
  $: scale = scales[selectedProperty]

  function selectProperty (prop) {
    console.log('prop', prop)
    selectedProperty = prop
    const stops = scale

    map.setPaintProperty('state_totals', 'fill-color', {
      property: selectedProperty,
      stops
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

    class SpacingControl {
      onAdd(map){
        this.map = map
        this.container = document.createElement('div')
        this.container.style.display = 'block'
        this.container.style.height = '2.75rem'
        this.container.style.width = '2.75rem'
        return this.container
      }

      onRemove(){
        this.container.parentNode.removeChild(this.container)
        this.map = undefined
      }
    }

    map.addControl(
      new SpacingControl(),
      'top-left'
    )

    map.addControl(new mapbox.NavigationControl(), 'top-left')

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
            0.7
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
          'line-width': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            3,
            1
          ]
        }
      })
    })

    let hoverFeatureId = null

    function setHoverState ({ featureId, state }) {
      map.setFeatureState({
        id: featureId,
        source: 'county_totals',
        sourceLayer: 'county_totals',
      }, {
        hover: state
      })
    }

    map.on('mousemove', function (e) {
      let features = map.queryRenderedFeatures(e.point, {
        layers: ['state_totals']
      })

      const feature = features[0]

      if (!feature) {
        map.getCanvas().style.cursor = ''
        if (hoverFeatureId) {
          setHoverState({
            featureId: hoverFeatureId,
            state: false
          })
          hoverFeatureId = null
        }
        return 
      }


      map.getCanvas().style.cursor = 'pointer';

      if (feature && feature.id === hoverFeatureId) {
        return
      }

      if (hoverFeatureId) {
        setHoverState({
          featureId: hoverFeatureId,
          state: false
        })
      }

      hoverFeatureId = feature.id

      setHoverState({
        featureId: feature.id,
        state: true
      })
    })

    map.on('mouseleave', 'state_totals', function () {
      map.getCanvas().style.cursor = ''
    })

    map.on('click', async function (e) {
      const features = map.queryRenderedFeatures(e.point)
      selectedFeature = features.find((feature) => {
        return feature.layer.id === 'state_totals'
      })
    })

    return () => {
      map = null
    }
  })

  function onViewClick () {
    const bbox = createBbox(selectedFeature)
    console.log('onViewClick bbox', bbox)
    dispatch('viewLocation', {
      bbox
    })
  }
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

  <div class="z-10 bg-white shadow overflow-hidden rounded-md absolute top-2 right-0 mr-2 w-1/2 lg:w-1/3 pb-2">
    <div class="p-4 sm:px-6">
      {#if selectedFeature}
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

      <button
          on:click={onViewClick}
          class="mt-2 mr-2 inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          View crossings in {selectedFeature.properties.name}
      </button>
      {:else}
      <h3 class="text-2xl leading-6 font-bold text-gray-900 pb-2 mb-2 border-b border-gray-100">
        Railroad crossing accidents in U.S. states
      </h3>
      <p class="font-medium my-0 py0 max-w-2xl text-lg text-gray-600">
        Click states to see the total railroad crossing crashes, deaths and injuries. For more information on specific crossings, see the database and interactive map.
      </p>
      {/if}
    </div>
  </div>
</div>
