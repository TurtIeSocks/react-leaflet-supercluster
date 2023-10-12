import React from 'react'
import { createRoot } from 'react-dom/client'

import App from './App'

import 'leaflet-easybutton/src/easy-button.css'
import 'leaflet/dist/leaflet.css'

import '../src/styles.css'

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
createRoot(document.getElementById('root')!).render(<App />)
