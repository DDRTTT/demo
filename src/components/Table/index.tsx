import React,{memo} from 'react';
import { Table,Tooltip } from 'antd';
/** 处理table每一个td省略号
 * @return {ReactNode}
 * @param {string} text 列表展示数据
 * @param {string} val
 * */

export const handleTableCss = (text:any, val:any) => {
  const width = val === '机构名称' ? '380px' : '180px';
  return (
    <Tooltip title={text} placement="topLeft">
      <span
        style={{
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
          display: 'inline-block',
          width: width,
          paddingTop: '5px',
        }}
      >
        {text}
      </span>
    </Tooltip>
  );
};

const TableProvider: React.FC<any> = props => {
  const columns = props?.columns;
  columns?.forEach(
    (item: {
      title: string;
      dataIndex?: string;
      ellipsis?: boolean;
      render: (text: any, record: any, index: number) => React.ReactNode;
    }) => {
      const i = item;
      // i.ellipsis ? (i.ellipsis = false) : '';//控制表宽度是否自适应
      i.ellipsis = false
      if (i.title=='操作') {
        i.ellipsis=true
      }
    },
  );
  // props.pagination.pageSizeOptions=['30','50','100','300']
  return (
    <Table
      {...props}
      bordered
    />
  );
};

export default TableProvider
