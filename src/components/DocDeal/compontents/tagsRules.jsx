import React, {forwardRef, useImperativeHandle, useState} from 'react';
import {Button, Form, Input, Modal} from 'antd';

const layout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 15 },
};
const TagsRules = forwardRef((
  props,
  ref,
) => {
  const [form]=Form.useForm()
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [curId, setCurId] = useState(-1);
  const [_pair, set_pair] = useState([]);
  // const [form] = Form.useForm;
  useImperativeHandle(ref, () => ({
    showModal,
  }))
  const showModal = ({curId, formVals, _pair}) => {
    set_pair(_pair)
    setCurId(curId)
    setIsModalVisible(true);
    if (formVals) {
      form.setFieldsValue({
        ...formVals
      });
    } else {
      form.resetFields();
    }
  };
  const handleOk = () => {
    form.validateFields().then(formVals=>{
      const rulesForm = {}
      for(const key in formVals) {
        rulesForm[key.substring(1)] = formVals[key]
      }
      props.getTagsRules({ rulesForm, curId,})
    })
    setIsModalVisible(false);
  };
  const handleCancel = () => {
    setIsModalVisible(false);
  };
  const handleRest = () => {
    const curItem = _pair.find(item=>item.id === curId)
    if (curItem ) {
      if (curItem.rulesForm) {
        form.setFieldsValue({
          Fitem: curItem.rulesForm.item,
          Foperate: curItem.rulesForm.operate,
          Fvalue: curItem.rulesForm.value,
        })
      } else {
        form.resetFields();
      }
    }
  };

  return (
    <Modal zIndex={10000} title="业务要素获取规则" width={800} visible={isModalVisible}
      onOk={handleOk} onCancel={handleCancel}
      footer={[
        <Button key="back" onClick={handleCancel}> 取消 </Button>,
        <Button key="link" onClick={handleRest}> 重置 </Button>,
        <Button key="save" type="primary" onClick={handleOk}> 保存 </Button>,
      ]}
    >
      <Form {...layout} form={form} >
        <Form.Item name="Fitem" label="对比的属性" >
          <Input placeholder="请输入" allowClear />
        </Form.Item>
        <Form.Item name="Foperate" label="对比的运算" >
          <Input placeholder="请输入" allowClear />
        </Form.Item>
        <Form.Item name="Fvalue" label="对比的值">
          <Input placeholder="请输入" allowClear />
        </Form.Item>
      </Form>
    </Modal>
  )
})

export default TagsRules;
