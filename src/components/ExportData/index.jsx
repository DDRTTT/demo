import React, {memo} from 'react';
import {useSetState} from "ahooks";
import {Button, Form, message, DatePicker} from 'antd';
import {errorBoundary} from "@/layouts/ErrorBoundary";
import {linkHoc} from "@/utils/hocUtil";
import {connect} from "dva";
import {download} from '@/utils/download';
import moment from "moment"; //导出组件

function Index(props){
  const {selectedRows,url,method,name,
  }=props
  const [form] = Form.useForm();
  const { validateFields, resetFields }=form
  const [state,setState]=useSetState({
    loading:false,
  })

  //数据导出
  const handleExport = (value) => {
    if (selectedRows?.length<1) return message.info('请勾选导出的数据')
    let params = JSON.parse(JSON.stringify(selectedRows))
    download(url, {
      body:[...params],
      name: `${name||'数据导出'}${handleGetTime()}.xlsx`,
      method: method||'POST',
    });
    setState({loading: true})
    resetFields()
    setTimeout(function () {
      setState({
        loading: false,
        exModalVisible: false
      })
    }, 3000)
  };
  // 时间戳格式
  const handleGetTime = () => {
    const date = new Date();
    return date.getFullYear() +
      '-' +
      (date.getMonth() + 1) +
      '-' +
      date.getDate();
  };
  //自定义表单组件
  // function formDiv(){
  //   return(
  //     <Form.Item label="数据导入范围">
  //       {getFieldDecorator('recSdateDate', {
  //         rules: [{required: true, message: '请选择日期!'}],
  //         initialValue: [ // 默认值
  //           moment(state.exSdate, 'YYYY/MM/DD'),
  //           moment(state.exEdate, 'YYYY/MM/DD'),
  //         ],
  //       })(<DatePicker.RangePicker
  //         format={'YYYY/MM/DD'}
  //         onChange={onChange}
  //       />)}
  //     </Form.Item>
  //   )
  // }
  const onChange=()=>{}
  return(<>
    <Button loading={state.loading} onClick={()=>{handleExport()}}>导出</Button>
    {/*<Modal title="数据导出" visible={state.exModalVisible} onCancel={exportOnCancel}*/}
    {/*       footer={[*/}
    {/*         <Button key="recall" onClick={exportOnCancel}>取消</Button>,*/}
    {/*         <Button key="submit" type="primary" htmlType="submit" loading={state.loading}>确定导出</Button>,*/}
    {/*       ]}*/}
    {/*>*/}
    {/*  <Form onSubmit={handleExport} wrapperCol={{span: '14'}} labelCol={{span:'6'}}>*/}
    {/*    {formDiv()}*/}
    {/*  </Form>*/}
    {/*</Modal>*/}
  </>)
}
const ExportData = errorBoundary(
  linkHoc()(
      connect()(Index),
  ),
);
export default ExportData
