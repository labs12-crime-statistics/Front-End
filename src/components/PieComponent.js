import React, { Component } from 'react';
import { ResponsivePie } from '@nivo/pie';


export default class Pie extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataPpo: [],
      dataVio: [],
      dataLoc: [],
      selecppo: [
        {match: {id: 'PERSONAL'}, id: "default"},
        {match: {id: 'PROPERTY'}, id: "default"},
        {match: {id: 'OTHER'}, id: "default"}
      ],
      selecvio: [
        {match: {id: 'VIOLENT'}, id: "default"},
        {match: {id: 'NON_VIOLENT'}, id: "default"}
      ],
      selecloc: [
        {match: {id: 'PERSONAL_VEHICLE'}, id: "default"},
        {match: {id: 'RESIDENTIAL'}, id: "default"},
        {match: {id: 'STREET'}, id: "default"},
        {match: {id: 'COMMERCIAL'}, id: "default"},
        {match: {id: 'OTHER'}, id: "default"}
      ]
    };
  }

  componentWillUpdate(nextProps, nextState) {
    if (this.props !== nextProps) {
      this.setState({
        dataPpo: nextProps.dataPpo,
        dataVio: nextProps.dataVio,
        dataLoc: nextProps.dataLoc,
        selecppo: [
          {id: (nextProps.ppoCategories.indexOf("PERSONAL") !== -1 ? "select" : "default"), match: {id: "PERSONAL"}},
          {id: (nextProps.ppoCategories.indexOf("PROPERTY") !== -1 ? "select" : "default"), match: {id: "PROPERTY"}},
          {id: (nextProps.ppoCategories.indexOf("OTHER") !== -1 ? "select" : "default"), match: {id: "OTHER"}}
        ],
        selecvio: [
          {id: (nextProps.vioCategories.indexOf("VIOLENT") !== -1 ? "select" : "default"), match: {id: "VIOLENT"}},
          {id: (nextProps.vioCategories.indexOf("NON_VIOLENT") !== -1 ? "select" : "default"), match: {id: "NON_VIOLENT"}}
        ],
        selecloc: [
          {id: (nextProps.locCategories.indexOf("PERSONAL_VEHICLE") !== -1 ? "select" : "default"), match: {id: "PERSONAL_VEHICLE"}},
          {id: (nextProps.locCategories.indexOf("RESIDENTIAL") !== -1 ? "select" : "default"), match: {id: "RESIDENTIAL"}},
          {id: (nextProps.locCategories.indexOf("STREET") !== -1 ? "select" : "default"), match: {id: "STREET"}},
          {id: (nextProps.locCategories.indexOf("COMMERCIAL") !== -1 ? "select" : "default"), match: {id: "COMMERCIAL"}},
          {id: (nextProps.locCategories.indexOf("OTHER") !== -1 ? "select" : "default"), match: {id: "OTHER"}}
        ]
      });
    }
  }

  render() {
    return(
      <div className="col-12" style={{height: "40vh"}}>
        <ResponsivePie
          data={this.state.dataPpo}
          margin={{
            "top": 20,
            "right": 20,
            "bottom": 20,
            "left": 20
          }}
          innerRadius={0.05}
          padAngle={0.7}
          cornerRadius={3}
          colors={{ scheme: 'nivo' }}
          borderWidth={1}
          radialLabel={d => d.label}
          radialLabelsSkipAngle={10}
          radialLabelsTextXOffset={6}
          radialLabelsTextColor="#333333"
          radialLabelsLinkOffset={0}
          radialLabelsLinkDiagonalLength={16}
          radialLabelsLinkHorizontalLength={24}
          radialLabelsLinkStrokeWidth={1}
          slicesLabelsSkipAngle={10}
          slicesLabelsTextColor="#333333"
          sliceLabel={d => d.value.toFixed(2)+' %'}
          tooltip={d => d.label+': '+d.value.toFixed(2)+' %'}
          animate={true}
          motionStiffness={90}
          motionDamping={15}
          onClick={(e) => {this.props.addValue(e.id, "ppo")}}
          radialLabelsLinkColor={{ from: 'color' }}
          borderColor={{ theme: 'background' }}
          defs={[
            {
              id: "select",
              background: 'inherit',
              color: "#ffffff",
              type: 'patternLines',
              rotation: -45,
              lineWidth: 6,
              spacing: 10
            },
            {
              id: "default",
              background: 'inherit',
              color: "inherit",
              type: 'patternLines',
              rotation: -45,
              lineWidth: 6,
              spacing: 10
            }
          ]}
          fill={this.state.selecppo}
        />
        <ResponsivePie
          data={this.state.dataVio}
          margin={{
            "top": 20,
            "right": 20,
            "bottom": 20,
            "left": 20
          }}
          innerRadius={0.05}
          padAngle={0.7}
          cornerRadius={3}
          colors={{ scheme: 'nivo' }}
          borderWidth={1}
          radialLabel={d => d.label}
          radialLabelsSkipAngle={10}
          radialLabelsTextXOffset={6}
          radialLabelsTextColor="#333333"
          radialLabelsLinkOffset={0}
          radialLabelsLinkDiagonalLength={16}
          radialLabelsLinkHorizontalLength={24}
          radialLabelsLinkStrokeWidth={1}
          slicesLabelsSkipAngle={10}
          slicesLabelsTextColor="#333333"
          sliceLabel={d => d.value.toFixed(2)+' %'}
          tooltip={d => d.label+': '+d.value.toFixed(2)+' %'}
          animate={true}
          motionStiffness={90}
          motionDamping={15}
          onClick={(e) => {this.props.addValue(e.id, "vio")}}
          radialLabelsLinkColor={{ from: 'color' }}
          borderColor={{ theme: 'background' }}
          defs={[
            {
              id: "select",
              background: 'inherit',
              color: "#ffffff",
              type: 'patternLines',
              rotation: -45,
              lineWidth: 6,
              spacing: 10
            },
            {
              id: "default",
              background: 'inherit',
              color: "inherit",
              type: 'patternLines',
              rotation: -45,
              lineWidth: 6,
              spacing: 10
            }
          ]}
          fill={this.state.selecvio}
        />
        <ResponsivePie
          data={this.state.dataLoc}
          margin={{
            "top": 20,
            "right": 20,
            "bottom": 20,
            "left": 20
          }}
          innerRadius={0.05}
          padAngle={0.7}
          cornerRadius={3}
          colors={{ scheme: 'nivo' }}
          borderWidth={1}
          radialLabel={d => d.label}
          radialLabelsSkipAngle={10}
          radialLabelsTextXOffset={6}
          radialLabelsTextColor="#333333"
          radialLabelsLinkOffset={0}
          radialLabelsLinkDiagonalLength={16}
          radialLabelsLinkHorizontalLength={24}
          radialLabelsLinkStrokeWidth={1}
          slicesLabelsSkipAngle={10}
          slicesLabelsTextColor="#333333"
          sliceLabel={d => d.value.toFixed(2)+' %'}
          tooltip={d => d.label+': '+d.value.toFixed(2)+' %'}
          animate={true}
          motionStiffness={90}
          motionDamping={15}
          onClick={(e) => {this.props.addValue(e.id, "loc")}}
          radialLabelsLinkColor={{ from: 'color' }}
          borderColor={{ theme: 'background' }}
          defs={[
            {
              id: "select",
              background: 'inherit',
              color: "#ffffff",
              type: 'patternLines',
              rotation: -45,
              lineWidth: 6,
              spacing: 10
            },
            {
              id: "default",
              background: 'inherit',
              color: "inherit",
              type: 'patternLines',
              rotation: -45,
              lineWidth: 6,
              spacing: 10
            }
          ]}
          fill={this.state.selecloc}
        />
      </div>
    )
  }
}