import React, {memo, useState,useRef} from 'react';
import {useSetState} from "ahooks";
import { Form, Button, DatePicker, message, Modal, Upload } from 'antd';
import { UploadOutlined  } from '@ant-design/icons';
import {errorBoundary} from "@/layouts/ErrorBoundary";
import {linkHoc} from "@/utils/hocUtil";
import {connect} from "dva";
import moment from "moment";
import XLSX from "xlsx";

//antd上传组件信息处理

function Index(props){
  const {
    url,method,
    handleGetListFetch//主页刷新
  } = props
  const [form] = Form.useForm();
  const {resetFields}=form
  const [state,setState]=useSetState({
    isModalVisible:false,//导入弹窗
    loading:false,
    exSdate: moment().startOf('year').format("YYYY/MM/DD"),//导出日期
    exEdate: moment().endOf('year').format("YYYY/MM/DD"),
  })
  const [xlxFileList, setXlxFileList] = useState([]); // 上传的xlsx文件集合
  const wd=useRef([])
  //导入弹窗开关
  const showModal = () => {
    setState({isModalVisible: true})
  };
  const onCancel = () => {
    setState({
      isModalVisible:false,
      loading:false,
    })
    setXlxFileList([])
    resetFields()
  }
  //存数据
  function handleProductData(value) {
    setState({exSdate: value[0] || '', exEdate: value[1] || ''})
  }
  // 属性:上传组件的属性
  const pdfFileProps = {
    multiple: false,//多文件
    showUploadList: true,
    name: 'files',//发到后台的文件参数名
    action: url,
    headers: {
      Token: sessionStorage.getItem('auth_token'),
      Data: new Date().getTime(),
      Sys: 0,
    },
    onRemove: file => {
      const index = xlxFileList.indexOf(file);//直接的xlsx数据
      const newFileList = xlxFileList.slice();
      newFileList.splice(index, 1);
      setXlxFileList(newFileList);
      if(newFileList.length<1) setState({loading:true})
    },
    beforeUpload: file => {
      const isExcel = getFileMimeType(file,wd);
      const fileType = file.name.slice(file.name.lastIndexOf('.') + 1)
      const isXlsx = ['xlsx', 'xls'].indexOf(fileType) > -1;
      if (!isExcel || !isXlsx) {
        message.error('上传失败！仅支持文件类型为xlsx的文件');
        return false
      }
      const isLt10M = file.size / 1024 / 1024 < 2;
      if (!isLt10M) {
        message.error('上传文件不能超过 2MB!');
        return false
      }
      const sameList = xlxFileList.filter(item => item.lastModified == file.lastModified);
      if (sameList.length >= 1) {
        message.error(`请勿重复上传同一文件`);
        return false
      }
      setState({loading:false })
      setXlxFileList(arr => {return [...arr, file].slice(-1)});
      return false;
    },
    onChange: info => {
      let {fileList} = info;
      const status = info.file.status;//解决上传组件bug必须这么写
      // if (status === 'done') {
      //   if (info.file.response.status === 200) {
      //     // setXlxFileList([...info.fileList].slice(-1))
      //     // productData.xlxID=info.fileList
      //     setRecallLoadingLoading(false)
      //   } else {
      //     setRecallLoadingLoading(true)
      //     message.warn(`效验错误${info.file.response.message}`);
      //     return
      //   }
      // } else if (status === 'error') {
      //   setRecallLoadingLoading(true)
      //   message.error(`${info.file.response.message}`);
      //   return
      // }
      // if (info.file.status=='error'){
      //   message.error(info.file.response.status+'_'+info.file.response.message);
      //   setRecallLoadingLoading(true);
      //   return false
      // }
      if ('status' in info.file) {
        setXlxFileList([...info.fileList].slice(-1))
      }
    },
  };
  const getFileMimeType = (file,wd) => {
    let rABS = true;//是否将文件读取为二进制字符串
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    return new Promise((resolve, reject) => {
      reader.onload = (event) => {
        try {
          let buffer = [...Buffer.from(event.target.result)];
          // 仅要文件的前四位
          buffer = buffer.splice(0, 4);
          buffer.forEach((num, i, arr) => {
            arr[i] = num.toString(16).padStart(2, '0');
          });
          if(buffer.join('') === '504b0304'){//是xlsx的话，xlsx直接push存数据
            let data = event.target.result;
            if (!rABS) data = new Uint8Array(data);
            let arr=XLSX.read(data, { type: rABS ? 'binary' : 'array' })
            wd?wd.current.push(arr):''
          }
          resolve(// 504b0304 是 xlsx 的文件头
            buffer.join('') === '504b0304'
          );
          //xlsx转换
        } catch (e) {
          // 读取文件头出错 默认不是合法文件类型
          reject();
        }
      };
    });
  }
  //确定上传
  const handleOk = values => {
    // if (!productData.xlxID || productData.xlxID == '') {
    //   message.error('后端返回ID为空')
    //   return false
    // }
    if (xlxFileList && xlxFileList.length) { //检验是否有上传文件
      let formData = new FormData();
      let fileName
      formData.append('files', xlxFileList[0]);
      // formData.append('xlxID',productData.xlxID)
      setState({loading: true})
      fetch(url, {
        method: method||'POST',
        headers: {
          Token: sessionStorage.getItem('auth_token'),
          Data: new Date().getTime(),
          Sys: 0,
        },
        body: formData,
      })
        // .then(json => json.json()).then(res => {
        //     if (res?.status === 200) {
        //       setState({
        //         isModalVisible:false,
        //         loading: false,
        //       })
        //       message.success('上传成功！');
        //       resetFields()
        //       setXlxFileList([])
        //       handleGetListFetch()
        //     } else if (res?.rel===false){
        //       message.error(`${res.data}`)
        //     }else {
        //       setState({loading: true})
        //       message.error(`${res.message}`)
        //     }
        // })
        .then(blob=>{
          try {
            // 切割出文件名
            const fileNameEncode = blob.headers.get('content-disposition').split('filename=')[1]
            // 解码
            fileName = decodeURIComponent(fileNameEncode)
            return blob.blob()
          }catch {return message.error(blob?.status||'未知异常')}
        },err => {message.error(err)})
        .then(res=>{
          const a = document.createElement('a');
          const url = window.URL?.createObjectURL(res);
          a.href = url;
          a.download = fileName;
          document.body.appendChild(a); // --火狐不支持直接点击事件
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
          resetFields()
          setXlxFileList([])
          handleGetListFetch()
          message.success('上传成功!开始下载导入结果文件！')
          setTimeout(function () {
            setState({loading: false})
          }, 1000)
        },err => {message.error(err)})
        .catch((err) => {
          setState({loading: true})
          message.error(err);
        })
    } else return message.error('请上传文件后再提交！')
  };

  return(<>
    <Button onClick={showModal}>导入</Button>
    <Modal title="数据导入" visible={state.isModalVisible} onCancel={onCancel}
           footer={[
             <Button key="recall" onClick={onCancel}> 取消</Button>,
             <Button key="submit" type="primary" htmlType="submit" disabled={state.loading} onClick={()=>{handleOk()}}
             >确定</Button>,
           ]}
    >
      <Form wrapperCol={{span: '14'}} labelCol={{span:'6'}}>
        {/*{formDiv()}*/}
        <Form.Item label="上传文件">
          <Upload {...pdfFileProps} fileList={xlxFileList} accept=".xlsx,.xls"
            // data={{//额外参数
            //   startDate:productData.recSdate,
            //   endDate:productData.recEdate
            // }}
          >
            <Button><UploadOutlined/> 上传文件</Button>
          </Upload>
        </Form.Item>
      </Form>
    </Modal>
  </>)
}
const ImportData = errorBoundary(
  linkHoc()(
      connect()(Index),
  ),
);

export default ImportData
