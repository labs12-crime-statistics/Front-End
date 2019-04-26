import React from 'react';
import { ResponsiveSunburst } from '@nivo/sunburst';


export const Sunburst = ({ data }) => (
  <ResponsiveSunburst
    data={data}
    margin={{
      "top": 40,
      "right": 20,
      "bottom": 20,
      "left": 20
    }}
    identity="name"
    value="count"
    cornerRadius={2}
    borderWidth={1}
    borderColor="white"
    colors={{
      "scheme": "paired"
    }}
    childColor={{
      "from": "color",
      "modifiers": []
    }}
    animate={true}
    motionStiffness={90}
    motionDamping={15}
    isInteractive={true}
  />
)