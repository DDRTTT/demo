import { Button, Modal, message, Tag } from 'antd';
import request from 'umi-request';
import router from 'umi/router';

export const handleShowTransferHistory = record => {
  request
    .get(
      `/ams/yss-lifecycle-flow/common/processListByProcessInstId?processInstId=${record.id}`,
    )
    .then(res => {
      if (res && res.status === 200 && res.data) {
        if (res.data.length === 1) {
          return handleGo(record);
        } else {
          return handleAddMInfo(res.data);
        }
      } else return handleGo(record);
    });
};

const handleGo = data => {
  return router.push(
    `/processCenter/processHistory?processInstanceId=${data.processInstanceId}&taskId=${data.taskId}`,
  );
};

const handleAddMInfo = data => {
  const arr = [];
  data.forEach(i => {
    arr.push(
      <div key={i.taskId} style={{ marginBottom: '10px' }}>
        <span style={{ marginRight: '30px' }}>{`发起人 : ${i.startUserId}`}</span>
        {handleAddTag(i.processStatus)}
        <span style={{ marginRight: '30px' }}>{`开始时间 : ${i.startTime}`}</span>
        {i.endTime ? <span style={{ marginRight: '30px' }}>{`结束时间 : ${i.endTime}`}</span> : ''}
        <Button
          style={{ float: 'right' }}
          size="small"
          onClick={() => [handleGo(i), Modal.destroyAll()]}
        >
          流转历史
        </Button>
      </div>,
    );
  });

  return Modal.info({
    title: '流转历史任务记录',
    okText: '关闭',
    content: arr,
    closable: true,
    width: '900px',
  });
};

const handleAddTag = val => {
  switch (val) {
    case '已完成':
      return (
        <Tag color="green" style={{ marginRight: '30px' }}>
          已完成
        </Tag>
      );
    case '未完成':
      return (
        <Tag color="red" style={{ marginRight: '30px' }}>
          未完成
        </Tag>
      );

    default:
      '';
  }
};
