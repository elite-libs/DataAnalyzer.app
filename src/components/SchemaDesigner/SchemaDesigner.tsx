import React, { useEffect } from 'react';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';

import { trackCustomEvent } from 'hooks/useAnalytics';
import { connect } from 'react-redux';
import { FieldInfo, TypeSummary } from 'types';
import { RootState } from 'store/rootReducer';

const getTypeCounts = (schemaResults: TypeSummary<FieldInfo>) => {
  return Object.entries(schemaResults.fields).map(([fieldName, typeInfo]) => {
    const { types } = typeInfo;
    const typeCounts: Record<string, number> = {};
    Object.keys(types).forEach((typeName) => {
      typeCounts[typeName] = typeCounts[typeName] || 0;
      typeCounts[typeName]++;
    });
    return {
      fieldName,
      typeCounts,
      ref: typeInfo.types.$ref,
      enum: typeInfo.enum,
      nullable: typeInfo.nullable,
      identity: typeInfo.identity,
      unique: typeInfo.unique,
      uniqueCount: typeInfo.uniqueCount,
    };
  });
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

const SchemaDesigner: React.FunctionComponent<Props> = ({ schemaResults }) => {
  useEffect(() => {
    trackCustomEvent({
      category: 'designer.view',
      action: 'click',
    });
  }, []);
  const rowData = getTypeCounts(schemaResults!);
  return (
    <div className="ag-theme-alpine" style={{ height: 400, width: 600 }}>
      <AgGridReact rowData={rowData}>
        <AgGridColumn field="name"></AgGridColumn>
        <AgGridColumn field="type"></AgGridColumn>
        <AgGridColumn field="unique" checkboxSelection={true}></AgGridColumn>
        <AgGridColumn field="nullable" checkboxSelection={true}></AgGridColumn>
      </AgGridReact>
    </div>
  );
};

export default connect(({ analysisFeature }: RootState) => ({
  schemaResults: analysisFeature.schema,
}))(SchemaDesigner);
