/**
 *  修改内容：动态表头设置组件
 *  修改人员：豆帅彬
 *  修改时间：2021年12月16日 15:40:12
 **/
import React, { useState, useEffect, useRef } from 'react';
import { Popover, Checkbox, Divider, Button, message, Tooltip } from 'antd';
import icon_set from '@/assets/dynamicHeader/setting.png';
import icon_reset from '@/assets/dynamicHeader/reset.png';
import styles from './index.less';
import { cloneDeep } from 'lodash';
// import { Container, Draggable } from 'react-smooth-dnd';
import { dynamicColumnSave, dynamicColumnList, dynamicColumnDelete } from '@/services/user';
import { hideTaskTime } from '@/pages/investorReview/func';

const CheckboxGroup = Checkbox.Group;

const Index = ({ columns, pageCode, callBackHandler, taskTypeCode, taskArrivalTimeKey,tabValue,indexID }) => {
  //浮动列数组
  const floatList = useRef([]);
  // 浮动key
  const floatKeyList = useRef([]);
  //  原始columns
  const defaultColumns = useRef(columns);
  // 当前使用的columns 接收原始columns和接口用的
  const currentColumns = useRef([]);
  // 修改使用的columns
  const [customColumns, setCustomColumns] = useState(
    currentColumns.current.map(item => {
      return {
        title: item.title,
        dataIndex: item.dataIndex,
      };
    }),
  );

  //   全选用的key
  let plainOptions = customColumns.map(item => item.dataIndex);

  //   全选按钮的中间态
  const [indeterminate, setIndeterminate] = useState(false);

  //   全选按钮状态
  const [checkAll, setCheckAll] = useState(true);

  //   已经选择的check
  const [checkedList, setCheckedList] = useState(plainOptions);

  //   弹出层的显示隐藏
  const [popover, setPopover] = useState(false);

  //   保存接口的loading
  const [saveLoading, setSaveLoading] = useState(false);

  // 触发器, 初始化的时候从接口取到数据有时不会触发render 加个触发器手动触发一下
  const [toggle, setToggle] = useState(false);

  const sonFlag = useRef(true);

  /**
   *表头列状态切换
   * @param {*} list
   */
  const onChange = list => {
    setCheckedList(list);
  };

  /**
   *全选按钮状态切换
   *
   * @param {*} e
   */
  const onCheckAllChange = e => {
    setCheckedList(e.target.checked ? plainOptions : []);
  };
  //初始化
  const init = () => {
    if (pageCode) {
      getDynamicList(pageCode + (taskTypeCode ? '_' + taskTypeCode : ''));
    }
    const tempList = [];
    const tempcurrentList = [];
    defaultColumns.current.map((item, index) => {
      if (item.fixed) {
        tempList.push({
          index,
          value: item,
        });
      } else {
        tempcurrentList.push(item);
      }
    });
    floatKeyList.current = tempList.map(item => item.value.dataIndex);
    floatList.current = tempList;
    currentColumns.current = tempcurrentList;
    setToggle(!toggle);
  };

  useEffect(() => {
    if ((defaultColumns.current.length == 0 && columns.length != 0) || sonFlag.current == false) {
      sonFlag.current == true;
      defaultColumns.current = columns;
      init();
    }
  }, [columns]);
  //判断是否添加任务到达时间
  useEffect(() => {
    sonFlag.current = false;
    init();
    setPopover(false);
  }, [taskTypeCode]);
  //选中checkbox切换的时候 设置全选按钮的状态
  useEffect(() => {
    setIndeterminate(!!checkedList.length && checkedList.length < plainOptions.length);
    setCheckAll(checkedList.length === plainOptions.length);
  }, [checkedList]);

  useEffect(() => {
    if (currentColumns.current.length > 0) {
      const currentChecked = [];
      setCustomColumns(
        currentColumns.current.map(item => {
          if (item.show == undefined || item?.show == 1) {
            currentChecked.push(item.dataIndex);
          }
          return {
            title: item.title,
            dataIndex: item.dataIndex,
          };
        }),
      );
      setCheckedList(currentChecked);
      plainOptions = customColumns.map(item => item.dataIndex);
      disposeData(currentColumns.current);
    }
  }, [currentColumns.current]);

  /**
   *处理拖拽数据
   *
   * @param {*} [arr=[]]
   * @param {*} dragResult
   * @return {*}
   */
  const onDrag = (arr = [], dragResult) => {
    const { removedIndex, addedIndex, payload } = dragResult;
    if (removedIndex === null && addedIndex === null) {
      return arr;
    }
    const result = [...arr];
    let itemToAdd = payload;
    if (removedIndex !== null) {
      itemToAdd = result.splice(removedIndex, 1)[0];
    }
    if (addedIndex !== null) {
      result.splice(addedIndex, 0, itemToAdd);
    }
    return result;
  };

  /**
   *拖拽
   *
   * @param {*} dropResult
   */
  const onDrop = dropResult => {
    const { removedIndex, addedIndex } = dropResult;
    if (removedIndex !== null || addedIndex !== null) {
      const list = onDrag(customColumns, dropResult);
      setCustomColumns(list);
    }
  };

  //取消 重置表头状态
  const cancelHandler = () => {
    setPopover(false);
    const currentChecked = [];
    setCustomColumns(
      currentColumns.current.map(item => {
        if (item.show == undefined || item?.show == 1) {
          currentChecked.push(item.dataIndex);
        }
        return {
          title: item.title,
          dataIndex: item.dataIndex,
        };
      }),
    );
    setCheckedList(currentChecked);
  };

  //保存当前表头
  const submitHandler = () => {
    const tempColumns = cloneDeep(customColumns);
    if (floatList.current[0]) {
      const flag = tempColumns.find(item => item.dataIndex == floatList.current[0].value.dataIndex);
      if (!flag) {
        floatList.current.map(item => {
          tempColumns.splice(item.index, 0, item.value);
        });
      }
    }
    const resultList = tempColumns.map((item, index) => {
      return {
        pageCode: pageCode + (taskTypeCode ? '_' + taskTypeCode : ''),
        dataIndex: item.dataIndex,
        title: item.title,
        show: item.fixed ? 1 : +checkedList.includes(item.dataIndex),
        sort: index,
      };
    });
    dynamicSaveHandler(resultList);
    setPopover(false);
    disposeData(resultList);
  };

  //处理数据
  const disposeData = resultList => {
    let tempResultList = cloneDeep(resultList);
    const callbackList = [];
    if (floatList.current[0]) {
      const flag = tempResultList.find(
        item => item.dataIndex == floatList.current[0].value.dataIndex,
      );
      if (!flag) {
        floatList.current.map(item => {
          tempResultList.splice(item.index, 0, item.value);
        });
      }
    }

    tempResultList.map((item, index) => {
      if (defaultColumns.current.length <= 0) return;
      let tempItem = cloneDeep(defaultColumns.current).find(
        sonItem => item.dataIndex == sonItem.dataIndex,
      );
      if (!tempItem) return;
      tempItem.show = item.show != undefined ? item.show : 1;
      callbackList.push(tempItem);
    });

    let final = callbackList.filter(item => item.show === 1);

    final.map(item => {
      delete item.show;
    });

    sonFlag.current = true;
    // tempResultList的：checkbox选项，序号，操作需要在数据中被重写
    callBackHandler && callBackHandler(final, tempResultList);
  };
  //获取当前表头的展示状态 接口
  const getDynamicList = async pageCode => {
    try {
      const result = await dynamicColumnList(pageCode);
      if (result.status == 200) {
        if (result.data.length <= 0) return;
        const tempList = [];
        result.data.map(item => {
          if (!floatKeyList.current.includes(item.dataIndex)) {
            tempList.push(item);
          }
        });
        currentColumns.current = tempList;
        setToggle(!toggle);
      } else {
        message.error(result.message);
      }
    } catch (error) {}
  };

  /**
   *保存当前表格的表头 接口
   * @param {*} resultList
   */
  const dynamicSaveHandler = async resultList => {
    setSaveLoading(true);
    try {
      const result = await dynamicColumnSave(resultList);
      if (result.status == 200) {
        const tempList = [];
        resultList.map(item => {
          if (!floatKeyList.current.includes(item.dataIndex)) {
            tempList.push(item);
          }
        });
        currentColumns.current = tempList;
      } else {
        message.error(result.message);
      }
      setSaveLoading(false);
    } catch (error) {}
  };

  /**
   *删除当前表头 接口
   *
   * @param {*} pageCode
   */
  const dynamicDeleteHandler = async pageCode => {
    setSaveLoading(true);
    try {
      const result = await dynamicColumnDelete(pageCode);
      if (result.status == 200) {
        init();
      } else {
        message.error(result.message);
      }
      setSaveLoading(false);
    } catch (error) {}
  };

  // 弹出层内容
  // function Content(){
  //   return(
  //     <div className={styles.popContent}>
  //       <CheckboxGroup value={checkedList} onChange={onChange}>
  //         <Container onDrop={onDrop}>
  //           {customColumns.map(item => {
  //             return (
  //               <Draggable key={item.dataIndex + '_wrap'}>
  //                 <Checkbox key={item.dataIndex} value={item.dataIndex}>
  //                   {item.title}
  //                 </Checkbox>
  //               </Draggable>
  //             );
  //           })}
  //         </Container>
  //       </CheckboxGroup>
  //       <div className="bottomWrap">
  //         <Button onClick={cancelHandler}>取消</Button>
  //         <Button type="primary" onClick={submitHandler} loading={saveLoading}>
  //           确定
  //         </Button>
  //       </div>
  //     </div>
  //   )
  // }

  return (
    <Popover
      placement="bottomRight"
      title={
        <div className={styles.dynameHeaderNav}>
          <Checkbox indeterminate={indeterminate} onChange={onCheckAllChange} checked={checkAll}>
            列展示
          </Checkbox>
          <img
            className={styles.icon_reset}
            src={icon_reset}
            onClick={() => {
              dynamicDeleteHandler(pageCode + (taskTypeCode ? '_' + taskTypeCode : ''));
            }}
          />
        </div>
      }
      content={Content}
      visible={popover}
    >
      <img
        className={styles.icon_set}
        src={icon_set}
        onClick={() => {
          setPopover(true);
        }}
      />
    </Popover>
  );
};

export default Index;
