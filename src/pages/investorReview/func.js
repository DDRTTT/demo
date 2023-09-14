import React, { useEffect, useRef, useState,useImperativeHandle,forwardRef } from 'react';
import { useSetState } from 'ahooks';
import { routerRedux } from 'dva/router';
import { fnLink,ActionBool, linkHoc } from '@/utils/hocUtil';
import { revoke } from '@/services/investorReview';
import {Button, Dropdown, message, Modal, Tag, Tooltip,Menu} from 'antd';
import {DownloadOutlined} from '@ant-design/icons';
import { handleShowTransferHistory } from '@/utils/transferHistory';
import {download} from '@/utils/download';
import moment from "moment";
import request from "@/utils/request";
import {handSearchAPI} from "@/pages/productServiceOrganizations/services";
import axios from "axios";
/**
 * @description 根据不同的状态获取不同的编辑按钮
 * @param {string} checkedCode 当前流程的状态 S001_1 待提交 S001_2 流程中 S001_3 已结束
 * @param {string} taskTypeCode 当前选项卡的code
 * @param {number} revoke 是否要显示撤销按钮
 * @returns {array} buttonList
 */
export const getEditButton = (checkedCode, taskTypeCode, revoke) => {
  let buttonList = [];
  // #region <-------------1.016更新 start----------->
  // 我待办 && 未提交
  if (taskTypeCode === 'T001_1' || taskTypeCode === 'T001_4') {
    switch (checkedCode) {
      case 'S001_1':
        buttonList = [
          {
            label: '修改',
            code: 'modify',
          },
          {
            label: '复制',
            code: 'copy',
          },
          {
            label: '提交',
            code: 'submit',
          },
        ];
        break;
      case 'S001_2':
        buttonList = [
          {
            label: '办理',
            code: 'transact',
          },
          {
            label: '流转历史',
            code: 'history',
          },
        ];
        break;
      case 'S001_3':
        buttonList = [
          {
            label: '详情',
            code: 'detail',
          },
          {
            label: '流转历史',
            code: 'history',
          },
        ];
        break;

      default:
        buttonList = [];
        break;
    }
  } else {
    //   我参与 && 我发起 && 已办理
    buttonList = [
      {
        label: '详情',
        code: 'detail',
      },
      {
        label: '流转历史',
        code: 'history',
      },
    ];
  }
  // 如果是待提交就显示删除按钮
  if (checkedCode === 'S001_1') {
    buttonList.push({
      label: '删除',
      code: 'delete',
    });
  }
  // 如果revoke等于1的话&状态是流程中的话就显示撤销
  if (revoke && revoke * 1 === 1 && checkedCode === 'S001_2') {
    buttonList.push({
      label: '撤销',
      code: 'repeal',
    });
  }
  return buttonList;
  // #endregion <------------- end----------->
};

/**
 * 获取分页设置
 * @param {*} total 当前列表数据总数
 * @param {*} pageSize 页面的数据数
 * @param {*} otherConfig 可拓展其他配置
 * * @returns {*} config
 */
export const getPaginationConfig = (total, pageSize, otherConfig = {}) => {
  return {
    // size: 'small',
    total,
    pageSize,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: total => `共 ${total} 条数据`,
    ...otherConfig,
  };
};

/**
 * 处理小按钮的公用函数
 * @param {string} code 触发的函数
 * @param {*} record 数据
 * @param {string} pageConfig 页面模板的路径
 * @param pageConfigParam
 */
