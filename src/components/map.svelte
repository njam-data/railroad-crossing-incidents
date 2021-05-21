<script>
  import { onMount, setContext } from 'svelte'
  import { mapKey, mapboxKey } from '$lib/keys.js'
  import { njMapState } from '$lib/stores.js'

  import CheckIcon from '$components/icons/check.svelte'
  import QuestionIcon from '$components/icons/question.svelte'
  import XIcon from '$components/icons/x.svelte'
  import Legend from '$components/legend-points.svelte'

  export let center
  export let bbox

  let container
  let map
  let mapbox
  let selectedFeature = null
  let properties

  const points = [
    {
      color: 'red',
      description: 'Accidents'
    },
    {
      color: 'blue',
      description: 'No accidents'
    }
  ]

  const excludeProperties = [
    'id',
    'CrossingID',
    'Total Killed',
    'Total injured',
    'Number of accidents',
    'Latitude',
    'Longitude',
    'Street',
    'CityName',
    'CountyName',
    'StateName',
    'Meets federal safety guidelines'
  ]

  const labels = {
    CountyName: 'County',
    CityName: 'City',
    StateName: 'State'
  }

  $: if (selectedFeature) {
    properties = Object.keys(selectedFeature.properties)
      .filter((key) => {
        const exclude = excludeProperties.find((prop) => {
          return prop.includes(key)
        })
        return !exclude
      })
      .map((key) => {
        return {
          key,
          value: selectedFeature.properties[key]
        }
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
      center: center || $njMapState.lngLat,
      zoom: center ? 15 : $njMapState.zoom,
      minZoom: 3,
      maxZoom: 20
    })

    // map.addControl(new mapbox.Navigation())

    map.addControl(
      new MapboxGeocoder({
        accessToken: mapbox.accessToken,
        mapboxgl: mapbox
      }),
      'top-left'
    )

    map.addControl(new mapbox.NavigationControl(), 'top-left')

    map.on('load', () => {
      map.resize()

      map.addSource('railroad_crossing_incidents', {
        type: 'vector',
        tiles: ['https://njam-tiles.s3.amazonaws.com/railroad-crossing-incidents/{z}/{x}/{y}.pbf']
      })

      map.addLayer({
        id: 'railroad_crossing_incidents',
        type: 'circle',
        source: 'railroad_crossing_incidents',
        'source-layer': 'railroad_crossing_incidents',
        'layout': {},
        'paint': {
          'circle-radius': 10,// [
            // 'case',
            // ['has', 'sqrt_point_count'],
            // ['+', ['*', ['get', 'sqrt_point_count'], 1.1], 10],
            // 10
          // ],
          'circle-color': [
            'case',
            ['==', ['get', 'Number of accidents'], 0],
            'blue',
            'red'
          ],
          'circle-opacity': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            1,
            0.3
          ],
          'circle-stroke-color': 'white',
          'circle-stroke-width': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            3,
            0
          ]
        }
      })

      map.addLayer({
        id: 'railroad_crossing_incidents_count',
        type: 'symbol',
        source: 'railroad_crossing_incidents',
        'source-layer': 'railroad_crossing_incidents',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count}',
          // 'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 10
        }
      })
    })

    if (center) {
      setTimeout(() => {
        const point = map.project(center)
        const width = 10
        const height = 10
        const features = map.queryRenderedFeatures([
          [point.x - width / 2, point.y - height / 2],
          [point.x + width / 2, point.y + height / 2]
          ], {
            layers: ['railroad_crossing_incidents']
        })

        if (features.length === 1) {
          selectedFeature = features[0]
        }
      }, 1100)
    }

    if (bbox) {
      setTimeout(() => {
        map.fitBounds(bbox)
      }, 1100);
    }

    let hoverFeatureId = null

    function setHoverState ({ featureId, state }) {
      map.setFeatureState({
        id: featureId,
        source: 'railroad_crossing_incidents',
        sourceLayer: 'railroad_crossing_incidents',
      }, {
        hover: state
      })
    }

    map.on('mousemove', (e) => {
      let features = map.queryRenderedFeatures(e.point, {
        layers: ['railroad_crossing_incidents']
      })

      const feature = features[0]
console.log(feature)
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

      const properties = feature.properties
      const geometry = feature.geometry
      const coordinates = geometry.coordinates.slice();

      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }

      if (properties.point_count && properties.point_count >- 2) {
        const description = `${properties.point_count} locations`
      }
    })

    map.on('click', 'railroad_crossing_incidents', async function (e) {
      const feature = e.features[0]
      const { point_count } = feature.properties
      map.resize()

      if (point_count) {
        const zoom = map.getZoom() + 2

        map.flyTo({
          center: feature.geometry.coordinates,
          zoom
        })

        selectedFeature = null
      } else {
        selectedFeature = e.features[0]
      }
    })

    return () => {
      map = null
    }
  })
