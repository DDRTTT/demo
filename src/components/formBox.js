import React, {useState} from 'react';
// import {useSetState} from "ahooks";
import {Select, Tooltip,TreeSelect,Tag} from "antd";

export const tagRender = (props,selectTooltip) => {
  const { label, value, closable, onClose } = props;
  const onPreventMouseDown = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };
  return (
    <Tooltip title={selectTooltip} placement="topLeft">
      <div className={'ant-select-selection-item selectTooltip'}
        // color={value}
        // onMouseDown={onPreventMouseDown}
           onClose={onClose}
      >{label}</div>
    </Tooltip>
  );
};

export function SelectTooltip(props){
  const [selectTooltip, setSelectTooltip]=useState('')
  function handleTooltip(e){
    setSelectTooltip(e)
  }
  return <>
    <Select
      mode={'tags'}
      allowClear//支持清除
      showSearch//配置是否可搜索
      showArrow//是否显示下拉小箭头
      optionFilterProp="children"//表示对内嵌内容进行搜索
      placeholder="请选择"
      maxTagCount={1}//响应式布局让选项自动收缩
      onChange={e=>{props.onChange(e),handleTooltip(e)}}
      value={props.value}
      // options={[
      //   { children: [], label: "选项 1", value: "1" },
      //   { children: [], label: "选项 2", value: "2" },
      //   { children: [], label: "选项 3", value: "3" },
      // ]}
      maxTagPlaceholder={selectTooltip}
      // tagRender={p => {tagRender(p,selectTooltip)}}
    />
</>
}

export function TreeSelectTooltip(props){
  return <>
    <TreeSelect
      treeCheckStrictly={true}//父子节点选中状态不再关联
      treeDefaultExpandAll={true}//默认展开所有树节点
      showCheckedStrategy={TreeSelect.SHOW_ALL}//显示所有选中节点
      treeCheckable={true}//显示 Checkbox
      allowClear//支持清除
      showSearch//配置是否可搜索
      showArrow//是否显示下拉小箭头
      optionFilterProp="children"//表示对内嵌内容进行搜索
      placeholder="请选择"
      maxTagCount={10}//响应式布局让选项自动收缩
      onChange={e=>{props.onChange(e)}}
      value={props.value}
    />
  </>
}
