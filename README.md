# react-leaflet-supercluster

[![npm version](https://badge.fury.io/js/react-leaflet-supercluster.svg)](https://badge.fury.io/js/react-leaflet-supercluster)

Basic React Leaflet wrapper for the [Supercluster](https://github.com/mapbox/supercluster)

## Installation

```sh
  // npm
  npm i react-leaflet-supercluster

  // yarn
  yarn add react-leaflet-supercluster
```

## Supported Components

- [Marker](https://react-leaflet.js.org/docs/api-components/#marker)
- [Circle](https://react-leaflet.js.org/docs/api-components/#circle)
- [CircleMarker](https://react-leaflet.js.org/docs/api-components/#circlemarker)
- [Polyline](https://react-leaflet.js.org/docs/api-components/#polyline)
- [Rectangle](https://react-leaflet.js.org/docs/api-components/#rectangle)
- [Polygon](https://react-leaflet.js.org/docs/api-components/#polygon)
- [GeoJSON](https://react-leaflet.js.org/docs/api-components/#geojson)

## Usage

This package primarily exports a React component that can be used anywhere as a child of a `MapContainer` component. It also provides a "low level" hook that just returns a Supercluster instance. See the [Example](/example) code for a more detailed usage example.

```tsx
import 'react-leaflet-supercluster/dist/styles.css'
import { MapContainer, Circle, CircleMarker, Marker Polygon, Polyline } from 'react-leaflet'
import { SuperClustering } from 'react-leaflet-supercluster'

export default function App() {
  return (
    <MapContainer>
      <SuperClustering>
        <Circle center={[0, 0]} />
        <Marker position={[1, 2]} />
        <CircleMarker position={[3, 4]} />
        <Polyline positions={[3, 4]} />
        <Polygon positions={[5, 6]} />
      </SuperClustering>
    </MapContainer>
  )
}
```

## Props

Extends all original options from the [Supercluster constructor](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/409c8137e9849a496f859baa2a45afff5a162b16/types/supercluster/index.d.ts#L13).

### Additional props:
| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| children | ReactNode |  | Marker, Circle, CircleMarker, Polyline, Polygon, & GeoJSON components |
| disableZoomEvent | boolean | false | Disable reclustering on `zoomend` event |
| disableMoveEvent | boolean | false | Disable reclustering on `moveend` event |
| pointToLayer | (feature, latlng) => Marker | See code | Function that will be used for creating cluster markers. |
| markerFilter | (ReactNode, number, boolean[]) => boolean | (_, index, markers) => markers[index] | Function that will be used for filtering markers that were not included in clusters. |


## Contributing

- `yarn start` to start the Vite dev server with HMR enabled.
- With VS Code you can open a debugger in Chrome for IDE debugging
