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
  const options = useMemo(
    () => ({
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
  const [superCluster, setSuperCluster] = useState(new Supercluster(options))

  useEffect(() => {
    setSuperCluster(new Supercluster(options))
  }, [options])

  return superCluster
}
