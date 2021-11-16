import React, { useEffect, useState, useRef } from 'react';
import { FieldInfo, TypeSummary } from 'types';
import { trackCustomEvent } from 'hooks/useAnalytics';
import { connect } from 'react-redux';
import { RootState } from 'store/rootReducer';
import {
  DataTable,
  DataTableExpandedRows,
  DataTableRowToggleParams,
} from 'primereact/datatable';
import { Column } from 'primereact/column';
// import { ProductService } from '../service/ProductService';
import { Rating } from 'primereact/rating';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Redirect } from 'react-router-dom';
import { Chip } from '@material-ui/core';
import './index.css';
type FieldTypeCounts = FieldInfo & { typeCounts: Record<string, number> };

const SchemaReport = ({
  schemaResults,
}: {
  schemaResults?: TypeSummary<FieldInfo> | null;
}) => {
  // const [expandedRows, setExpandedRows] = useState<any[]>(null);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean> | null>(null);
  const toast = useRef<Toast>(null);
  const isMounted = useRef(false);

  useEffect(() => {
    if (isMounted.current) {
      const summary = expandedRows !== null ? 'All Rows Expanded' : 'All Rows Collapsed';
      toast?.current?.show({ severity: 'success', summary: `${summary}`, life: 3000 });
    }
  }, [expandedRows]);

  if (!schemaResults || !schemaResults.fields) return <Redirect to="/" />;

  const fieldsArray = flattenSchemaFields(schemaResults!);

  const onRowExpand = (event) => {
    toast?.current?.show({
      severity: 'info',
      summary: 'Product Expanded',
      detail: event.data.name,
      life: 3000,
    });
  };

  const onRowCollapse = (event) => {
    toast?.current?.show({
      severity: 'success',
      summary: 'Product Collapsed',
      detail: event.data.name,
      life: 3000,
    });
  };

  const expandAll = () => {
    let _expandedRows = { ...expandedRows };
    const fieldNameList = Object.keys(schemaResults.fields);
    fieldNameList.forEach((fieldName) => (_expandedRows[`${fieldName}`] = true));
    console.log(_expandedRows, _expandedRows);
    setExpandedRows(_expandedRows);
  };

  const collapseAll = () => {
    setExpandedRows(null);
  };

  return (
    <div className="schema-explorer-datatable">
      <Toast ref={toast} />

      <div className="card">
        <DataTable
          value={fieldsArray}
          expandedRows={expandedRows as DataTableExpandedRows}
          onRowToggle={(e) => {
            console.log('onRowToggle', e);
            // @ts-ignore
            setExpandedRows(e.data);
          }}
          onRowExpand={onRowExpand}
          onRowCollapse={onRowCollapse}
          rowExpansionTemplate={rowTypeInfoExpansion}
          dataKey="fieldName"
          header={Header({ expandAll, collapseAll })}
        >
          <Column expander style={{ width: '3em' }} />
          <Column field="fieldName" header="Name" sortable />
          <Column field="uniqueCount" header="Unique #" sortable />
          <Column
            field="typeCounts"
            header="Types"
            sortable
            body={({ typeCounts }) => JSON.stringify(typeCounts, null, 2)}
          />
          <Column field="enum" header="Enum" sortable body={renderEnumBadges} />
          <Column
            field="identity"
            header="Identity"
            sortable
            body={checkboxFactory('identity')}
          />
          <Column
            field="identity"
            header="Identity"
            sortable
            body={checkboxFactory('identity')}
          />
          <Column
            field="nullable"
            header="Nullable"
            sortable
            body={checkboxFactory('nullable')}
          />
          <Column
            field="identity"
            header="Identity"
            sortable
            body={checkboxFactory('identity')}
          />
          <Column
            field="unique"
            header="Unique"
            sortable
            body={checkboxFactory('unique')}
          />
        </DataTable>
      </div>
    </div>
  );
};

const checkboxFactory = (fieldName: string) => (rowData: FieldInfo) => {
  return (
    <input
      type="checkbox"
      checked={Boolean(rowData[fieldName])}
      onChange={(e) => {
        console.log('checkbox', fieldName, e);
      }}
    />
  );
};

const renderEnumBadges = (rowData) => {
  if (!rowData?.enum) return null;
  console.log('rowData', rowData);
  return (
    <span className={`product-badge`}>
      {rowData.enum.map((enumItem) => (
        <Chip color="primary" key={enumItem} size="medium">
          {enumItem}
        </Chip>
      ))}
    </span>
  );
};

const rowTypeInfoExpansion = (data) => {
  console.log(data);
  return (
    <div className="types-subtable">
      <h5>Types for {data.name}</h5>
      <DataTable value={data.orders}>
        <Column field="typeName" header="Type Name" sortable></Column>
        <Column field="count" header="count" sortable></Column>
        <Column field="min" header="min" sortable></Column>
        <Column field="mean" header="mean" sortable></Column>
        <Column field="max" header="max" sortable></Column>
      </DataTable>
    </div>
  );
};

function Header({ expandAll, collapseAll }) {
  return (
    <div className="table-header-container">
      <Button
        icon="pi pi-plus"
        label="Expand All"
        onClick={expandAll}
        className="p-mr-2"
      />
      <Button icon="pi pi-minus" label="Collapse All" onClick={collapseAll} />
    </div>
  );
}
const flattenSchemaFields = (
  schemaResults: TypeSummary<FieldInfo>,
): FieldTypeCounts[] => {
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
      types: typeInfo.types,
      ref: typeInfo.types.$ref,
      enum: typeInfo.enum,
      nullable: typeInfo.nullable,
      identity: typeInfo.identity,
      unique: typeInfo.unique,
      uniqueCount: typeInfo.uniqueCount,
    };
  });
};

type Props = {
  schemaResults: TypeSummary<FieldInfo> | null | undefined;
};

// const SchemaDesigner: React.FunctionComponent<Props> = ({ schemaResults }) => {
//   useEffect(() => {
//     trackCustomEvent({
//       category: 'designer.view',
//       action: 'click',
//     });
//   }, []);
//   const rowData = flattenSchemaFields(schemaResults!);
//   return <div className="ag-theme-alpine" style={{ height: 400, width: 600 }}></div>;
// };

export default connect(({ analysisFeature }: RootState) => ({
  schemaResults: analysisFeature.schema,
}))(SchemaReport);
