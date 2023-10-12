import type { BBox, Feature, Point, Position } from 'geojson'
import Supercluster from 'supercluster'
import { geoJson, LatLngBounds, LatLngBoundsExpression, type LatLngExpression } from 'leaflet'
import center from '@turf/center'

import type { ValidChildren } from './types'

function solveLatLngExp(latLng: LatLngExpression): [number, number] {
  return Array.isArray(latLng)
    ? [latLng[1], latLng[0]]
    : [latLng.lng, latLng.lat]
}

function solveLatLngBoundsExp(
  latLngBounds: LatLngBoundsExpression
): LatLngExpression {
  const bbox = Array.isArray(latLngBounds)
    ? new LatLngBounds(latLngBounds)
    : latLngBounds
  return bbox.getCenter()
}

function getCenter(layer: ValidChildren): LatLngExpression {
  if ('center' in layer.props) return layer.props.center
  if ('position' in layer.props) return layer.props.position
  if ('bounds' in layer.props) return solveLatLngBoundsExp(layer.props.bounds)
  if ('positions' in layer.props) {
    const { positions } = layer.props
    if (Array.isArray(positions[0])) {
      if (Array.isArray(positions[0][0])) {
        if (Array.isArray(positions[0][0][0])) {
          const multiPolygon = {
            type: 'MultiPolygon',
            coordinates: (positions as LatLngExpression[][][]).map((polygon) =>
              polygon.map((polyline) =>
                polyline.map((point) => solveLatLngExp(point))
              )
            ),
          }
          const featureCenter = center(multiPolygon).geometry.coordinates
          return [featureCenter[1], featureCenter[0]]
        }
        const polygon = {
          type: 'Polygon',
          coordinates: (positions as LatLngExpression[][]).map((polyline) =>
            polyline.map((point) => solveLatLngExp(point))
          ),
        }
        const featureCenter = center(polygon).geometry.coordinates
        return [featureCenter[1], featureCenter[0]]
      }
      const polyline = {
        type: 'LineString',
        coordinates: (positions as LatLngExpression[]).map((point) =>
          solveLatLngExp(point)
        ),
      }
      const featureCenter = center(polyline).geometry.coordinates
      return [featureCenter[1], featureCenter[0]]
    }
  }
  if ('data' in layer.props) {
    const safeGeoJson = geoJson(layer.props.data).toGeoJSON()
    switch (safeGeoJson.type) {
      case 'Feature': {
        const featureCenter = center(safeGeoJson).geometry.coordinates
        return [featureCenter[1], featureCenter[0]]
      }
      case 'FeatureCollection': {
        if (safeGeoJson.features.length === 0) {
          // Not ideal but it's better than throwing an error
          return [0, 0]
        }
        // TODO: Figure out this typing conflict
        const fcCenter = center(safeGeoJson as any).geometry.coordinates
        return [fcCenter[1], fcCenter[0]]
      }
      case 'GeometryCollection':
        throw new Error(
          '[react-leaflet-supercluster] GeometryCollection is not currently supported'
        )
    }
  }
  if (process.env.NODE_ENV === 'development') {
    console.error(
      `[react-leaflet-supercluster] Invalid child: ${JSON.stringify(
        layer.props
      )}`
    )
  }
  throw new Error(`Invalid child: ${layer.key}`)
}

export function createFeatures(
  children: ValidChildren | ValidChildren[]
): Feature<Point>[] {
  return (Array.isArray(children) ? children : [children])
    .filter(({ props }) => {
      const valid =
        'center' in props ||
        'position' in props ||
        'positions' in props ||
        'bounds' in props ||
        'data' in props
      if (!valid && process.env.NODE_ENV === 'development') {
        console.warn(
          `[react-leaflet-supercluster] Invalid child was filtered out: ${props}`
        )
      }
      return valid
    })
    .map((child, id) => {
      const latLngExp = getCenter(child)
      return {
        type: 'Feature',
        properties: {
          id,
        },
        geometry: {
          type: 'Point',
          coordinates: solveLatLngExp(latLngExp),
        },
      }
    })
}

export function getMapBbox(map: L.Map): BBox {
  const bounds = map.getBounds()
  return [
    bounds.getWest(),
    bounds.getSouth(),
    bounds.getEast(),
    bounds.getNorth(),
  ]
}

export function processFeatures(
  map: L.Map,
  superCluster: InstanceType<typeof Supercluster>,
  features: ReturnType<typeof createFeatures>
) {
  superCluster.load(features)

  const bbox = getMapBbox(map)
  const zoom = map.getZoom()

  const rawClusters = superCluster.getClusters(bbox, zoom)

  const clusters: typeof rawClusters = []
  const markers: Set<number> = new Set()

  for (let i = 0; i < rawClusters.length; i += 1) {
    const cluster = rawClusters[i]
    if (cluster.properties?.cluster) {
      clusters.push(cluster)
    } else if (typeof cluster.properties?.id === 'number') {
      markers.add(cluster.properties.id)
    }
  }

  return { clusters, markers }
}
