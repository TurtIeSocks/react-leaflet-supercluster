import * as React from 'react'
import {
  Circle,
  CircleMarker,
  MapContainer,
  Marker,
  GeoJSON,
  Polygon,
  Polyline,
  Popup,
  TileLayer,
  useMap,
  Rectangle,
} from 'react-leaflet'
import * as L from 'leaflet'
import type { FeatureCollection } from 'geojson'
import {
  randomLineString,
  randomPoint,
  randomPolygon,
  randomPosition,
} from '@turf/random'
import 'leaflet-easybutton/src/easy-button'

import { SuperClustering } from '../src'
import { getMapBbox } from '../src/features'

const markerIcon = L.icon({
  iconSize: [25, 41],
  iconAnchor: [10, 41],
  popupAnchor: [2, -40],
  iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png`,
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

function BasicPopup({ shape }: { shape: string }) {
  return <Popup>{shape}</Popup>
}

const generateMarkers = (map: L.Map, count: number) => {
  const zoom = map.getZoom()
  const bbox = getMapBbox(map)

  const randomPoints = randomPoint(count, { bbox }).features.map((point, i) => {
    const probability = Math.random()
    const position: [number, number] = [
      point.geometry.coordinates[1],
      point.geometry.coordinates[0],
    ]
    const radius = Math.floor(Math.random() * (200 - zoom * 10))
    return probability < 0.33 ? (
      <Marker key={`Point${i}`} position={position} icon={markerIcon}>
        <BasicPopup shape="Marker" />
      </Marker>
    ) : probability < 0.66 ? (
      <Circle key={`Point${i}`} center={position} radius={radius}>
        <BasicPopup shape="Circle" />
      </Circle>
    ) : (
      <CircleMarker
        key={`Point${i}`}
        center={position}
        radius={Math.floor(radius / 10)}
      >
        <BasicPopup shape="CircleMarker" />
      </CircleMarker>
    )
  })
  const randomLines = randomLineString(count / 32, {
    bbox,
    num_vertices: Math.floor(Math.random() * 10 + 4),
    max_rotation: 180,
  }).features.map((line, i) => (
    <Polyline
      key={`LineString${i}`}
      positions={line.geometry.coordinates.map((c) => [c[1], c[0]])}
    >
      <BasicPopup shape="LineString" />
    </Polyline>
  ))
  const randomRectangles = Array.from({ length: 20 - zoom }, (_, i) => {
    const swPosition = randomPosition({ bbox }).reverse() as [number, number]
    const nePosition = randomPosition({ bbox }).reverse() as [number, number]
    return (
      <Rectangle key={`Rectangle${i}`} bounds={[swPosition, nePosition]}>
        <BasicPopup shape="Rectangle" />
      </Rectangle>
    )
  })
  const randomPolygons = randomPolygon(count / 32, {
    bbox,
    max_radial_length: (zoom - 20) * 0.0001,
    num_vertices: Math.floor(Math.random() * 10 + 4),
  }).features.map((poly, i) => (
    <Polygon
      key={`Polygon${i}`}
      positions={poly.geometry.coordinates.map((c) =>
        c.map((p) => [p[1], p[0]] as [number, number])
      )}
    >
      <BasicPopup shape="Polygon" />
    </Polygon>
  ))
  return [
    ...randomPoints,
    ...randomLines,
    ...randomRectangles,
    ...randomPolygons,
  ]
}

function MarkerFactory() {
  const [markers, setMarkers] = React.useState<React.JSX.Element[]>([])
  const [geojson, setGeojson] = React.useState<FeatureCollection>({
    type: 'FeatureCollection',
    features: [],
  })
  const [regenerate, setRegenerate] = React.useState(true)
  const map = useMap()
  const easyButton = React.useRef(
    L.easyButton({
      position: 'topleft',
      states: [
        {
          icon: 'fa-solid fa-check',
          title: 'Regenerate markers on move/zoom',
          stateName: 'active',
          onClick: (btn) => {
            setRegenerate(false)
            btn.state('inactive')
          },
        },
        {
          icon: 'fa-solid fa-xmark',
          title: 'Regenerate markers on move/zoom',
          stateName: 'inactive',
          onClick: (btn) => {
            setRegenerate(true)
            btn.state('active')
          },
        },
      ],
    })
  )

  React.useEffect(() => {
    easyButton.current.addTo(map)
    const create = () => {
      const zoom = 20 - map.getZoom()
      const markerCount = zoom * zoom * 100
      const newMarkers = generateMarkers(map, markerCount)
      const bbox = getMapBbox(map)
      setMarkers(newMarkers)
      setGeojson({
        type: 'FeatureCollection',
        features: [
          ...randomPoint(zoom * 5, { bbox }).features,
          ...randomLineString(zoom / 16, {
            bbox,
            num_vertices: Math.floor(Math.random() * 10 + 4),
            max_rotation: 180,
          }).features,
          ...randomPolygon(zoom, {
            bbox,
            max_radial_length: (zoom - 20) * 0.001,
            num_vertices: Math.floor(Math.random() * 10 + 4),
          }).features,
        ],
      })
      map.attributionControl.setPrefix(
        `Markers: ${newMarkers.length.toLocaleString()}`
      )
    }
    create()

    if (regenerate) {
      map.on('zoomend', create)
      map.on('moveend', create)
    }
    return () => {
      easyButton.current.remove()
      if (regenerate) {
        map.off('zoomend', create)
        map.off('moveend', create)
      }
    }
  }, [map, regenerate])

  return (
    <SuperClustering radius={120} minPoints={10} maxZoom={17}>
      {markers}
      <GeoJSON data={geojson}>
        <BasicPopup shape="GeoJSON" />
      </GeoJSON>
    </SuperClustering>
  )
}

export default function App() {
  return (
    <MapContainer
      center={[40.777455, -73.969036]}
      style={{ width: '100%', height: '100vh' }}
      zoom={12}
    >
      <TileLayer
        attribution="Map data Â© <a href='https://www.openstreetmap.org'>OpenStreetMap</a> contributors"
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png"
        maxZoom={20}
      />
      <MarkerFactory />
    </MapContainer>
  )
}
