import React, { useState,memo} from 'react';
import {connect, mapProps} from "@formily/react";
import {Input} from "@formily/antd";

const CustomInput=connect(
  Input,
  mapProps((props,field)=>{
    const { withCount,fieldName ,fieldNameValue} = props;
    return {
      placeholder:"请输入",
      allowClear: true,//支持清除
      // maxTagCount:1,
      // labelInValue:true,
      // onChange:(e)=>handleTooltip(e),
      // mode:'tags',
      // tagRender:tagRender,
      ...props,
      // schema中有一个自定义的属性withCount，input本身没有该属性，需要通过mapProps做映射处理
      // showCount: withCount,
    };
  })
)
export default CustomInput
