import React, { useState,memo,useEffect} from 'react';
import {connect, mapProps} from "@formily/react";
import {TreeSelect} from "@formily/antd";
import {Tooltip} from "antd";
function SelectDiv(props) {
  let {value,mode,fieldname,fieldnamevalue}=props
  const [selectTooltip,setSelectTooltip]=useState([])
  useEffect(()=>{
    if(Array.isArray(value)){
      let intersection=props.dataSource?.filter(dataSource =>
        value.some(value =>
          value === dataSource[fieldnamevalue]
        ));
      let arr=[]
      intersection?.forEach((v)=>{
        arr.push(v[fieldname])
      })
      setSelectTooltip(arr||[])
    }
  },[value])

  return(
    mode==='multiple'?
    <Tooltip
      arrowPointAtCenter
      placement="top"
      overlayStyle={{ maxWidth: 400 }}
      title={
        selectTooltip?.length>1?
        <ul style={{ marginBottom: 0 }}>
          {selectTooltip?.map(item => {
            return <li key={item}>{item}</li>;
          })}
        </ul>:''
      }
    >
      <TreeSelect
        // placeholder={"请选择"}
        // allowClear={true}//支持清除
        // showArrow={true}//是否显示下拉小箭头
        // showSearch={true}//配置是否可搜索
        allowClear
        showSearch
        showArrow
        optionFilterProp={fieldname}
        placeholder="请选择"
        fieldNames={{label: fieldname,value: fieldnamevalue,key:fieldnamevalue}}
        // mode={mode}
        value={value}
        onChange={(e) => {props.onChange(e)}}
        {...props}
      />
    </Tooltip>:
      <TreeSelect
        // placeholder={"请选择"}
        // allowClear={true}//支持清除
        // showArrow={true}//是否显示下拉小箭头
        // showSearch={true}//配置是否可搜索
        allowClear
        showSearch
        showArrow
        optionFilterProp={fieldname}
        placeholder="请选择"
        fieldNames={{label: fieldname,value: fieldnamevalue,key:fieldnamevalue}}
        // mode={mode}
        value={value}
        onChange={(e) => {props.onChange(e)}}
        {...props}
      />
  )
}
const TreeSelectTooltip=connect(
  TreeSelect,
  mapProps((props,field)=>{
    let {fieldname ,fieldnamevalue} = props;
    props.dataSource=field.dataSource
    return {
      placeholder:"请选择",
      treeCheckStrictly:true,////父子节点选中状态不再关联
      allowClear: true,//支持清除
      showArrow: true,//是否显示下拉小箭头
      showSearch: true,//配置是否可搜索
      treeCheckable: true,//显示 Checkbox
      treeDefaultExpandAll: true,//默认展开所有树节点
      showCheckedStrategy: "SHOW_ALL",//显示所有选中节点
      fieldNames:{label: fieldname,value: fieldnamevalue,key:fieldnamevalue},
      optionFilterProp:fieldname,
      ...props,
    };
  })
)

export default TreeSelectTooltip
