import React, {useState, memo, useEffect} from 'react';
import {connect, mapProps} from "@formily/react";
import {Select} from "@formily/antd";
import {Tooltip} from "antd";

// function SelectDiv(props) {
//   let {value,mode,fieldname,fieldnamevalue}=props
//   const [selectTooltip,setSelectTooltip]=useState([])
//   useEffect(()=>{
//     if(Array.isArray(value)){
//       let intersection=props.dataSource?.filter(dataSource =>
//         value.some(value =>
//           value === dataSource[fieldnamevalue]
//         ));
//       let arr=[]
//       intersection?.forEach((v)=>{
//         arr.push(v[fieldname])
//       })
//       setSelectTooltip(arr||[])
//     }
//   },[value])
//
//   return(
//     mode==='multiple'?
//     <Tooltip
//       arrowPointAtCenter
//       placement="top"
//       overlayStyle={{ maxWidth: 400 }}
//       title={
//         selectTooltip?.length>1?
//         <ul style={{ marginBottom: 0 }}>
//           {selectTooltip?.map(item => {
//             return <li key={item}>{item}</li>;
//           })}
//         </ul>:''
//       }
//     >
//       <Select
//         // placeholder={"请选择"}
//         // allowClear={true}//支持清除
//         // showArrow={true}//是否显示下拉小箭头
//         // showSearch={true}//配置是否可搜索
//         allowClear
//         showSearch
//         showArrow
//         optionFilterProp={fieldname}
//         placeholder="请选择"
//         fieldNames={{label: fieldname,value: fieldnamevalue,key:fieldnamevalue}}
//         // mode={mode}
//         value={value}
//         onChange={(e) => {props.onChange(e)}}
//         {...props}
//       />
//     </Tooltip>:
//       <Select
//         // placeholder={"请选择"}
//         // allowClear={true}//支持清除
//         // showArrow={true}//是否显示下拉小箭头
//         // showSearch={true}//配置是否可搜索
//         allowClear
//         showSearch
//         showArrow
//         optionFilterProp={fieldname}
//         placeholder="请选择"
//         fieldNames={{label: fieldname,value: fieldnamevalue,key:fieldnamevalue}}
//         // mode={mode}
//         value={value}
//         onChange={(e) => {props.onChange(e)}}
//         {...props}
//       />
//   )
// }

const SelectTooltip=connect(
  Select,
  mapProps((props,field,)=>{
    let {fieldname ,fieldnamevalue} = props;
    props.dataSource=field.dataSource
    return {
      placeholder:"请选择",
      allowClear: true,//支持清除
      showArrow: true,//是否显示下拉小箭头
      showSearch: true,//配置是否可搜索
      fieldNames:{label: fieldname,value: fieldnamevalue,key:fieldnamevalue},
      optionFilterProp:fieldname,
      ...props,
      // schema中有一个自定义的属性withCount，input本身没有该属性，需要通过mapProps做映射处理
      // showCount: withCount,
    };
  })
)
export default SelectTooltip
