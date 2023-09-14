import React, { useState, useEffect, Component } from 'react';
import { Tree, Input, Tooltip, message, Menu, Dropdown } from 'antd';
import cloneDeep from 'lodash/cloneDeep';
import styles from './index.less';
import { connect } from 'dva';
import { FolderOutlined } from '@ant-design/icons';
// 共享状态
const { TreeNode } = Tree;
const { Search } = Input;

const dataList = [];

class Index extends Component {
  constructor(props) {
    super(props);

    this.state = {
      expandedKeys: [],
      searchValue: '',
      autoExpandParent: true,
      treeData: [],
      checkedKeys: [],
      selectedKeys: [],
    };
  }

  // props值变化时，触发
  componentWillReceiveProps(nextProps) {
    if (JSON.stringify(nextProps.treeData) !== JSON.stringify(this.props.treeData)) {
      this.generateList(nextProps.treeData);
      this.setState({
        treeData: nextProps.treeData,
      });
    }
  }

  componentDidMount() {
    this.generateList(this.props.treeData);
    this.setState(
      {
        treeData: this.props.treeData,
      },
      () => {
        //console.log('this.props.treeData:::', this.props.treeData);
      },
    );
    typeof this.props.onRef === 'function' && this.props.onRef(this);
  }

  generateList = data => {
    for (let i = 0; i < data.length; i++) {
      const node = data[i];
      const { key } = node;
      dataList.push({ key, title: node.title });
      if (node.children) {
        this.generateList(node.children);
      }
    }
  };

  getParentKey = (key, tree) => {
    let parentKey;
    for (let i = 0; i < tree.length; i++) {
      let node = tree[i];
      if (node.children) {
        if (node.children.some(item => item.key === key)) {
          parentKey = node.key;
        } else if (this.getParentKey(key, node.children)) {
          parentKey = this.getParentKey(key, node.children);
        }
      }
    }
    return parentKey;
  };

  // 搜索框改变触发
  searchDataFromTree = (data, e) => {
    const value = data;
    let expandedKeys = dataList
      .map(item => {
        if (item.title.indexOf(value) > -1) {
          return this.getParentKey(item.key, this.state.treeData);
        }
        return null;
      })
      .filter((item, i, self) => item && self.indexOf(item) === i);
    this.setState({
      expandedKeys,
      searchValue: value,
      autoExpandParent: true,
    });
  };

  // 展开/收起节点时触发
  onExpand = expandedKeys => {
    this.setState({
      expandedKeys,
      autoExpandParent: false,
    });
  };

