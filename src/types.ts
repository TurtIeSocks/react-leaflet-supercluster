import type { Options, PointFeature, ClusterFeature } from 'supercluster'
import type { GeoJsonProperties } from 'geojson'
import type {
  CircleProps,
  GeoJSONProps,
  MarkerProps,
  PolygonProps,
  PolylineProps,
  RectangleProps,
} from 'react-leaflet'
import type { LatLng, Layer } from 'leaflet'
import type { ReactElement } from 'react'

type MarkerEl = ReactElement<{
  position: MarkerProps['position']
}>
type CircleEl = ReactElement<{
  center: CircleProps['center']
}>
type PolylineEl = ReactElement<{
  positions: PolylineProps['positions']
}>
type RectangleEl = ReactElement<{
  bounds: RectangleProps['bounds']
}>
type PolygonEl = ReactElement<{
  positions: PolygonProps['positions']
}>
type GeoJSONEl = ReactElement<{
  data: GeoJSONProps['data']
}>

export type ValidChildren =
  | MarkerEl
  | CircleEl
  | PolylineEl
  | RectangleEl
  | PolygonEl
  | GeoJSONEl

export type SuperClusterFeature =
  | PointFeature<GeoJsonProperties>
  | ClusterFeature<GeoJsonProperties>

export type PointToLayerFn = (
  feature: SuperClusterFeature,
  latlng: LatLng
) => Layer

export type MarkerFilterFn = (
  child: ValidChildren,
  index: number,
  markers: boolean[]
) => boolean

export interface SuperClusteringProps
  extends Options<GeoJsonProperties, GeoJsonProperties> {
  /**
   * @description Custom function for rendering your clusters. The default function is visible in the example.
   * @param {SuperClusterFeature} feature The cluster that is being rendered
   * @param {LatLng} latlng The center of the cluster
} feature The cluster that is being rendered
   */
  pointToLayer?: PointToLayerFn
  /**
   * @default (child, index, markers) => markers[index]
   * @description Custom function for filtering which markers that didn't fit into a cluster should be rendered. The default function will render all markers that didn't fit into a cluster.
   * @param child The child that is being filtered
   * @param index The index of the child
   * @param markers An array of booleans the same length as the number of children, where `true` means that the child at that index should be rendered
   */
  markerFilter?: MarkerFilterFn
  /**
   * @default false
   * @description Disable reclustering on `zoomend` event
   */
  disableZoomEvent?: boolean
  /**
   * @default false
   * @description Disable reclustering on `moveend` event
   */
  disableMoveEvent?: boolean
  children:
    | ValidChildren
    | ValidChildren[]
    | (ValidChildren | ValidChildren[])[]
}
