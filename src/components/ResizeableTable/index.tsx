import React, { useEffect, useState } from 'react';
import { Table } from 'antd';
import styles from './index.less';
import { handleTableCss } from '@/utils/utilsFun';
// type ResizeableTitle = {
//   onResize: () => void;
//   width: number;
//   [index: string]: any;
// };

// const ResizeableTitle: React.FC<ResizeableTitle> = props => {
//   const { onResize, width, ...restProps } = props;
//
//   if (!width) {
//     return <th {...restProps} />;
//   }
//
//   return (
//     <Resizable
//       width={width}
//       height={0}
//       onResize={onResize}
//       draggableOpts={{ enableUserSelectHack: false }}
//     >
//       <th {...restProps} />
//     </Resizable>
//   );
// };

type ResizeableTableProps = {
  dataSource: Array<any>;
  columns: Array<any>;
  [index: string]: any;
};

const ResizeableTable: React.FC<ResizeableTableProps> = ({ dataSource, columns, ...restProps }) => {
  const [col, setCol] = useState<Array<any>>([]);
  useEffect(() => {
    columns.map(
      item => !item['render'] && (item['render'] = (text: string) => handleTableCss(text)),
    );

    setCol(columns);
  }, [columns]);

  // const components = {
  //   header: {
  //     cell: ResizeableTitle,
  //   },
  // };

  const handleResize = (index: number) => (
    _: EventTarget,
    { size }: { size: { width: number; height: number } },
  ) => {
    const nextColumns = [...col];
    nextColumns[index] = {
      ...nextColumns[index],
      width: size.width,
    };
    setCol(nextColumns);
    return { col: nextColumns };
  };

  const column = col.map((col, index) => ({
    ...col,
    onHeaderCell: (column: any) => ({
      width: column.width,
      onResize: handleResize(index),
    }),
  }));

  return (
    <Table
      {...restProps}
      className={styles.resizeableTable}
      bordered={true}
      columns={column}
      dataSource={dataSource}
      // components={components}
    />
  );
};

export default ResizeableTable;
