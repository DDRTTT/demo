import React, {memo} from 'react';
import {useSetState} from "ahooks";
import {Button, Form, Modal, message, DatePicker} from 'antd';
import {errorBoundary} from "@/layouts/ErrorBoundary";
import {linkHoc} from "@/utils/hocUtil";
import {connect} from "dva";
import {download} from '@/utils/download';
import moment from "moment"; //导出组件

function Index(props){
  const {selectedRowKeys,selectedRows,url,method,
  }=props
  const [form] = Form.useForm();
  const { validateFields, resetFields }=form
  const [state,setState]=useSetState({
    exModalVisible:false,//导出弹窗
    loading:false,
  })
  //导出弹窗开关
  const exportShowModal = () => {
    setState({exModalVisible: true})
  };
  const exportOnCancel = () => {
    setState({
      exModalVisible: false,
      loading: false,
    })
  }
  //数据导出
  const handleExport = (value) => {
    setState({loading: true})
    download(url, {
      body: {},
      name: `数据全量导出${handleGetTime()}.xlsx`,
      method: method||'GET',fileType: '.xlsx',
    });
    resetFields()
    setTimeout(function () {
      exportOnCancel()
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
  return(<>
    <Button  onClick={()=>{exportShowModal()}}>全量导出</Button>
    <Modal title="数据导出" visible={state.exModalVisible} onCancel={exportOnCancel}
           footer={[
             <Button key="recall" onClick={exportOnCancel}>取消</Button>,
             <Button key="submit" type="primary" htmlType="submit" loading={state.loading} onClick={()=>{handleExport()}}>确定全量导出</Button>,
           ]}
    >
      你确定要执行数据全量导出吗？
    </Modal>
  </>)
}
const ExportAll = errorBoundary(
  linkHoc()(
      connect()(Index),
  ),
);
export default ExportAll
