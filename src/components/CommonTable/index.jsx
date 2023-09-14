import React, {useEffect, useRef, useState} from "react";
import {Table} from "antd";
import {Resizable} from 'react-resizable';
import {cloneDeep} from "lodash";
import './index.less'

const ResizeableTitle = props => {
  const { onResize, width, ...restProps } = props;

  if (!width) {
    return <th {...restProps} />;
  }

  return (
    <Resizable
      width={width}
      height={0}
      onResize={onResize}
      draggableOpts={{ enableUserSelectHack: false }}
    >
      <th {...restProps} />
    </Resizable>
  );
};


const CommonTable = (props)=>{
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [resultColumns, setResultColumns] = useState([]);

  const {dataSource, columns, onSelectChange, rowKey, pagination} = props;

  const { rows, pageSize, pageNum, total} = dataSource;

  const colsRef = useRef([]);

  useEffect(() => {
    setResultColumns(columns);
  }, [columns]);


  const components = {
    header: {
      cell: ResizeableTitle,
    },
  };


  // 序号
  const indexItem = resultColumns.find((col)=>col.title === '序号');
  const data = cloneDeep(rows);
  if(indexItem){
    data.forEach((item, index)=>{
      item[indexItem.dataIndex] = pageSize * (pageNum - 1) + index + 1;
    });
  }

  const handleResize = index => (e, { size }) => {
    const nextColumns = [...resultColumns];

    nextColumns[index]  = {
      ...nextColumns[index],
      width: size.width,
    };
    setResultColumns(nextColumns);
  };
  const selectionIndex = resultColumns.findIndex((col)=>col.title === 'selection');
  const columnsFilter = selectionIndex !== -1 ? resultColumns.splice(selectionIndex, 1) : resultColumns;
  colsRef.current = columnsFilter.map((col, index) => ({
    ...col,
    onHeaderCell: column => ({
      width: column.width,
      onResize: handleResize(index),
    }),
  }));


  const paginationConfig = {
    defaultCurrent: 1,
    current: pageNum,
    pageSize,
    total,
    ...pagination
  };
  // 筛选
  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedRowKeys )=>{
      setSelectedRowKeys(selectedRowKeys);
      onSelectChange(selectedRowKeys);
    },
  };

  return (
    <div  className="commonTable">
      <Table
        {...props}
        bordered
        components={components}
        pagination={{...paginationConfig}}
        dataSource={data}
        rowKey={rowKey}
        rowSelection={rowSelection}
        columns={colsRef.current} />
    </div>
  )
};

export default CommonTable;
