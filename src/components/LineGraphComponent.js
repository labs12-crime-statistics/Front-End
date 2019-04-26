import React from 'react';
import { ResponsiveLine } from '@nivo/line';

export const Line = ( {data, axisbottom, xscale, yvalue} ) => (
  <ResponsiveLine
      data={data}
      margin={{
          "top": 50,
          "right": 110,
          "bottom": 50,
          "left": 60
      }}
      xScale={xscale}
      yScale={{
          "type": "linear",
          "stacked": false,
          "min": 0,
          "max": 1
      }}
      axisTop={null}
      axisRight={null}
      axisBottom={axisbottom}
      axisLeft={{
          "orient": "left",
          "tickSize": 5,
          "tickPadding": 5,
          "tickRotation": 0,
          "legend": yvalue,
          "legendOffset": -40,
          "legendPosition": "middle"
      }}
      colors={{
          "scheme": "paired"
      }}
      dotSize={10}
      dotColor={{
          "theme": "background"
      }}
      dotBorderWidth={2}
      dotBorderColor={{
          "from": "color"
      }}
      enableDotLabel={false}
      dotLabel="y"
      dotLabelYOffset={-12}
      animate={true}
      motionStiffness={90}
      motionDamping={15}
      legends={[
        {
          "anchor": "bottom-right",
          "direction": "column",
          "justify": false,
          "translateX": 100,
          "translateY": 0,
          "itemsSpacing": 0,
          "itemDirection": "left-to-right",
          "itemWidth": 80,
          "itemHeight": 20,
          "itemOpacity": 0.75,
          "symbolSize": 12,
          "symbolShape": "circle",
          "symbolBorderColor": "rgba(0, 0, 0, .5)",
          "effects": [
            {
              "on": "hover",
              "style": {
                "itemBackground": "rgba(0, 0, 0, .03)",
                "itemOpacity": 1
              }
            }
          ]
        }
      ]}
  />
)
