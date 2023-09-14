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
import { getUrlParam, requestList, requestAdd } from '@/pages/investorReview/func';
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
  const [subloading, setSubLoading] = useState(false);
  const [directoryNamesParam, setDirectoryNamesParam] = useState([]);
  const [selectTags, setSelectTags] = useState([]);
  const [processInstanceId, setProcessInstanceId] = useState('');
  const [positionId, setPositionId] = useState('');
  useEffect(() => {
    requestList(
      {
        url: `/yss-contract-server/businessArchive/getTask?taskId=${history.location.state.processList[0].taskList[0].id}`,
        method: 'get',
      },
      {},
      res => {
        setDirectoryNamesParam(res.formData.directoryNamesParam);
      },
    );
    setProcessInstanceId(history.location.state.procinsId);
  }, []);

  const positionsCompare = async (positionsAll, onTaskPositions) => {
    const arr = [];
    let position = [];
    let allPos = [];
    positionsAll.forEach((item, index) => {
      onTaskPositions.forEach(ele => {
        if (item.nodeName.includes('新增') || item.nodeName.includes('统稿人')) {
          arr.push(index);
        }
        if (ele.actName == item.nodeName) {
          arr.push(index);
        }
      });
    });
    position = positionsAll.filter((item, index) => !arr.includes(index));
    await requestList({ url: `/yss-base-admin/positionInfo/getAll`, method: 'get' }, {}, res => {
      allPos = [...res];
    });
    position.forEach(item => {
      allPos.forEach(ele => {
        if (item.nodeName.includes(ele.name)) {
          item.id = ele.id;
        }
      });
    });
    return position;
  };

  const tagsSelect = (tags, directoryNamesParam) => {
    const tag = [];
    let arr = [];
    tags.forEach((item, index) => {
      directoryNamesParam.forEach(ele => {
        if (item.directoryName == ele) {
          tag.push(index);
        }
      });
    });
    arr = tags.filter((item, index) => !tag.includes(index));
    return arr;
  };

  const tagsAll = () => {
    const arr = [...directoryNamesParam];
    selectTags.forEach(item => {
      arr.push(item);
    });
    return arr;
  };

  const submit = async values => {
    // setSubLoading(true);
    const reqBody = {
      taskId: '1',
      processInstanceId,
      rejectActivityId: values.jobId,
    };
    const params = {
      processInstanceId,
      variables: {
        directoryNamesParam: tagsAll(),
      },
    };
    if (urlParam.current?.type == 'back') {
      const reqBody = {
        editMarks: {},
        executionId: history.location.state.processList[0].taskList[0].executionId,
        files: [],
        formData: {},
        job: positionId.toString(), // 退回岗位
        taskId: history.location.state.processList[0].taskList[0].id,
      };
      await requestAdd(
        { url: `/yss-contract-server/businessArchive/multitaskingReject`, method: 'post' },
        reqBody,
      ).then(res => {
        // console.log('新增成功');
      });
      await requestAdd(
        { url: `/api/yss-base-billows/variable-set/process-variables`, method: 'put' },
        params,
      ).then(res => {
        if (res && res.status === 200) {
          message.success(res.message);
          window.history.back();
        }
        setLoading(false);
      });
      return;
    }
    await requestList(
      { url: `/api/yss-base-billows/task-reject/proCreate/id`, method: 'post' },
      reqBody,
      res => {
        // console.log(res);
      },
    );
    await requestAdd(
      { url: `/api/yss-base-billows/variable-set/process-variables`, method: 'put' },
      params,
    ).then(res => {
      if (res && res.status === 200) {
        message.success(res.message);
        window.history.back();
      }
      setLoading(false);
    });
  };

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
              {
                url: `/api/billow-diplomatic/todo-task/node-info?processDefinitionKeys=c054d6d3b36b4dfc84965064169f59c5`,
                method: 'get',
              },
              {},
              res => {
                positionsAll = [...res];
              },
            );
            field.dataSource = await positionsCompare(positionsAll, onTaskPositions);
            field.loading = false;
          });
          onFieldReact('tags', async (field, form) => {
            let jobId = form.getFieldState('jobId')?.inputValues[1]?.id || undefined;
            let tags = [];
            let directoryNamesParam = [];
            let changxieKey = history.location.state.fileSerialNumber;
            if (jobId) {
              await requestList(
                {
                  url: `/yss-contract-server/directory/getlabelByJobKey?jobId=${jobId}&changxieKey=${changxieKey}`,
                  method: 'get',
                },
                {},
                res => {
                  tags = [...res];
                },
              );
              await requestList(
                {
                  url: `/yss-contract-server/businessArchive/getTask?taskId=${history.location.state.processList[0].taskList[0].id}`,
                  method: 'get',
                },
                {},
                res => {
                  directoryNamesParam = res.formData.directoryNamesParam;
                },
              );
              field.dataSource = tagsSelect(tags, directoryNamesParam);
              field.loading = false;
            }
          });
          onFieldInputValueChange('jobId', (field, form) => {
            form.reset('tags');
            setPositionId(field?.inputValues[1]?.id);
            setSelectTags([]);
          });
          onFieldInputValueChange('tags', field => {
            let arr = JSON.parse(JSON.stringify(field.value));
            setSelectTags(arr);
          });
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
            { title: '新增岗位', url: '' },
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
                    fieldNames: { label: 'nodeName', value: 'nodeId' },
                    fieldnamevalue: 'nodeId',
                    optionFilterProp: 'nodeName',
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
                    mode: 'multiple',
                  }}
                />
              </SchemaField>
              <FormButtonGroup.Sticky align="center">
                <FormButtonGroup>
                  <Submit
                    block
                    loading={subloading}
                    onSubmit={values => {
                      submit(values);
                    }}
                  >
                    提交
                  </Submit>
                </FormButtonGroup>
              </FormButtonGroup.Sticky>
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