export const handleEdit = (code, record, pageConfig, pageConfigParam) => {
  const { pathName, dispatch, refresh, handlerDelete } = pageConfig;
  switch (code) {
    case 'start':
      fnLink(`${pathName}:start`);
      break;
    case 'add':
      fnLink(`${pathName}:add`);
      break;
    case 'show':
      fnLink(`${pathName}:show`, pageConfigParam || '');
      break;
    case 'detail':
      dispatch(
        routerRedux.push({
          pathname: '/processCenter/processDetail',
          query: {
            processInstanceId: record.processInstanceId,
            nodeId: record.taskDefinitionKey,
            taskId: record.taskId,
            resourcePathName: pathName || '',
          },
        }),
      );
      break;
    case 'submit':
      fnLink(`${pathName}:submit`, pageConfigParam || '');
      break;
    case 'modify':
      fnLink(`${pathName}:modify`, pageConfigParam || '');
      break;
    case 'copy':
      fnLink(`${pathName}:copy`, `?processInstId=${record.processInstanceId || ''}`);
      break;
    case 'transact':
      dispatch(
        routerRedux.push({
          pathname: '/processCenter/taskDeal',
          query: {
            taskId: record.taskId,
            processDefinitionId: record.processDefinitionId,
            processInstanceId: record.processInstanceId,
            taskDefinitionKey: record.taskDefinitionKey,
            mode: 'deal',
            id: record.id,
            proCode: record.proCode,
            processDefinitionKey: record.processDefinitionKey ? record.processDefinitionKey : '',
          },
        }),
      );
      break;
    case 'repeal':
      Modal.confirm({
        title: '请确认是否撤销?',
        okText: '确认',
        cancelText: '取消',
        onOk: () =>
          revoke({ processInstId: record.processInstanceId }).then(res => {
            if (res.status == 200) {
              message.success('撤销成功');
              refresh();
            } else {
              message.error(res.message);
            }
          }),
      });
      break;
    case 'delete':
      if (handlerDelete) {
        Modal.confirm({
          title: '请确认是否删除?',
          okText: '确认',
          cancelText: '取消',
          onOk: () =>
            handlerDelete(record.id).then(res => {
              if (res.status == 200) {
                message.success('删除成功');
                refresh();
              } else {
                message.error(res.message);
              }
            }),
        });
      }
      break;
    case 'history':
      handleShowTransferHistory(record);
      break;
    default:
      break;
  }
};

// 判断是不是一个空的新对象
export const isNullObj = obj => {
  return JSON.stringify(obj) === '{}';
};

/**
 * @description 根据设置的条件隐藏数组
 * @param {String} tabKey 当前的tab的key
 * @param {Array} conditions 隐藏的tabs条件
 * @param {Array} arr column数组
 * @param {String} key 删除的key
 * @param {Object} obj 要添加的key
 * @param indexID
 */
export const hideColumn = (tabKey, conditions, arr, key, obj, indexID) => {
  // 已办理和我发起不显示任务到达时间
  const hideTaskTime = conditions;
  const index = arr.findIndex(item => item.dataIndex == key);
  if (hideTaskTime.includes(tabKey) && ~index) {
    arr.splice(index, 1);
  } else if (!~index && !hideTaskTime.includes(tabKey)) {
    arr.splice(arr.length - 1, 0, obj);
  }
  //indeID=验资页面
  if (indexID == 'g49d943f196f4001add6c3b1c2ea5e6b'){
    let numBerr,val
    if(tabKey=='T001_4'){
      arr.forEach((v,i)=>{
        if(v.dataIndex=="taskArriveTime"){numBerr=i}
      })
      numBerr?arr.splice(numBerr, 1):''
    }else
    if(tabKey=='T001_1'){
      arr.forEach((v,i)=>{
        if(v.dataIndex=="createTime"){numBerr=i}
      })
      numBerr?arr.splice(numBerr, 1):''
    }else {
      arr.forEach((v,i)=>{
        if(v.title=="任务到达时间"){numBerr=i}
      })
      numBerr?arr.splice(numBerr, 1):''
    }
  }
};

/**
 * @description 隐藏任务到达时间
 * @param tabkey
 * @param {Array} arr column数组
 * @param dataIndex
 * @param indexID
 */
export const hideTaskTime = (tabkey, arr, dataIndex, indexID) => {
  hideColumn(tabkey, ['T001_3', 'T001_5'], arr, dataIndex, {
    key: dataIndex,
    dataIndex,
    title: '任务到达时间',
    ...tableRowConfig,
  },indexID);
};

/**
 *  一个机智的boy写的一个机智的函数
 *  给表格加tooltip用的公用的方法
 **/

