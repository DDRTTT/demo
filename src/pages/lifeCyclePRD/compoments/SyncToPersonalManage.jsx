import React, { useState, useEffect, useRef } from 'react';
import { Button, Input, Modal, message, Select, Tooltip } from 'antd';
import { connect } from 'dva';
import SelfTree from './SelfTree';
import SingleCustomerEvents from '@/utils/SingleCustomerEvents';
import styles from '@/pages/lifeCyclePRD/index.less';
// 同步至个人管理
/**
 *
 * @param {function} treeMsgChange 树点击回调
 * @param {array}  savePersonalTreeData 个人树
 * @param {array}  documentBigType  标签列
 * @param {function} handleSyncBack 弹出框确认的回调
 * @param
 */

const { Option } = Select;
const Index = props => {
  const { dispatch, savePersonalTreeData, tagData, selectData, handleSyncBack = () => {} } = props;

  // 同步管理弹出框
  const [syncManageVisible, setSyncManageVisible] = useState(false);
  // 同步管理弹出框--选中标签
  const [syncTags, setSyncTags] = useState([]);
  // 子组件传回点击信息
  const [clickData, setClickData] = useState({});
  const personalTreeRef = useRef();

  useEffect(() => {
    SingleCustomerEvents.getInstance().addEventListener('syncEvent', handleModalChange);
  }, []);

  /**
   * 方法说明 循环生成select
   * @method  handleMapList
   * @return {void}
   * @param  {Object[]}       data 数据源
   * @param  {string}         name   select的name
   * @param  {string}         code  select的code
   * @param  {boolean|string} mode  是否可以多选(设置 Select 的模式为多选或标签)
   * @param  {boolean}        fnBoole 选择时函数控制
   * @param  {function}       fn 控制函数
   */
  const handleMapList = (data, code, name, mode = false, fnBoole = false, fn) => {
    if (!data) {
      data = {};
      data.data = [];
    }
    const e = data;
    if (e) {
      const children = [];
      for (const key of e) {
        const keys = key[code];
        const values = key[name];
        children.push(
          <Select.Option key={keys} value={keys}>
            {values}
          </Select.Option>,
        );
      }
      return (
        <Select
          mode={mode}
          showArrow
          style={{ width: '100%' }}
          placeholder="请选择"
          optionFilterProp="children"
          onChange={fnBoole ? fn : ''}
        >
          {children}
        </Select>
      );
    }
  };

  // modal打开/关闭
  const handleModalChange = () => {
    setSyncManageVisible(!syncManageVisible);
  };

  // 获取子组件点击信息
  const getClickMsg = (result, msg) => {
    // console.log(result, msg);
    setClickData(msg);
  };
  // 获取子组件check信息
  const getCheckMsg = (result, msg) => {
    console.log(result, msg);
  };

  // 下拉选择标签
  const handleSyncTagsChange = value => {
    setSyncTags(value);
    // 判断有没有新增的值
    let flag = false;
    values.forEach(item => {
      if (documentTags.indexOf(item) === '-1') {
        flag = true;
      }
    });
    if (flag) {
      dispatch({
        type: 'lifeCyclePRD/handleGetDocumentTags',
        payload: null,
      });
    }
  };

  // 同步管理弹出框--确认
  const handleSyncManageOk = () => {
    if (!selectData.length) {
      message.warn('请选择文件');
      return;
    }
    if (!clickData.code) {
      message.warn('请选择文件夹');
      return;
    }
    let tempArr = [];
    for (let item of selectData) {
      let temp = {};
      temp.achiveId = item.id;
      temp.id = clickData.code;
      temp.groupId = item.groupId;
      temp.label = syncTags.toString();
      temp.fileName = item.fileName;
      tempArr.push(temp);
    }
    dispatch({
      type: 'lifeCyclePRD/handleSaveTagsListMsg',
      payload: tempArr,
    }).then(data => {
      if (data) {
        setSyncManageVisible(false);
        setSyncTags([]);
        personalTreeRef.current.handleReset();
      }
    });
  };

  return (
    <Modal
      title={'同步至个人文档'}
      visible={syncManageVisible}
      onOk={handleSyncManageOk}
      onCancel={() => {
        setSyncManageVisible(false);
        setSyncTags([]);
        personalTreeRef.current.handleReset();
      }}
    >
      <div>选择文件夹</div>
      <SelfTree
        treeData={savePersonalTreeData}
        searchFlag={true}
        draggableFlag={false}
        checkableFlag={false}
        multipleFlag={false}
        getClickMsg={getClickMsg}
        getCheckMsg={getCheckMsg}
        dragTree={false}
        ref={personalTreeRef}
      />
      <div>选择标签</div>
      <div className={styles.tagParentCss}>
        {/* {handleMapList(tagData || [], 'code', 'name', 'tags', true, handleSyncTagsChange)} */}
        <Select
          mode={'tags'}
          showArrow
          style={{ width: '100%' }}
          placeholder="请选择"
          onChange={handleSyncTagsChange}
        >
          {(tagData || []).map(item => {
            return (
              <Select.Option key={item} value={item}>
                {item}
              </Select.Option>
            );
          })}
        </Select>
      </div>
    </Modal>
  );
};
const syncToPersonalManage = state => {
  const {
    dispatch,
    lifeCyclePRD: { documentBigType },
  } = state;
  return {
    dispatch,
    documentBigType,
  };
};
export default connect(syncToPersonalManage)(Index);
