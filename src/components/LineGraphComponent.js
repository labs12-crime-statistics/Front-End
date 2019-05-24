import React, { Component } from 'react';
import { ResponsiveLine } from '@nivo/line';

export default class Line extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: []
    }
  }

  componentWillUpdate(nextProps, nextState) {
    if (this.props !== nextProps) {
      this.setState({
        data: nextProps.data
      });
    }
  }

  render() {
    const strokeIdDict ={
      "All": "#54f59a",
      "Block": "#96f7c0",
      "PredAll": "#54f59a",
      "PredBlock": "#96f7c0"
    };
    const styleIdDict = {
      "All": {
        strokeWidth: 2
      },
      "Block": {
        strokeWidth: 2
      },
      "PredAll": {
        strokeDasharray: '12, 6',
        strokeWidth: 2
      },
      "PredBlock": {
        strokeDasharray: '12, 6',
        strokeWidth: 2
      }
    };

    const DashedLine = ({ series, lineGenerator, xScale, yScale }) => {
      var paths = this.state.data.map(({ id, data }) => {
        console.log(data);
        var splitId = id;
        var splits = splitId.split(" ");
        if (splits[splits.length-2] === "Block") {
          splitId = "Block";
        } else {
          splitId = "All";
        }
        if (splits[0] === "Pred") {
          splitId = "Pred"+splitId;
        }
        return(
          <path
            key={id}
            d={lineGenerator(
              data.map(d => ({
                x: xScale(this.props.xscale.type === "time" ? 1000*60*60*24*365*((parseInt(d.x.split("/")[0])-1)/12+parseInt(d.x.split("/")[1])-1970) : d.x),
                y: yScale(d.y)
              }))
            )}
            fill="none"
            stroke={strokeIdDict[splitId]}
            style={styleIdDict[splitId]}
          />
        );
      });
      return paths;
    };

    return(
      <ResponsiveLine
          data={this.state.data}
          margin={{
              "top": 50,
              "right": 20,
              "bottom": 80,
              "left": 60
          }}
          xScale={this.props.xscale}
          yScale={{
              "type": "linear",
              "stacked": false,
              "min": 0,
              "max": "auto"
          }}
          axisTop={null}
          axisRight={null}
          axisBottom={this.props.axisbottom}
          axisLeft={{
              "orient": "left",
              "tickSize": 5,
              "tickPadding": 5,
              "tickRotation": 0,
              "legend": this.props.yvalue,
              "legendOffset": -40,
              "legendPosition": "middle"
          }}
          colors={d => {
            var splitId = d.id;
            var splits = splitId.split(" ");
            if (splits[splits.length-2] === "Block") {
              splitId = "Block";
            } else {
              splitId = "All";
            }
            if (splits[0] === "Pred") {
              splitId = "Pred"+splitId;
            }
            return(strokeIdDict[splitId]);
          }}
          // dotSize={10}
          // dotColor={{
          //     "theme": "background"
          // }}
          // dotBorderWidth={2}
          // dotBorderColor={{
          //     "from": "color"
          // }}
          tooltip={this.props.tooltip}
          enableSlices="x"
          // enableDotLabel={false}
          // dotLabel="y"
          // dotLabelYOffset={-12}
          // enableDots={false}
          animate={true}
          motionStiffness={90}
          motionDamping={15}
          legends={[
            {
              "anchor": "bottom",
              "direction": "row",
              "justify": false,
              "translateX": 20,
              "translateY": 70,
              "itemsSpacing": 0,
              "itemDirection": "left-to-right",
              "itemWidth": 120,
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
          layers={['grid', 'axes', 'areas', DashedLine, 'slices', 'legends']}
      />
    )
  }
}