export const eutrapelia = (label, record) => {
  return (
    <Tooltip title={label} placement="topLeft">
      {label
        ? label.toString().replace(/null/g, '-')
        : label === '' || label === undefined || label === null
        ? '-'
        : 0}
    </Tooltip>
  );
};
/**
 * 一个机智的常量
 * 表格列的固定宽度
 */
export const tableRowWidth = 200;
/**
 * 又一个机智的常量
 * 表格列常用的配置
 * 真他娘的是个人才
 */
export const tableRowConfig = {
  sorter: false,
  ellipsis: true,
  width: 200,
  render: (label, record) => {
    return (
      <Tooltip title={label} placement="topLeft">
        {label
          ? label.toString().replace(/null/g, '-')
          : label === '' || label === undefined || label === null
            ? '-'
            : 0}
      </Tooltip>
    )
  }
}

export const listcolor = {
  sorter: false,
  ellipsis: true,
  width: 100,
  align: 'center',
  render: (label, record) => {
    let color
    if (label?.includes('已')) color = 'green';
    if (label?.includes('未')) color = 'volcano';
    if (label?.includes('是')||label==1) color = 'geekblue';
    if (label?.includes('否')||label==0) color = 'volcano';
    return (
      label?.includes(',')?
        (label?.split(',').map((v,i)=>
            <Tooltip title={v} key={i} placement="topLeft" >
              <Tag color={color||''} style={{margin:'2px'}}>
                {v||'-'}
              </Tag>
            </Tooltip>
        )):
          label?
            <Tooltip title={ label==1?'是':label==0?'否':label} placement="topLeft">
              <Tag color={color||''}>
                { label==1?'是':
                  label==0?'否':
                    (label === '' || label === undefined || label === null)?'-':
                      label}
              </Tag>
            </Tooltip>
            :'-'
    );
  }
};

/**
 * select下拉框
 * 前台进行模糊匹配
 * **/
export const handleFilterOption = (input, option) => {
  return option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
};


/**
 * form表单提交时 格式化RangePicker格式日期
 * data: form表单获取到值
 * formatStr：后台所需的日期类型
 * 默认年月日 形如：startTime:["2021-01-07", "2021-01-10"]
 * **/
export const rangPickerFormat = (data, formatStr = 'YYYY-MM-DD') => {
  return data ? data.map(item => item.format(formatStr)) : [];
};

/**
 * form表单提交时 格式化DatePicker格式日期
 * data: form表单获取到值
 * formatStr：后台所需的日期类型
 * 默认年月日 形如：startTime:"2021-01-07"
 * **/
export const datePickerFormat = (data, formatStr = 'YYYY-MM-DD') => {
  return data ? data.format(formatStr) : '';
};

/**
 *去空格
 * * */
export const removeSpaces = (values) => {//
  for (let i in values) {
    if(typeof values[i]==="string"){
      values[i] = values[i].replace(/\s/g, "")
    }else if(values[i]==undefined){
      values[i]=''
    }
  }
}
//升序降序
export function directionFun(sorter){
  let obj
  if (sorter === 'ascend') {
    obj='asc'// 升序
  } else if (sorter === 'descend') {
    obj='desc'// 降序
  } else {
    obj=''// 默认
  }
  return JSON.parse(JSON.stringify(obj));
}
//模板下载
export function templateDownload(url,name){
  const [loading,setLoading]=useState(false)
  const handleExport = (value) => {
    download(url, {
      body:{},
      name: name,
      method: 'GET',
    });
    setLoading(true)
    setTimeout(function () {
      setLoading(false)
    }, 3000)
  };
  return(<>
    <Tooltip title={'下载模板'} placement="topLeft">
      <Button loading={loading} onClick={()=>{handleExport()}}><DownloadOutlined /></Button>
    </Tooltip>

  </>)
}

/**
 * 获取当前url参数
 */
export const getUrlParam = () => {
  const url = window.location.href
  if (url){
    const paramArr = url.slice(url.indexOf("?") + 1).split("&");
    const params = {};
    paramArr?.forEach((param) => {
      const [key, val] = param.split("=");
      params[key] = decodeURIComponent(val);
    });
    return params
  }
};

