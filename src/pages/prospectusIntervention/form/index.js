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
    SelectTooltip,
  },
  scope: {},
});

const Index = props => {
  let { publicTas, dispatch, formType, history } = props;
  let urlParam = useRef(getUrlParam());
  const [state, setState] = useSetState({
    publicTas: publicTas, //tab切换信息
  });
  const [loading, setLoading] = useState(false);
  const [directoryNamesParam, setDirectoryNamesParam] = useState([])
  const [selectTags, setSelectTags] = useState([])
  const [processInstanceId, setProcessInstanceId] = useState('')
  useEffect(() => {
    requestList({url: `/yss-contract-server/businessArchive/getTask?taskId=${history.location.state.processList[0].taskList[0].id}`,method:'get'},{},res=>{
      setDirectoryNamesParam(res.formData.directoryNamesParam);
    })
    setProcessInstanceId(history.location.state.procinsId)
  }, []);

  const positionsCompare = (positionsAll, onTaskPositions) => {
    const arr = [];
    positionsAll.forEach(item => {
      onTaskPositions.forEach(ele => {
        if (ele.actName.includes(item.name)) {
          ele.id = item.id;
          arr.push(ele);
        }
      });
    });
    return arr;
  };

  const tagsSelect = (tags, directoryNamesParam) => {
    const tag = []
    let arr = []
    tags.forEach((item,index) => {
      directoryNamesParam.forEach(ele => {
        if(item.directoryName == ele) {
          tag.push(index)
        }
      })
    });
    arr = tags.filter((item,index)=>!tag.includes(index));
    return arr
  }

  const tagsAll = () => {
    const arr = [...directoryNamesParam]
    selectTags.forEach(item=>{
      arr.push(item)
    });
    return arr
  }

  const form = useMemo(
    () =>
      createForm({
        readPretty: urlParam.current.formType,
        validateFirst: formType,
        effects() {
          //岗位下拉
          onFieldReact('jobId', async field => {
            let onTaskPositions = [];
            let positionsAll = [];
            await requestList(
              {
                url: `/api/yss-base-billows/task-reject/queryActInfo?processInstanceId=${history.location.state.procinsId}`,
                method: 'get',
              },
              {},
              res => {
                onTaskPositions = [...res];
              },
            );
            await requestList(
              { url: `/yss-base-admin/positionInfo/getAll`, method: 'get' },
              {},
              res => {
                positionsAll = [...res];
              },
            );
            field.dataSource = positionsCompare(positionsAll, onTaskPositions);
            field.loading = false;
          });
          onFieldReact('tags', async (field, form) => {
            let jobId = form.getFieldState('jobId').value || undefined;
            let tags = []
            let directoryNamesParam = [];
            let changxieKey = history.location.state.fileSerialNumber;
            if (jobId) {
              await requestList({url: `/yss-contract-server/directory/getlabelByJobKey?jobId=${jobId}&changxieKey=${changxieKey}`, method: 'get'},{},res => {
                tags = [...res];
              });
              await requestList({url: `/yss-contract-server/businessArchive/getTask?taskId=${history.location.state.processList[0].taskList[0].id}`,method:'get'},{},res=>{
                directoryNamesParam = res.formData.directoryNamesParam
              });
              field.dataSource = tagsSelect(tags, directoryNamesParam);
              field.loading = false;
            }
          });
          onFieldInputValueChange('jobId',(field, form) => {
            form.reset('tags');
            setSelectTags([])
          });
          onFieldInputValueChange('tags', field => {
            let arr = JSON.parse(JSON.stringify(field.value))
            setSelectTags(arr);
          })
        },
      }),
    [],
  );
  return (
    <>
      <FormListBox
        title={'招募说明书干预'}
        loading={loading}
        pageContainerProps={{
          breadcrumb: [
            { title: '招募说明书干预', url: '' },
            { title: urlParam.current.title, url: '' },
          ],
        }}
        div={
          <>
            <Form form={form} labelCol={3} wrapperCol={16}>
              <SchemaField>
                <SchemaField.String
                  required={true}
                  title={'岗位选择'}
                  x-decorator="FormItem"
                  x-validator={[]}
                  name={'jobId'}
                  x-component={'SelectTooltip'}
                  x-index={0}
                  x-component-props={{
                    fieldNames: { label: 'actName', value: 'id' },
                    fieldnamevalue: 'id',
                    optionFilterProp: 'actName',
                  }}
                />
                <SchemaField.String
                  required={true}
                  title={'标签选择'}
                  x-decorator="FormItem"
                  x-validator={[]}
                  name={'tags'}
                  x-component={'SelectTooltip'}
                  x-index={1}
                  // x-mode={'multiple'}
                  x-component-props={{
                    // placeholder:"请选择",
                    fieldNames: { label: 'directoryName', value: 'directoryName' },
                    fieldnamevalue: 'directoryName',
                    optionFilterProp: 'directoryName',
                    mode:'multiple'
                  }}
                />
              </SchemaField>
                <SubmitGroup
                  url={`/api/yss-base-billows/variable-set/process-variables`}
                  method={'put'}
                  record={{
                    processInstanceId:processInstanceId,
                    variables:{
                      directoryNamesParam: tagsAll()
                    }
                  }}
                />
            </Form>
          </>
        }
      />
    </>
  );
};
export default connectDva(({ prospectusIntervention, publicModel: { publicTas } }) => ({
  prospectusIntervention,
  publicTas,
}))(Index);
