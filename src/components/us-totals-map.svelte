<script>
  import { onMount, setContext } from 'svelte'
  import { mapKey, mapboxKey } from '$lib/keys.js'
  import { usMapState } from '$lib/stores.js'

  let container
  let map
  let mapbox

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
          // 'circle-radius': [
          //   'case',
          //   ['has', 'sqrt_point_count'],
          //   ['-', ['get', 'sqrt_point_count'], 10],
          //   5
          // ],
          'fill-color': 'red',
          'fill-opacity': 0.3,
          'fill-opacity': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            1,
            0.5
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

<div bind:this={container} class="flex-grow z-0 h-full">
  {#if map}
    <slot></slot>
  {/if}
</div>
