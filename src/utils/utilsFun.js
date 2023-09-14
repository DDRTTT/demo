import React from 'react';
import { Tooltip } from 'antd';

/** 处理table每一个td省略号
 * @param {string}  text 列表展示数据
 * */
export const handleTableCss = text => {
  return (
    <Tooltip title={text} placement="topLeft">
      <span
        style={{
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
          display: 'inline-block',
          width: '100%',
          paddingTop: '5px',
        }}
      >
        {text}
      </span>
    </Tooltip>
  );
};
// 递归获取json中数据
export const recursiveGetData = (data, key) => {
  if (!data) return;
  const arr = [];
  if (Array.isArray(data)) {
    data.forEach(item => {
      if (Array.isArray(item[key])) {
        arr.push(recursiveGetData(item[key], key));
      } else {
        arr.push(item);
      }
    });
  } else if (Array.isArray(data[key])) {
    data[key].forEach(item => {
      if (Array.isArray(item[key])) {
        arr.push(recursiveGetData(item[key], key));
      } else {
        arr.push(item);
      }
    });
  } else {
    arr.push(data);
  }
  return arr;
};
