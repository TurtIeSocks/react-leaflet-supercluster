import { useEffect, useMemo, useState, useRef } from 'react'
import { useMap } from 'react-leaflet'
import { marker, divIcon, point, geoJSON } from 'leaflet'

import { useSuperClustering } from './useSuperClustering'
import { createFeatures, processFeatures } from './features'
import type {
  MarkerFilterFn,
  PointToLayerFn,
  SuperClusteringProps,
} from './types'

const defaultPointToLayer: PointToLayerFn = (feature, latlng) => {
  const count = feature.properties?.point_count
  const size = count < 100 ? 'small' : count < 1000 ? 'medium' : 'large'
  const icon = divIcon({
    html: `<div><span>${feature.properties?.point_count_abbreviated}</span></div>`,
    className: `marker-cluster marker-cluster-${size}`,
    iconSize: point(40, 40),
  })
  return marker(latlng, { icon })
}

const defaultMarkerFilterFn: MarkerFilterFn = (_, i, markers) => markers[i]

export function SuperClustering({
  children,
  pointToLayer = defaultPointToLayer,
  markerFilter = defaultMarkerFilterFn,
  disableMoveEvent = false,
  disableZoomEvent = false,
  ...options
}: SuperClusteringProps) {
  const leafletMap = useMap()
  const [markers, setMarkers] = useState<boolean[]>([])
  const markerLayer = useRef(
    geoJSON(undefined, {
      pointToLayer,
    }).addTo(leafletMap)
  )

  const superCluster = useSuperClustering(options)

  const normalizedChildren = useMemo(() => {
    const flattened = Array.isArray(children)
      ? children.flatMap((child) => child)
      : [children]
    setMarkers(Array(flattened.length).fill(false))
    return flattened
  }, [children])

  useEffect(() => {
    const renderLayers = () => {
      markerLayer.current.clearLayers()
      const features = createFeatures(normalizedChildren)
      const { clusters, markers } = processFeatures(
        leafletMap,
        superCluster,
        features
      )
      // TODO: PR to @types/leaflet?
      markerLayer.current.addData(clusters as any)
      setMarkers((prev) => prev.map((_, i) => markers.has(i)))
    }
    renderLayers()
    if (!disableZoomEvent) leafletMap.on('zoomend', renderLayers)
    if (!disableMoveEvent) leafletMap.on('moveend', renderLayers)
    return () => {
      if (!disableZoomEvent) leafletMap.off('zoomend', renderLayers)
      if (!disableMoveEvent) leafletMap.off('moveend', renderLayers)
    }
  }, [
    leafletMap,
    normalizedChildren,
    superCluster,
    disableMoveEvent,
    disableZoomEvent,
  ])

  return superCluster
    ? normalizedChildren.filter((x, i) => markerFilter(x, i, markers))
    : normalizedChildren
}
