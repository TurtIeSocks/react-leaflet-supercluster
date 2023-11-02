import { useEffect, useMemo, useState } from 'react'
import Supercluster, { type Options } from 'supercluster'
import type { GeoJsonProperties } from 'geojson'

export function useSuperClustering({
  minPoints = 2,
  minZoom = 0,
  maxZoom = 16,
  extent = 512,
  generateId = false,
  log = false,
  map,
  nodeSize = 64,
  radius = 60,
  reduce,
}: Options<GeoJsonProperties, GeoJsonProperties>): InstanceType<
  typeof Supercluster
> {
  const superCluster = useMemo(
    () =>
      new Supercluster({
        minPoints,
        minZoom,
        maxZoom,
        extent,
        generateId,
        log,
        map,
        nodeSize,
        radius,
        reduce,
      }),
    [
      minPoints,
      minZoom,
      maxZoom,
      extent,
      generateId,
      log,
      map,
      nodeSize,
      radius,
      reduce,
    ]
  )
  return superCluster
}