  // drop触发时调用
  onDrop = info => {
    //console.log(info);
    const dropKey = info.node.props.eventKey; // 目标节点
    const dragKey = info.dragNode.props.eventKey; // 移动节点
    // 标准目录不可拖动
    // if (info.dragNode.props.dataRef.source === 0) {
    //   message.warn('标准目录不可拖动');
    //   return;
    // }
    // 项目目录可以作为标准目录的子目录，但不能换顺序
    // if (info.dragNode.props.dataRef.source === 1) {
    //   if (info.node.props.dataRef.source === 0) {
    //     if (info.dropToGap) {
    //       message.warn('禁止更换项目目录与标准目录顺序');
    //       return;
    //     } else {
    //       console.log('进去');
    //     }
    //   }
    // }
    // 新改动：只有同一目录下才可拖拽,并且只能以兄弟排序
    if (info.dragNode.props.dataRef.parentId !== info.node.props.dataRef.parentId) {
      message.warn('禁止跨目录拖动');
      return;
    }
    if (!info.dropToGap) {
      message.warn('禁止跨目录拖动');
      return;
    }
    const dropPos = info.node.props.pos.split('-');
    const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]);

    const loop = (data, key, callback) => {
      data.forEach((item, index, arr) => {
        if (item.key === key) {
          return callback(item, index, arr);
        }
        if (item.children) {
          return loop(item.children, key, callback);
        }
      });
    };
    const data = cloneDeep(this.state.treeData);

    // Find dragObject
    let dragObj;
    loop(data, dragKey, (item, index, arr) => {
      arr.splice(index, 1);
      dragObj = item;
    });

    if (!info.dropToGap) {
      // Drop on the content
      loop(data, dropKey, item => {
        item.children = item.children || [];
        // where to insert 示例添加到尾部，可以是随意位置
        dragObj.parentId = item.id;
        item.children.push(dragObj);
      });
    } else if (
      (info.node.props.children || []).length > 0 && // Has children
      info.node.props.expanded && // Is expanded
      dropPosition === 1 // On the bottom gap
    ) {
      loop(data, dropKey, item => {
        item.children = item.children || [];
        // where to insert 示例添加到头部，可以是随意位置
        item.children.unshift(dragObj);
      });
    } else {
      let ar;
      let i;
      loop(data, dropKey, (item, index, arr) => {
        ar = arr;
        i = index;
      });
      if (dropPosition === -1) {
        ar.splice(i, 0, dragObj);
      } else {
        ar.splice(i + 1, 0, dragObj);
      }
    }

    this.setState({
      treeData: data,
    });
    console.log(this.state.treeData);
    this.props.dragTree(this, data);
  };

  loop = data =>
    data.map(item => {
      const index = item.title.indexOf(this.state.searchValue);
      const beforeStr = item.title.substr(0, index);
      const afterStr = item.title.substr(index + this.state.searchValue.length);
      const title =
        index > -1 ? (
          <span>
            {beforeStr}
            <span style={{ color: '#f50' }}>{this.state.searchValue}</span>
            {afterStr}
          </span>
        ) : (
          <span>{item.title}</span>
        );

      if (item.children) {
        return (
          <TreeNode
            key={item.key}
            title={
              <Tooltip placement="top" title={item.reason}>
                <span style={{ textDecoration: item.applicability == 0 ? 'line-through' : '' }}>
                  {title}
                </span>
              </Tooltip>
            }
            icon={
              <FolderOutlined
                theme={item.hasFile == 1 ? 'filled' : ''}
                style={{
                  color: item.applicability == 0 ? '' : item.source == 1 ? 'green' : 'blue',
                }}
              />
            }
            dataRef={item}
            // disabled={item.applicability === 1 ? false : true}
          >
            {this.loop(item.children)}
          </TreeNode>
        );
      }
      return (
        <TreeNode
          key={item.key}
          title={
            <Tooltip placement="top" title={item.reason}>
              <span style={{ textDecoration: item.applicability == 0 ? 'line-through' : '' }}>
                {title}
              </span>
            </Tooltip>
          }
          icon={
            <FolderOutlined
              theme={item.hasFile == 1 ? 'filled' : ''}
              style={{ color: item.applicability == 0 ? '' : item.source == 1 ? 'green' : 'blue' }}
            />
          }
          dataRef={item}
          // disabled={item.applicability === 1 ? false : true}
        />
      );
    });

  // 点击复选框触发
  onCheck = (checkedKeys, info) => {
    let temp = [];
    info.checkedNodes.forEach(item => {
      temp.push({
        key: item.key,
        value: item.props.dataRef.source,
        applicability: item.props.dataRef.applicability,
      });
    });
    this.setState({ checkedKeys: checkedKeys.checked });
    this.setState({ selectedKeys: checkedKeys.checked });
    // console.log(checkedKeys);

    const newData = { checkedKeys: checkedKeys.checked, dataSource: temp };
    this.props.getCheckMsg(this, newData);
    let clickData = {
      code: info.node.props.dataRef.value,
      parentId: info.node.props.dataRef.parentId,
      name: info.node.props.dataRef.name,
      orderNum: info.node.props.dataRef.orderNum,
      dataSource: info.node.props.dataRef.source,
      applicability: info.node.props.dataRef.applicability,
      title: info.node.props.dataRef.title,
    };
    if (checkedKeys.checked.length > 1 || !checkedKeys.checked.length) {
      clickData = {};
    } else if (checkedKeys.checked.length === 1) {
      const newArr = info.checkedNodes.filter(item => {
        return item.key === checkedKeys.checked[0];
      });
      clickData = {
        code: checkedKeys.checked[0],
        parentId: newArr[0].props.dataRef.parentId,
        name: newArr[0].props.dataRef.name,
        title: newArr[0].props.dataRef.title,
        orderNum: newArr[0].props.dataRef.orderNum,
        dataSource: newArr[0].props.dataRef.source,
        applicability: newArr[0].props.dataRef.applicability,
      };
    }
    this.props.getClickMsg(this, clickData);
  };

  // 点击树节点触发
  onSelect = (selectedKeys, info) => {
    // console.log(selectedKeys, info);
    // let before = this.state.selectedKeys;
    // const index = before.findIndex(item => item === info.node.props.dataRef.value);
    // if (index != -1) {
    //   before.splice(index, 1);
    // }
    this.setState({ selectedKeys, checkedKeys: selectedKeys });
    let temp = [];
    info.selectedNodes.forEach(item => {
      temp.push({
        key: item.key,
        value: item.props.dataRef.source,
        applicability: item.props.dataRef.applicability,
      });
    });

    const checkedData = { checkedKeys: selectedKeys, dataSource: temp };
    this.props.getCheckMsg(this, checkedData);
    let newData = {};
    if (selectedKeys.length === 1) {
      newData = {
        code: info.node.props.dataRef.value,
        parentId: info.node.props.dataRef.parentId,
        name: info.node.props.dataRef.name,
        title: info.node.props.dataRef.title,
        orderNum: info.node.props.dataRef.orderNum,
        dataSource: info.node.props.dataRef.source,
        applicability: info.node.props.dataRef.applicability,
        label: info.node.props.dataRef.label,
        fileTypeCode: info.node.props.dataRef.fileTypeCode,
      };
    }
    this.props.getClickMsg(this, newData, this.state.treeData);
  };

  // 重置信息
  handleReset = () => {
    this.setState({ selectedKeys: [] });
    this.setState({ checkedKeys: [] });
    this.props.getClickMsg(this, {});
    this.props.getCheckMsg(this, {});
  };

  // 异步加载数据组件方法
  /**
   *将查询出来的数据插入到树结构中
   *treeData: 当前树
   * reqData： 请求返回数据
   * treeNode： 点击树节点
   */
  handleData = (treeData, reqData, treeNode) => {
    for (let option of treeData) {
      if (option.key === treeNode.props.dataRef.key) {
        option.children = reqData;
        break;
      }
      if (option.children) {
        this.handleData(option.children, reqData, treeNode);
      }
    }
    return treeData;
  };

  // 异步加载数据
  onLoadData = treeNode =>
    new Promise(resolve => {
      if (treeNode.props.children) {
        resolve();
        return;
      }
      if (this.props.typeUri) {
        const payloadObj = {};
        const param = this.props.syncParam;
        payloadObj[param] = treeNode.props.dataRef.key;
        this.props
          .dispatch({
            type: this.props.typeUri,
            payload: payloadObj,
          })
          .then(data => {
            if (data) {
              let cloneTreeData = cloneDeep(this.state.treeData);
              let finalTreeData = this.handleData(cloneTreeData, data, treeNode);
              this.setState({
                treeData: finalTreeData,
              });
              this.generateList(finalTreeData);
              resolve();
            }
          });
      }
    });

  render() {
    // source: 0:继承的；1：手动的
    // searchFlag：不显示搜索框标识
    const {
      draggableFlag,
      checkableFlag,
      multipleFlag,
      searchFlag,
      syncFlag,
      syncParam,
      typeUri,
    } = this.props;
    return (
      <div style={{ background: '#fff' }}>
        <Search onSearch={this.searchDataFromTree} style={{ display: searchFlag ? 'none' : '' }} />
        <Tree
          checkable={checkableFlag}
          showIcon
          multiple={multipleFlag}
          checkStrictly={true}
          draggable={draggableFlag}
          autoExpandParent={this.state.autoExpandParent}
          expandedKeys={this.state.expandedKeys}
          onExpand={this.onExpand}
          onDrop={this.onDrop}
          onCheck={this.onCheck}
          onSelect={this.onSelect}
          selectedKeys={this.state.selectedKeys}
          checkedKeys={this.state.checkedKeys}
          loadData={syncFlag ? this.onLoadData : undefined}
        >
          {this.loop(this.state.treeData)}
        </Tree>
      </div>
    );
  }
}

export default connect(({ dispatch }) => ({
  dispatch,
}))(Index);
