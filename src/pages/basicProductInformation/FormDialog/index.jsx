import React, {createContext, useContext, useMemo, useRef, useState} from 'react';
import {Spin,Button } from 'antd';
import {
  FormItem,Form,FormButtonGroup,
  FormLayout,Reset,
  Input,Submit,
  PreviewText,FormDialog
} from '@formily/antd'
import SelectTooltip from "@/components/FormListBox/SelectTooltip";
import TreeSelectTooltip from "@/components/FormListBox/TreeSelectTooltip";
import CustomInput from "@/components/FormListBox/CustomInput";
import {action} from "@formily/reactive";
import {createForm, onFieldReact} from "@formily/core";
import {createSchemaField} from "@formily/react";
import {getUrlParam, requestList} from "@/pages/investorReview/func";
import {connect} from "dva";
import SubmitGroup from "@/components/FormListBox/SubmitGroup";


const Context = createContext()
const SchemaField = createSchemaField({
  components: {Form,FormLayout,FormItem,PreviewText, SelectTooltip,TreeSelectTooltip,CustomInput,Input},
  scope: {
    //产品类型下拉 proType
    proTypeFun:(field)=>{
      field.loading = true
      requestList({url:`/ams-base-parameter/datadict/queryInfoByList`,method:'GET'},
        {codeList:'rpProductType'},
      ).then(
        action.bound((data) => {
          field.dataSource = data?.rpProductType||[]
          field.loading = false
        })
      )
    },
  }
})

function Index(props){
  const {
    id,value,formType,
    div,form,Loading,
    handleGetValue
  }=props
  let title='2222'
  const [boxLoading,setBoxLoading]=useState(false)
  let urlParam=useRef(getUrlParam())
  return(<>
    <Button onClick={async () => {
      await FormDialog({ title:title, width: "1000px" }, id, (form) => {
        formType?form.setPattern("readPretty"):''
        return <>
          <Context.Provider value={value} >
            <FormDialog.Portal id={id}   style={{minWidth:520}}>
              <Spin spinning={Loading||boxLoading}>
                <PreviewText.Placeholder value={'-'}>
                  <FormLayout  labelCol={6} wrapperCol={18}>
                    <SchemaField>
                      <SchemaField.String
                        name="aaa"
                        required
                        title="输入框1"
                        x-decorator="FormItem"
                        x-component="Input"
                      />
                      <SchemaField.String
                        name="bbb"
                        required
                        title="输入框2"
                        x-decorator="FormItem"
                        x-component="Input"
                      />
                      <SchemaField.String
                        name="ccc"
                        required
                        title="输入框3"
                        x-decorator="FormItem"
                        x-component="Input"
                      />
                      <SchemaField.String
                        name="ddd1"
                        required
                        title="输入框4"
                        x-decorator="FormItem"
                        x-component="Input"
                      />
                    </SchemaField>
                  </FormLayout>
                </PreviewText.Placeholder>
              </Spin>
            </FormDialog.Portal>
          </Context.Provider>
        </>
      })
        .forOpen((payload, next) => {//中间件拦截器，可以拦截Dialog打开
          next({
            initialValues: {
              aaa: '123',
            },
          })
        })
        .forConfirm((payload, next) => { //中间件拦截器，可以拦截Dialog确认
          console.log(payload)
          next(payload)
        })
        .forCancel((payload, next) => {//中间件拦截器，可以拦截Dialog取消
          next(payload)
        })
        .open({//打开弹窗，接收表单属性，可以传入initialValues/values/effects etc.
          // initialValues: {},
          effects() {

          }
        })
        .then((e)=>{
          console.log(e)
        })
        .catch((e)=>{
          console.log(e)
        })
    }}>
      {title}
    </Button>
  </>)
}
export default  Index
