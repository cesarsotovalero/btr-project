/**
 * BTR — Apache ECharts setup (tree-shaken).
 * Bundles only the chart types and components used in the app.
 * Output: public/js/echarts.bundle.js (IIFE, exposes window.echarts)
 */
import * as echarts from 'echarts/core'

// Chart types
import { RadarChart }  from 'echarts/charts'
import { PieChart }    from 'echarts/charts'
import { GaugeChart }  from 'echarts/charts'
import { BarChart }    from 'echarts/charts'

// Components
import { TitleComponent }   from 'echarts/components'
import { TooltipComponent } from 'echarts/components'
import { LegendComponent }  from 'echarts/components'
import { GridComponent }    from 'echarts/components'

// Renderer
import { CanvasRenderer } from 'echarts/renderers'

// Register
echarts.use([
  RadarChart, PieChart, GaugeChart, BarChart,
  TitleComponent, TooltipComponent, LegendComponent, GridComponent,
  CanvasRenderer,
])

// ── SEB Theme — aligned with GDS design tokens ──
const SEB_THEME = {
  color: [
    '#60cd18', // green-primary
    '#007ac7', // color-info  (blue)
    '#ffb400', // color-caution (amber)
    '#f03529', // color-severe (red)
    '#308800', // green-dark
    '#868686', // color-muted (grey)
    '#45b400', // green-hover
    '#41B0EE', // light-blue
  ],
  backgroundColor: 'transparent',
  textStyle: {
    fontFamily: 'SEB SansSerif, -apple-system, BlinkMacSystemFont, sans-serif',
    color: '#333333',
  },
  title: {
    textStyle: {
      fontFamily: 'SEB SansSerif, sans-serif',
      fontWeight: 500,
      color: '#333333',
      fontSize: 14,
    },
    subtextStyle: { color: '#868686', fontSize: 12 },
  },
  legend: {
    textStyle: { color: '#333333', fontSize: 12 },
  },
  tooltip: {
    backgroundColor: '#ffffff',
    borderColor: '#dedede',
    borderWidth: 1,
    textStyle: { color: '#333333', fontSize: 12 },
  },
  radar: {
    shape: 'polygon',
    splitNumber: 4,
    axisName: { color: '#333333', fontSize: 12 },
    splitLine: { lineStyle: { color: '#dedede' } },
    splitArea: { areaStyle: { color: ['#ffffff', '#f8f8f8'] } },
    axisLine: { lineStyle: { color: '#dedede' } },
  },
}

echarts.registerTheme('seb', SEB_THEME)

// Expose on window for IIFE page scripts
window.echarts = echarts