</script>

<div class="flex flex-col sm:flex-row h-full">
  <div bind:this={container} class="flex-grow z-0 h-full">
    {#if map}
      <slot></slot>
    {/if}

    <Legend {points} />
  </div>



  <div class="bg-white h-1/2 sm:w-1/2 sm:h-full md:w-96 border-gray-200 border-t sm:border-t-0 sm:border-l">
    <div class="h-full overflow-y-scroll">
    {#if selectedFeature}
      <div class="px-4 py-4 sm:px-6">
        <h3 class="text-lg leading-6 font-medium text-gray-900">
          {selectedFeature.properties.Street}
        </h3>
        <h3 class="text-md leading-6 font-medium text-gray-600 mb-2">
          {selectedFeature.properties.CityName}, {selectedFeature.properties.CountyName}, {selectedFeature.properties.StateName}
        </h3>
        <p class="font-bold my-0 pt-1 pb-3 max-w-2xl text-sm text-gray-600">
          {#if selectedFeature.properties['Meets federal safety guidelines'] === 'Yes'}
            <CheckIcon /> Meets federal safety guidelines
          {:else if selectedFeature.properties['Meets federal safety guidelines'] === 'No'}
            <XIcon /> Does not meet federal safety guidelines
          {:else}
            <QuestionIcon /> May or may not meet federal safety guidelines
          {/if}
        </p>
        <p class="font-bold my-0 py0 max-w-2xl text-lg text-gray-600">
          {selectedFeature.properties['Number of accidents']} Accidents
        </p>
        <p class="font-bold my-0 py0 max-w-2xl text-lg text-gray-600">
          {selectedFeature.properties['Total Killed']} Killed
        </p>
        <p class="font-bold my-0 py0 max-w-2xl text-lg text-gray-600">
          {selectedFeature.properties['Total injured']} Injured
        </p>
      </div>

      <div class="border-t border-gray-200 px-4 py-2 sm:py-4 sm:p-0">
        <dl class="divide-y divide-gray-200">
          {#if properties}
          {#each properties as prop}
          <div class="py-1 sm:py-2 grid grid-cols-2 gap-2 sm:px-6">
            <dt class="text-sm font-medium text-gray-500">
              {labels[prop.key] || prop.key}
            </dt>
            <dd class="text-sm text-gray-900 mt-0 col-span-1">
              {prop.value}
            </dd>
          </div>
          {/each}
          {/if}
        </dl>
      </div>
      {:else}
        <div class="px-4 py-4 sm:px-6 flex items-center h-full">
          <div class="h-40 self-center">
            <h1 class="text-2xl leading-6 font-bold text-gray-900 pb-2 mb-2 border-b border-gray-100">
              Railroad crossing incidents
            </h1>
            <p class="font-medium text-gray-700 text-xl">
              Click a crossing to see its safety data and whether it meets safety guidelines.
            </p>
            <p class="text-gray-500 mt-4">
              This data was retrieved from the Federal Railroad Administration in early April 2021 and the agency acknowledges that it might not offer a complete or accurate picture of U.S. rail crossings.
            </p>
          </div>
        </div>
      {/if}
      </div>
    </div>  
  </div>
