import { trackCustomEvent } from 'hooks/useAnalytics';
import React from 'react';
import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { connect } from 'react-redux';
import { FieldInfo, TypeSummary } from 'types';
import { RootState } from 'store/rootReducer';

const getFieldNames = (schemaResults: TypeSummary<FieldInfo>) => {
  return Object.keys(schemaResults.fields);
};

const getTypeCounts = (schemaResults: TypeSummary<FieldInfo>) => {
  return Object.entries(schemaResults.fields).reduce(
    (typeCounts, [fieldName, typeInfo]) => {
      const { types } = typeInfo;
      Object.keys(types).forEach((typeName) => {
        typeCounts[typeName] = typeCounts[typeName] || 0;
        typeCounts[typeName]++;
      });
      return typeCounts;
    },
    {},
  );
};

const getFieldLabeledData = (schemaResults: TypeSummary<FieldInfo>) => {
  const { fields } = schemaResults;
  const fieldNames = Object.keys(fields);
  const typesList = Object.keys(getTypeCounts(schemaResults));
  return typesList.map((type) => {
    return {
      name: type,
      data: fieldNames.map((fieldName) => {
        return fields[fieldName]!.types[type] ? fields[fieldName]!.types[type].count : 0;
      }),
    };
  });
};

type Props = {
  schemaResults: TypeSummary<FieldInfo> | null | undefined;
};
type State = {
  options?: ApexOptions;
  series?: any[] | null;
  chartHeight?: number;
};
const pixelHeightPerField = 30; // 21.75
// NOTE: Additional color sets available here: https://apexcharts.com/docs/options/theme/
const colorSets = {
  pastels: ['#abc7e3', '#fff7b3', '#ffc097', '#ff9492', '#cc959b'],
  vacation: ['#ffe74c', '#ff5964', '#7599e5', '#6bf178', '#35a7ff'],
  oceanSand: ['#ddd8c5', '#cdc392', '#3b556b', '#7599e5', '#adc1e5'],
  brights: ['#6699cc', '#fff275', '#ff8c42', '#ff3c38', '#a23e48'],
  blueRad: ['#006ba6', '#0496ff', '#ffbc42', '#d81159', '#8f2d56'],
};
class SchemaExplorer extends React.Component<Props, State> {
  componentDidMount() {
    trackCustomEvent({
      category: 'explorer.view',
      action: 'click',
    });
  }
  constructor(props: Props) {
    super(props);

    const schemaAnalysis = this.props.schemaResults;
    const fieldNames = (schemaAnalysis && Object.keys(schemaAnalysis.fields)) || [];
    const chartHeight = pixelHeightPerField * (fieldNames?.length || 0);

    // console.error('fieldNames', fieldNames)
    const colorPalette = colorSets.blueRad.concat(
      colorSets.brights,
      colorSets.vacation,
      colorSets.oceanSand,
    );
    this.state = !schemaAnalysis
      ? {}
      : {
          chartHeight,
          series: getFieldLabeledData(schemaAnalysis),
          options: {
            colors: colorPalette,
            chart: {
              type: 'bar',
              // height: chartHeight,
              stacked: true,
              stackType: '100%',
              redrawOnWindowResize: true,
            },
            plotOptions: {
              bar: {
                horizontal: true,
              },
            },
            stroke: {
              width: 0.5,
              colors: ['#fff'],
              // #cc959b
            },
            title: {
              text: `Field Analysis for ${fieldNames.length} Fields in ${schemaAnalysis.totalRows} Records`,
              style: {
                fontSize: '18px',
                fontWeight: 'bold',
                // fontFamily:  undefined,
                color: '#333333',
              },
            },
            xaxis: {
              categories: getFieldNames(schemaAnalysis), // [2008, 2009, 2010, 2011, 2012, 2013, 2014],
              labels: {
                // @ts-ignore
                formatter: function (
                  value: any,
                  // { series, seriesIndex, dataPointIndex, w },
                ) {
                  return value + '';
                },
              },
            },
            yaxis: {
              title: {
                text: undefined,
              },
            },
            tooltip: {
              y: {
                // @ts-ignore
                formatter: function (value, { series, seriesIndex, dataPointIndex, w }) {
                  return value + '';
                },
              },
            },
            fill: {
              opacity: 1,
            },
            legend: {
              position: 'top',
              horizontalAlign: 'left',
              offsetX: 25,
            },
            noData: {
              text: 'No analysis data found.',
              align: 'center',
              verticalAlign: 'middle',
              offsetX: 0,
              offsetY: 0,
              style: {
                color: undefined,
                fontSize: '16px',
                fontFamily: undefined,
              },
            },
          },
        };
  }

  render() {
    if (this.state) {
      console.log('state!');
    }
    if (this.state.options) {
      const { chartHeight } = this.state;
      return (
        <Chart
          options={this.state.options}
          series={this.state.series!}
          type="bar"
          height={chartHeight}
        />
      );
    } else {
      return <div className="chart-placeholder">No input for charts.</div>;
    }
  }
}

export default connect(({ analysisFeature }: RootState) => ({
  schemaResults: analysisFeature.schema,
}))(SchemaExplorer);

declare module 'react-apexcharts' {
  interface ChartProps {
    type?: ChartType;
    series?: Array<any>;
    width?: string | number;
    height?: string | number;
    options?: ApexOptions;
    [key: string]: any;
  }

  export type ChartType =
    | 'line'
    | 'area'
    | 'bar'
    | 'histogram'
    | 'pie'
    | 'donut'
    | 'radialBar'
    | 'scatter'
    | 'bubble'
    | 'heatmap'
    | 'treemap'
    | 'candlestick'
    | 'radar'
    | 'polarArea'
    | 'rangeBar';
}
