//页面-产品相关服务机构-表单
import React, { useEffect, useRef, useMemo, useState } from 'react';
import { useSetState, useRequest } from 'ahooks';
import {
  createForm,
  onFieldReact,
  onFieldMount,
  onFieldInputValueChange,
  onFormValuesChange,
  onFormSubmitValidateEnd,
  onFormValidateStart,
  FormPath,
  getValuesIn,
} from '@formily/core';
import {
  FormProvider,
  createSchemaField,
  VoidField,
  Field,
  connect,
  mapProps,
} from '@formily/react';
import { Button, Modal, Slider, Rate, Affix, message } from 'antd';
import { action } from '@formily/reactive';
import { Card } from '@/components';
import FormListBox from '@/components/FormListBox';
import SelectTooltip from '@/components/FormListBox/SelectTooltip';
import SubmitGroup from '../../../components/FormListBox/SubmitGroup';
import {
  Form,
  FormItem,
  DatePicker,
  Checkbox,
  Cascader,
  Editable,
  Input,
  NumberPicker,
  Switch,
  Password,
  Radio,
  Reset,
  Select,
  Space,
  Submit,
  TimePicker,
  Transfer,
  TreeSelect,
  Upload,
  FormGrid,
  FormLayout,
  FormTab,
  FormCollapse,
  ArrayTable,
  ArrayCards,
  FormButtonGroup,
  ArrayItems,
} from '@formily/antd';
import { getUrlParam, requestList } from '@/pages/investorReview/func';
import request from '@/utils/request';
import { getSession, setSession } from '@/utils/session';
import { connect as connectDva } from 'dva';
const SchemaField = createSchemaField({
  components: {
    Space,
    FormGrid,
    FormLayout,
    FormTab,
    FormCollapse,
    ArrayTable,
    ArrayCards,
    FormItem,
    DatePicker,
    Checkbox,
    Cascader,
    Editable,
    Input,
    Text,
    NumberPicker,
    Switch,
    Password,
    Radio,
    Reset,
    Select,
    Submit,
    TimePicker,
    Transfer,
    TreeSelect,
    Upload,
    Card,
    Slider,
    Rate,
    ArrayItems,
    SelectTooltip
  },
  scope: {},
});

