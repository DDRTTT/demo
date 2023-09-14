import React, { useEffect, useRef, useMemo, useState } from 'react';
import { useSetState, useRequest } from 'ahooks';
import { createForm, onFieldReact, onFieldMount, onFieldInputValueChange, onFormValuesChange, onFormSubmitValidateEnd, onFormValidateStart,
  FormPath, getValuesIn } from '@formily/core';
import { FormProvider, createSchemaField, VoidField, Field, connect, mapProps } from '@formily/react';
import { Button, Modal, Slider, Rate, Affix, message, Row, Col } from 'antd';
import { action } from '@formily/reactive';
import { Card } from '@/components';
import FormListBox from '@/components/FormListBox';
import SelectTooltip from '@/components/FormListBox/SelectTooltip';
import SubmitGroup from '../../../components/FormListBox/SubmitGroup';
import CustomInput from '@/components/FormListBox/CustomInput';
import { Form, FormItem, DatePicker, Checkbox, Cascader, Editable, Input, NumberPicker, Switch, Password,
  Radio, Reset, Select, Space, Submit, TimePicker, Transfer, TreeSelect, Upload, FormGrid, FormLayout, FormTab,
  FormCollapse, ArrayTable, ArrayCards, FormButtonGroup, ArrayItems } from '@formily/antd';
import { getUrlParam, requestList, requestAdd } from '@/pages/investorReview/func';
import request from '@/utils/request';
import { getSession, setSession } from '@/utils/session';
import { connect as connectDva } from 'dva';
const SchemaField = createSchemaField({
  components: { Space, FormGrid, FormLayout, FormTab, FormCollapse, ArrayTable, ArrayCards, FormItem, DatePicker, Checkbox, Cascader,
    Editable, Input, Text, NumberPicker, Switch, Password, Radio, Reset, Select, Submit, TimePicker, Transfer, TreeSelect, Upload,
    Card, Slider, Rate, ArrayItems, SelectTooltip, CustomInput },
  scope: {},
});

const Index = props => {
  let { publicTas, dispatch, formType, id, onClose, handleGetListFetch, pageSize, setMoreProCode, moreProCode } = props;
  let urlParam = useRef(getUrlParam());
  const [state, setState] = useSetState({
    publicTas: publicTas, //tab切换信息
  });
  const [loading, setLoading] = useState(false);
  const [extend, setExtend] = useState('');

  useEffect(() => {
    handleGetValue();
  }, [id]);
  const handleGetValue = () => {
    if (id) {
      setLoading(true);
      requestList(
        { url: `/yss-contract-server/committee/fund/queryById`, method: 'get' },
        { id: id },
      ).then(res => {
        setLoading(false);
        form.setInitialValues({ ...res });
      });
    }
  }

  const useRequestDefaults = (pattern, service) => {
    onFieldReact(pattern, field => {
      field.loading = true;
      service(field).then(
        action.bound(data => {
          field.dataSource = data;
          field.loading = false;
        }),
      );
    });
  };

  const submit = (values) => {
    setLoading(true);
    if(moreProCode.length > 0){
        requestAdd({url:'/yss-contract-server/committee/fund/updateMore',method:'post'}, {code:values.typeCode,proCode:moreProCode}).then((res)=>{
            if (res&&res.status===200){
              message.success(res.message);
              onClose();
              setMoreProCode([]);
              handleGetListFetch('T001_2',pageSize,1,'','',{});
            }
            setLoading(false)
        })
    } else {
        requestAdd({url:'/yss-contract-server/committee/fund/updateOne',method:'post'}, {...values,id:id||''}).then((res)=>{
            if (res&&res.status===200){
              message.success(res.message);
              onClose();
              handleGetListFetch('T001_2',pageSize,1,'','',{});
            }
            setLoading(false)
        })
    }
    
  }

  const form = useMemo(
    () =>
      createForm({
        readPretty: false,
        validateFirst: formType,
        effects() {
          //产品名称下拉
          onFieldReact('typeCode', field => {
            requestList({ url: `/ams-base-parameter/datadict/queryInfoByList?codeList=committeeType`, method: 'get' },{},res => {
              field.dataSource = res.committeeType;
              field.loading = false;
            });
          });
          onFieldReact('proCode', field => {
            requestList({ url: `/yss-contract-server/RpProduct/queryProductInfo?coreModule=committee`, method: 'get' },{},res => {
              field.dataSource = res.data;
              field.loading = false;
            });
          });
        },
      }),
    [],
  );
  return (
    <>
      <Form form={form} labelCol={3} wrapperCol={18}>
        <SchemaField>
          {!moreProCode.length > 0 && <SchemaField.String
            required={true}
            title={'产品名称'}
            x-decorator="FormItem"
            x-disabled={!id ? false : true}
            x-validator={[]}
            name={'proName'}
            x-component={'SelectTooltip'}
            x-index={0}
            x-component-props={{
              fieldname:'name',
              fieldnamevalue:'code',
              optionFilterProp: 'name',
            }}
          />}
          <SchemaField.String
            required={true}
            title={'业务类型'}
            x-decorator="FormItem"
            x-validator={[]}
            x-disabled={!formType ? false : true}
            name={'typeCode'}
            x-component={'SelectTooltip'}
            x-index={1}
            x-component-props={{
                fieldname:'name',
                fieldnamevalue:'code',
                optionFilterProp: 'name',
            }}
          />
        </SchemaField>
        {!formType && (
          <Row justify="center" style={{display:'flex'}}>
            <Col span={4}><Submit loading={loading} onSubmit={(values) => {submit(values)}}>提交</Submit></Col>
            <Col span={4}><Button loading={loading} onClick={onClose}>取消</Button></Col>
          </Row>
        )}
      </Form>
    </>
  );
};
export default connectDva(({ investmentCommittee, publicModel: { publicTas } }) => ({
  investmentCommittee,
  publicTas,
}))(Index);