export async function requestList(val,params,callback){
  const response = await handSearchAPI(params,val)
  if(Array.isArray(response)){
    if (callback){callback(response)}
    return response
  }
  else if (response && response.status === 200) {
    if(response?.data){
      if (callback) callback(response?.data);
      return response?.data
    }else {
      message.error(`获取不到data`)
    }
  } else {
    message.error(`请求失败${response?.status}`)
  }
}

export async function requestAdd(val,params,callback){
  const response = await handSearchAPI(params,val)
  if (response && response.status === 200) {
    if (callback) callback(response?.data);
    return response
  } else {
    message.error(`提交失败，${response?.message}`)
  }
}


/**
 * 批量操作
 * * @returns {*} config
 * @param selectedRows {Array}
 * @param DeleteFun {删除}
 * @param checking {审批}
 * @param antiChecking {反审核}
 */
export function BatchOperation(props){
  const {selectedRows,DeleteFun,checking,antiChecking,action}=props
  return(
    <div className='bottom-list'>
      <Dropdown
        placement="bottomRight"
        disabled={selectedRows?.length<2||(!DeleteFun&&!checking&&!antiChecking)}
        overlay={
          !action?
          <Menu>
            {DeleteFun?
              <Menu.Item key="2">
                <Button size="small" type="link" style={{color:'#666',width:'100%'}} onClick={() =>{DeleteFun(selectedRows)}}>
                  批量删除
                </Button>
              </Menu.Item>:''
            }
            {checking? <Menu.Item key="3">
              <Button size="small" type="link" style={{color:'#666',width:'100%'}} onClick={() =>{checking(selectedRows)}}>
                批量审核/审批
              </Button>
            </Menu.Item>:''
            }
            {antiChecking? <Menu.Item key="4">
              <Button size="small" type="link" style={{color:'#666',width:'100%'}} onClick={() =>{antiChecking(selectedRows)}}>
                批量反审核/反审批
              </Button>
            </Menu.Item>:''
            }
          </Menu>:
            <Menu>
              {DeleteFun&&ActionBool(action.DeleteFun)?
                <Menu.Item key="2">
                  <Button size="small" type="link" style={{color:'#666',width:'100%'}} onClick={() =>{DeleteFun(selectedRows)}}>
                    批量删除
                  </Button>
                </Menu.Item>:''
              }
              {checking&&ActionBool(action.checking)? <Menu.Item key="3">
                <Button size="small" type="link" style={{color:'#666',width:'100%'}} onClick={() =>{checking(selectedRows)}}>
                  批量审核/审批
                </Button>
              </Menu.Item>:''
              }
              {antiChecking&&ActionBool(action.antiChecking)? <Menu.Item key="4">
                <Button size="small" type="link" style={{color:'#666',width:'100%'}} onClick={() =>{antiChecking(selectedRows)}}>
                  批量反审核/反审批
                </Button>
              </Menu.Item>:''
              }
            </Menu>
        }
      >
        <Button>批量操作 {selectedRows?.length?`已勾选${selectedRows?.length}个`:''}</Button>
      </Dropdown>
    </div>
  )
}

/**
 * 简单axios封装 使用方法const { loading, result, error } = useRequest(url,params);
 */
export const useAxios = (url,params,method) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const request = async () => {
    setLoading(true);
    try {
      const result = await axios({
        url,
        params,
        method: method||'post',
      });
      if (result && result.status >= 200 && result.status <= 304) {
        setData(result);
      } else {
        setError(message.error(`请求失败 ${result.status}`));
      }
    } catch (reason) {
      setError(reason);
    }
    setLoading(false);
  };
  useEffect(() => {
    request();
  }, []);
  return {loading,data,error};
};

//获取表格的最大高度
export function getTableMaxHeight() {
  const bodyHeight = document.body.offsetHeight; // 网页可见区域高 (包括边线的高)
  const tableBodyTop = document.getElementsByClassName('ant-table-body')[0].getBoundingClientRect().top; // tableBody距离顶部距离
  const paginationHeight = 100; // 分页器高度(包括间距);
  let residueHeight = bodyHeight - tableBodyTop - paginationHeight
  return residueHeight
}