const Index = props => {
  let { publicTas, dispatch, formType } = props;
  let urlParam = useRef(getUrlParam());
  const [state, setState] = useSetState({
    publicTas: publicTas, //tab切换信息
  });
  const [loading, setLoading] = useState(false);
  const [extend, setExtend] = useState('')

  useEffect(() => {
    handleGetValue();
  }, []);
  function handleGetValue() {
    console.log(urlParam.current.id );
    if (urlParam.current.id) {
      setLoading(true);
      requestList(
        { url: `/yss-contract-server/RpFund/viewById`, method: 'get' },
        { id: urlParam.current.id },
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

  const form = useMemo(
    () =>
      createForm({
        readPretty: urlParam.current.formType,
        validateFirst: formType,
        effects() {
          //产品名称下拉
          onFieldReact('proCode', field => {
            requestList(
              { url: `/yss-contract-server/RpFund/getProList`, method: 'get' },
              {},
              res => {
                field.dataSource = res;
                field.loading = false;
              },
            );
          });
          //报告性质下拉
          onFieldReact('yearOrSeason', field => {
            requestList(
              {
                url: `/ams-base-parameter/datadict/queryInfoTest?fcode=yearOrSeason`,
                method: 'get',
              },
              {},
              res => {
                field.dataSource = res;
                field.loading = false;
              },
            );
          });
          //1-3
          onFieldInputValueChange('netGrowthRate', (field, form) => {
            let number = field.value - Number(form.getFieldState('benchmarkRate').value || 0);
            form.setValues({ firThr: number });
          });
          onFieldInputValueChange('benchmarkRate', (field, form) => {
            let number = Number(form.getFieldState('netGrowthRate').value || 0) - field.value;
            form.setValues({ firThr: number });
          });
          //2-4
          onFieldInputValueChange('netGrowthRateSD', (field, form) => {
            let number = field.value - Number(form.getFieldState('benchmarkRateSD').value || 0);
            form.setValues({ secFou: number });
          });
          onFieldInputValueChange('benchmarkRateSD', (field, form) => {
            let number = Number(form.getFieldState('netGrowthRateSD').value || 0) - field.value;
            form.setValues({ secFou: number });
          });
          //报告性质中文传参
          onFieldInputValueChange('yearOrSeason', (field) => {
            setExtend(field.inputValues[1].name)
          })
        },
      }),
    [],
  );
  function date() {
    const format = '{y}-{m}-{d} {h}:{i}:{s}' || '{y}-{m}-{d} {h}:{i}:{s}';
    let date = new Date();
    const formatObj = {
      y: date.getFullYear(),
      m: date.getMonth() + 1,
      d: date.getDate(),
      h: date.getHours(),
      i: date.getMinutes(),
      s: date.getSeconds(),
      a: date.getDay(),
    };
    const time_str = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
      let value = formatObj[key];
      // Note: getDay() returns 0 on Sunday
      if (key === 'a') {
        return ['日', '一', '二', '三', '四', '五', '六'][value];
      }
      if (result.length > 0 && value < 10) {
        value = '0' + value;
      }
      return value || 0;
    });
    return time_str;
  }
  return (
    <>
      <FormListBox
        title={'基金业绩'}
        loading={loading}
        pageContainerProps={{
          breadcrumb: [
            { title: '基金业绩', url: '' },
            { title: urlParam.current.title, url: '' },
          ],
        }}
        div={
          <>
            <Form form={form} labelCol={8} wrapperCol={13}>
              <SchemaField>
                <SchemaField.Void
                  x-component="FormGrid"
                  x-component-props={{
                    maxColumns: 2,
                  }}
                >
                  <SchemaField.String
                    required={true}
                    title={'产品名称'}
                    x-decorator="FormItem"
                    x-disabled={!urlParam.current.id ? false : true}
                    x-validator={[]}
                    name={'proCode'}
                    x-component={'SelectTooltip'}
                    x-index={0}
                    x-component-props={{
                      // placeholder:"请选择",
                      fieldNames: { label: 'name', value: 'code' },
                      fieldnamevalue:'code',
                      optionFilterProp:'name'
                    }}
                  />
                  <SchemaField.String
                    required={true}
                    title={'报告性质'}
                    x-decorator="FormItem"
                    x-validator={[]}
                    name={'yearOrSeason'}
                    x-component="Select"
                    x-index={1}
                    x-component-props={{
                      // placeholder:"请选择",
                      fieldNames: { label: 'name', value: 'code' },
                    }}
                  />
                  <SchemaField.String
                    title={'开始日期'}
                    name="startDate"
                    required={true}
                    x-decorator="FormItem"
                    x-validator={[]}
                    x-component="DatePicker"
                    x-index={2}
                  />
                  <SchemaField.String
                    title={'结束时间'}
                    name="endDate"
                    required={true}
                    x-decorator="FormItem"
                    x-validator={[]}
                    x-component="DatePicker"
                    x-index={3}
                  />
                  <SchemaField.String
                    title={'产品份额净值增长率①'}
                    name="netGrowthRate"

                    required={true}
                    x-decorator="FormItem"
                    x-validator={[]}
                    x-component="NumberPicker"
                    x-index={4}
                    x-component-props={{
                      precision: 4,
                    }}
                  />
                  <SchemaField.String
                    title={'同期业绩比较基准收益率③'}
                    name="benchmarkRate"
                    required={true}
                    x-decorator="FormItem"
                    x-validator={[]}
                    x-component="NumberPicker"
                    x-index={5}
                    x-component-props={{
                      precision: 4,
                    }}
                  />
                  <SchemaField.String
                    title={'①-③'}
                    name="firThr"
                    x-disabled={true}
                    x-decorator="FormItem"
                    x-validator={[]}
                    x-component="NumberPicker"
                    x-index={6}
                    x-component-props={{
                      precision: 4,
                    }}
                  />
                  <SchemaField.String
                    title={'净值增长率标准差②'}
                    required={true}
                    name="netGrowthRateSD"
                    x-decorator="FormItem"
                    x-validator={[]}
                    x-component="NumberPicker"
                    x-index={7}
                    x-component-props={{
                      precision: 4,
                    }}
                  />
                  <SchemaField.String
                    title={'业绩比较基准收益率标准差④'}
                    name="benchmarkRateSD"
                    required={true}
                    x-decorator="FormItem"
                    x-validator={[]}
                    x-component="NumberPicker"
                    x-index={8}
                    x-component-props={{
                      precision: 4,
                    }}
                  />
                  <SchemaField.String
                    title={'②-④'}
                    name="secFou"
                    x-disabled={true}
                    x-decorator="FormItem"
                    x-validator={[]}
                    x-component="NumberPicker"
                    x-index={9}
                    x-component-props={{
                      precision: 4,
                    }}
                  />
                </SchemaField.Void>
              </SchemaField>
              {!urlParam.current.formType && <SubmitGroup
                url={!urlParam.current.id ? '/yss-contract-server/RpFund/conserve' : '/yss-contract-server/RpFund/changeById'}
                method={'post'}
                id={urlParam.current.id}
                record={{
                  lastEditTime: date(),
                  lastEditorId: JSON.parse(sessionStorage.getItem('USER_INFO')).id,
                  extend,
                }}
              />}
            </Form>
          </>
        }
      />
    </>
  );
};
export default connectDva(({ fundPerformance, publicModel: { publicTas } }) => ({
  fundPerformance,
  publicTas,
}))(Index);
