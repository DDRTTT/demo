import React, {createContext, useContext, useMemo, useRef, useState} from 'react';
import {Spin,Button } from 'antd';
import {FormDialog,  PreviewText} from '@formily/antd'
import {getUrlParam, requestList} from "@/pages/investorReview/func";
import {connect} from "dva";
import {createForm, onFieldReact} from "@formily/core";

// const SchemaField = createSchemaField({
//   components: {
//     FormItem,
//     Input,
//   },
// })

const Context = createContext()

function Index(props){
  const {
    title,id,value,formType,
    div,form,Loading,
    handleGetValue
  }=props
  const [boxLoading,setBoxLoading]=useState(false)

  return(<>
    <Button onClick={async () => {
      FormDialog({ title:title, width: "1000px" }, id, (form) => {
        formType?form.setPattern("readPretty"):''
        return <>
          <Context.Provider value={value} >
            <FormDialog.Portal id={id}   style={{minWidth:520}}>
              <Spin spinning={Loading||boxLoading}>
                <PreviewText.Placeholder value={'-'}>
                  {div}
                </PreviewText.Placeholder>
              </Spin>
            </FormDialog.Portal>
          </Context.Provider>
        </>
      })
        //中间件拦截器，可以拦截Dialog打开
        .forOpen((payload, next) => {
          next({
            initialValues: {
              aaa: '123',
            },
          })
        })
        //中间件拦截器，可以拦截Dialog确认
        .forConfirm((payload, next) => {
          console.log(payload)
          next(payload)
        })
        //中间件拦截器，可以拦截Dialog取消
        .forCancel((payload, next) => {
          console.log(payload)
          next(payload)
        })
        //打开弹窗，接收表单属性，可以传入initialValues/values/effects etc.
        .open(
          {
            initialValues: {
              startDate: "2022-06-23", // 如果不加时分秒分报错 ：date1.isAfter is not a function
              endDate: "2023-05-03" //如果不加时分秒分报错 ： date.locale is not a function
            },
            effects() {

            }
          }
        )
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
export default  connect(({ publicModel: { publicTas } }) => ({
  publicTas
}))(Index)
