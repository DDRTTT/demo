import React, {forwardRef, useImperativeHandle, useState} from 'react';
import {Button, message, Modal, Popover, Spin, Table, Tag, Transfer, Typography} from 'antd';
import {getAll, getStaffList, staffSave} from '@/services/prospectuSet';

const { Text } = Typography;

const PermissBox = forwardRef((
  props,
  ref,
) => {

  const [permissionVisible, setPermissionVisible] = useState(false);
  const [permissionLoading, setPermissionLoading] = useState(false);
  const [templateKey, settTmplateKey] = useState('');
  const [staffVisible, setStaffVisible] = useState(false);
  const [staffLoading, setStaffLoading] = useState(false);
  const [data, setData] = useState([]);
  const [allKeys, setAllKeys] = useState([]);
  const [targetKeys, setTargetKeys] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [contractDirectoryId, setContractDirectoryId] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectData, setSelectData] = useState([]);
  useImperativeHandle(ref, () => ({
    showModal,
    getList,
  }))
  const showModal = (templateKey) => {
    setPermissionVisible(true);
    settTmplateKey(templateKey)
    getList(templateKey);
  };
  const getList = (templateKey) => {
    setPermissionLoading(true);
    return new Promise((resolve, reject)=>{
      getStaffList({changxieKey: templateKey}).then(res=>{
        if (res?.status === 200) {
          let powerData = [];
          // powerData = res.data; // res.data.filter(item => !item.directoryName.includes('填充'));
          if(props.docxTags.length > 0) {
            props.docxTags.forEach(item => {
              for(let i = 0; i < res.data.length; i++) {
                if(item.name === res.data[i].directoryName) {
                  powerData.push(res.data[i]);
                }
              }
            })
          }
          resolve(powerData)
          setData(powerData);
          setPermissionLoading(false);
        }
      })
    })
  };
  const staffChange = (nextTargetKeys, direction, moveKeys) => {
    setTargetKeys(nextTargetKeys)
  };

  const selectChange = (sourceSelectedKeys, targetSelectedKeys) => {
    setSelectedKeys([...sourceSelectedKeys, ...targetSelectedKeys])
  };

  const handleCancel = () => {
    setPermissionLoading(false);
    setPermissionVisible(false);
    setSelectedRowKeys([]);
    setSelectData([]);
  };
  const columns = [
    { title: '标签名称', dataIndex: 'directoryName', width: 180,
      render: (value, record)=>{
        return (<Text style={{whiteSpace:'nowrap'}}>{value}</Text>)
      }
    },
    { title: '授权岗位', dataIndex: 'positionInfoList', width: 200,
      render: (positionInfoList,record)=>{
        return (
          <span>
            {positionInfoList.length !== 0 ? positionInfoList.map(item=>{
              return (<Text key={item.id}>{item.name}&nbsp;&nbsp;</Text>)
            }) : ''
            }
          </span>
        )
      }
  },
    { title: '授权用户', dataIndex: 'userList',width: 'auto',
      render: (userList) => {
        return (
          <span>
            {userList.length !== 0 ? userList.map(item=>{
              return (<Text style={{whiteSpace: 'nowrap'}} key={item.id}>{item.username}&nbsp;&nbsp;</Text>)
            }) : ''}
          </span>
        )
      }
    },
    { title: '操作', dataIndex: 'id', width: 80, fixed:'right',
      render: (val, record) => <Button type='link' onClick={() => setUser(true, record)}>设置</Button>
    },
  ];
  const userMap = directoryControlVos => {
    return (
      <span>
        {directoryControlVos.length > 0 &&
          directoryControlVos.map((item, idx) => (
            <Popover placement="topLeft" key={idx}
              title={
                <div style={{ height: 60 }}>
                  <div style={{ float: 'left' }}>
                    <img
                      style={{
                        width: 60,
                        height: 60,
                        borderRadius: 20,
                        marginRight: 10,
                      }}
                      src={`${props.IPObject.nginxIp}${item.logo}`}
                      alt="头像"
                    />
                  </div>
                  <div style={{ float: 'left' }}>
                    <p>{item.username}</p>
                    <p>{item.userId}</p>
                  </div>
                </div>
              }
              content={
                <div>
                  <p>用户类型: {item.typeName}</p>
                  <p>手机号码: {item.mobile}</p>
                  <p>邮箱账号: {item.email}</p>
                </div>
              }
            >
              <Tag> {item.username} </Tag>
            </Popover>
          ))}
      </span>
    );
  };
  const setUser = (flag = false, record = {}) => {
    setSelectedRowKeys([]);
    setSelectData([]);
    setStaffVisible(flag);
    setStaffLoading(flag);
    setContractDirectoryId(record.id ? record.id : '');
    if (flag) {
      let allKeys = [], targetKeys = [];
      targetKeys = record.positionInfoList.map(item => String(item.id));
      getAll().then(res => {
        if (res?.status === 200) {
          const resData = res.data;
          allKeys = resData.map(item => {
            return {
              key: String(item.id),
              title: item.name,
            };
          });
          setAllKeys(allKeys);
          setTargetKeys(targetKeys);
          setStaffLoading(false);
        }
      })
    }
  };
  const setUsers = (flag = false) => {
    if (selectedRowKeys.length === 0) {
      return message.warning('请选择需要设置的标签')
    }
    setStaffVisible(flag)
    setStaffLoading(flag)
    if (flag) {
      let allKeys = [], targetKeys = [];
      selectData.forEach(item => {
        item.positionInfoList.forEach(ele=> {
          targetKeys.push(String(ele.id))
        })
      });
      targetKeys = Array.from(new Set(targetKeys));
      getAll().then(res => {
        if (res?.status === 200) {
          const resData = res.data;
          allKeys = resData.map(item => {
            return {
              key: String(item.id),
              title: item.name,
            };
          });
          setAllKeys(allKeys);
          setTargetKeys(targetKeys);
          setStaffLoading(false);
        }
      })
    }
  }
  const savePermiss = () => {
    let arr = [];
    if (selectedRowKeys.length > 0) {
      setStaffLoading(true);
      if(targetKeys.length > 0){
        selectedRowKeys.forEach(item=>{
          targetKeys.forEach(ele =>{
            arr.push({contractDirectoryId: item, positionId: ele});
          })
        });
      } else {
        selectedRowKeys.forEach(item=>{
          arr.push({contractDirectoryId: item, positionId: ''});
        });
      }
      staffSave(arr).then(res=>{
        if (res?.status === 200) {
          message.success('操作成功');
          setStaffLoading(false);
          setStaffVisible(false);
          setSelectedRowKeys([]);
          setSelectData([]);
          getList(templateKey);
        }
      })
    } else {
      if (targetKeys.length > 0) {
        arr = targetKeys.map(item => {
          return {
            contractDirectoryId,
            positionId: item,
          }
        });
      }else{
        arr = [{contractDirectoryId, positionId: ''}]
      }
      setStaffLoading(true);
      staffSave(arr).then(res=>{
        if (res?.status === 200) {
          message.success('操作成功');
          setStaffLoading(false);
          setStaffVisible(false);
          getList(templateKey);
        }
      })
    }
  };
  const onSelectChange = (newSelectedRowKeys,selectData) => {
    setSelectedRowKeys(newSelectedRowKeys);
    setSelectData(selectData);
  };
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };
  return (
    <div>
      <Modal bodyStyle={{padding: '10px 20px 20px 20px'}} visible={permissionVisible} title="权限设置" destroyOnClose={true}
        onCancel={handleCancel}
        width={'80%'} footer={null}
        headStyle={{ borderBottom: 'none' }}>
        <div style={{marginBottom: '10px', float: 'right'}}><Button size="small" onClick={()=> setUsers(true)}>批量设置</Button></div>
        <Table
          columns={columns}
          dataSource={data}
          scroll={{x: 1000}}
          bordered={true}
          pagination={false}
          rowSelection={rowSelection}
          loading={permissionLoading}
          rowKey={(record)=>record.id}
        />
      </Modal>

      <Modal visible={staffVisible} title="设置标签权限" onOk={ savePermiss } okText='保存' destroyOnClose={true}
        onCancel={() => setUser(false)} cancelText='关闭' zIndex={1001} width={758}>
        <Spin spinning={staffLoading}>
          <Transfer  titles={['备选待授权岗位', '已选被授权岗位']} showSearch
            operations={['审批入库', '撤消入库']}
            dataSource={allKeys}
            targetKeys={targetKeys}
            selectedKeys={selectedKeys}
            onChange={staffChange}
            onSelectChange={selectChange}
            render={item => item.title}
            listStyle={{ width: 300, height: 400 }}
          />
        </Spin>
      </Modal>
    </div>
  )
})

export default PermissBox;
