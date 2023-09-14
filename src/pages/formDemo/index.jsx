//页面-招募说明书设置
import React, {useEffect, useRef, useMemo, useState} from 'react';
import {useSetState} from "ahooks";
import { createForm,onFieldReact,onFieldInputValueChange,onFormValuesChange,onFormSubmitValidateEnd,onFormValidateStart,FormPath,getValuesIn} from '@formily/core'
import { FormProvider, createSchemaField,VoidField,Field, } from '@formily/react'
import {Button, Modal, Slider, Rate, Spin, Col} from 'antd';
import { Card, PageContainers } from '@/components';
import FormBody from '../../components/FormListBox';
import {SelectTooltip,TreeSelectTooltip} from '@/components/formBox';
import {cloneDeep} from "lodash";
import styles from './index.less';
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
  PreviewText,
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
  ArrayItems
} from '@formily/antd'
import {errorBoundary} from "@/layouts/ErrorBoundary";
import {linkHoc} from "@/utils/hocUtil";
import {connect} from "dva";
import {getUrlParam} from "@/pages/investorReview/func";

const MyInput = (props) => {
  return (
    <input
      style={{
        color: 'red',
        background: 'none',
        outline: 'none',
        width: '100%',
        border: '1px solid grey',
      }}
      value={props.value}
      onChange={props.onChange}
    />
  );
}

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
    PreviewText,
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
    MyInput,
    SelectTooltip,
    TreeSelectTooltip
  },
})

const Index = (props)=>{
  const {publicTas}=props
  let urlParam=useRef(getUrlParam())
  const [loading,setLoading]=useState(false)
  const [state, setState] = useSetState({
    publicTas:publicTas,//tab切换信息
  })
  useEffect(() => {
    form.setInitialValues({
      username2: 'Aston Martin',
      address:['140000', '140200', '140212']
    })
  }, []);
  // const useAddress = (pattern) => {
  //   const transform = (data = {}) => {
  //     return Object.entries(data).reduce((buf, [key, value]) => {
  //       if (typeof value === 'string')
  //         return buf.concat({
  //           label: value,
  //           value: key,
  //         })
  //       const { name, code, cities, districts } = value
  //       const _cities = transform(cities)
  //       const _districts = transform(districts)
  //       return buf.concat({
  //         label: name,
  //         value: code,
  //         children: _cities.length
  //           ? _cities
  //           : _districts.length
  //             ? _districts
  //             : undefined,
  //       })
  //     }, [])
  //   }
  //   onFieldReact(pattern, (field) => {
  //     field.loading = true
  //     fetch('//unpkg.com/china-location/dist/location.json')
  //       .then((res) => res.json())
  //       .then(
  //         action.bound((data) => {
  //           field.dataSource = transform(data)
  //           field.loading = false
  //         })
  //       )
  //   })
  // }
  const form = useMemo(() => createForm({
    effects() {
      onFieldReact('Select3', (field) => {//受控组件
        field.query('proName').value()==1?//控制组件
          (field.display='none',//显示隐藏
            field.dataSource = [//改变下拉
              {label: 'AAA', value: '111',},
              {label: 'BBB',value: '222',},
            ],
            field.setInitialValue(field.value='222')//改变默认值
          )
          :field.display='visible'
      })
      onFieldReact('proCode',(field)=>{
        if(field.query('proName').value()==3){
          field.dataSource = [//改变下拉
            {label: 'AAA', value: '111',},
            {label: 'BBB',value: '222',},
          ]
          field.setInitialValue(field.value='222')//改变默认值
        }else {
          field.dataSource = [//改变下拉
            {label: 'ccc', value: '333',},
            {label: 'ddd',value: '444',},
          ]
          field.setInitialValue(field.value='444')//改变默认值
        }
      })
      //字段校验结束的副作用钩子   可以用来做保存
      onFormSubmitValidateEnd((form) => {
        let formValue=cloneDeep(form.values)
        console.log('formValue',formValue)
      })
      //用于监听表单校验开始的副作用钩子   可以用来做保存
      onFormValidateStart((form) => {
        let formValue=cloneDeep(form.values)
        console.log('formValue',formValue)
      })
      // useAddress('address')
    }
  }),[])

  let listData=[
    {
      title: 'Node1',
      value: 'Node1',
      key: '0-0',
      children: [
        {
          title: 'Child Node1',
          value: 'Child Node1',
          key: '0-0-0',
        },
      ],
    },
    {
      title: 'Node2',
      value: '0-1',
      key: '0-1',
      children: [
        {
          title: 'Child Node3',
          value: '0-1-0',
          key: 'Child-Node3',
        },
        {
          title: 'Child Node4',
          value: '0-1-1',
          key: 'Child-Node4',
        },
        {
          title: 'Child Node5',
          value: '0-1-2',
          key: 'Child-Node5',
        },
      ],
    },
    {
      title: 'Node2',
      value: '0-1',
      key: '11',
      children: [
        {
          title: 'Child Node3',
          value: '0-1-0',
          key: 'Child-Node3',
        },
        {
          title: 'Child Node4',
          value: '0-1-1',
          key: 'Child-Node4',
        },
        {
          title: 'Child Node5',
          value: '0-1-2',
          key: 'Child-Node5',
        },
      ],
    },
    {
      title: 'Node2',
      value: '0-1',
      key: '22',
      children: [
        {
          title: 'Child Node3',
          value: '0-1-0',
          key: 'Child-Node3',
        },
        {
          title: 'Child Node4',
          value: '0-1-1',
          key: 'Child-Node4',
        },
        {
          title: 'Child Node5',
          value: '0-1-2',
          key: 'Child-Node5',
        },
      ],
    },
    {
      title: 'Node2',
      value: '0-1',
      key: '33',
      children: [
        {
          title: 'Child Node3',
          value: '0-1-0',
          key: 'Child-Node3',
        },
        {
          title: 'Child Node4',
          value: '0-1-1',
          key: 'Child-Node4',
        },
        {
          title: 'Child Node5',
          value: '0-1-2',
          key: 'Child-Node5',
        },
      ],
    },
  ];

  const schema = {
    type: 'object',
    properties: {
      string_array: {
        type: 'array',
        'x-component': 'ArrayItems',
        'x-decorator': 'FormItem',
        title: '字符串数组',
        items: {
          type: 'void',
          'x-component': 'Space',
          properties: {
            sort: {
              type: 'void',
              'x-decorator': 'FormItem',
              'x-component': 'ArrayItems.SortHandle',
            },
            input: {
              type: 'string',
              'x-decorator': 'FormItem',
              'x-component': 'Input',
            },
            remove: {
              type: 'void',
              'x-decorator': 'FormItem',
              'x-component': 'ArrayItems.Remove',
            },
          },
        },
        properties: {
          add: {
            type: 'void',
            title: '添加条目',
            'x-component': 'ArrayItems.Addition',
          },
        },
      },
      array: {
        type: 'array',
        'x-component': 'ArrayItems',
        'x-decorator': 'FormItem',
        title: '对象数组',
        items: {
          type: 'object',
          properties: {
            space: {
              type: 'void',
              'x-component': 'Space',
              properties: {
                sort: {
                  type: 'void',
                  'x-decorator': 'FormItem',
                  'x-component': 'ArrayItems.SortHandle',
                },
                date: {
                  type: 'string',
                  title: '日期',
                  'x-decorator': 'FormItem',
                  'x-component': 'DatePicker.RangePicker',
                  'x-component-props': {
                    style: {
                      width: 160,
                    },
                  },
                },
                input: {
                  type: 'string',
                  title: '输入框',
                  'x-decorator': 'FormItem',
                  'x-component': 'Input',
                },
                select: {
                  type: 'string',
                  title: '下拉框',
                  enum: [
                    { label: '选项1', value: 1 },
                    { label: '选项2', value: 2 },
                  ],
                  'x-decorator': 'FormItem',
                  'x-component': 'Select',
                  'x-component-props': {
                    style: {
                      width: 160,
                    },
                  },
                },
                remove: {
                  type: 'void',
                  'x-decorator': 'FormItem',
                  'x-component': 'ArrayItems.Remove',
                },
              },
            },
          },
        },
        properties: {
          add: {
            type: 'void',
            title: '添加条目',
            'x-component': 'ArrayItems.Addition',
          },
        },
      },
      array2: {
        type: 'array',
        'x-component': 'ArrayItems',
        'x-decorator': 'FormItem',
        'x-component-props': { style: { width: 300 } },
        title: '对象数组',
        items: {
          type: 'object',
          'x-decorator': 'ArrayItems.Item',
          properties: {
            sort: {
              type: 'void',
              'x-decorator': 'FormItem',
              'x-component': 'ArrayItems.SortHandle',
            },

            input: {
              type: 'string',
              title: '输入框',
              'x-decorator': 'Editable',
              'x-component': 'Input',
              'x-component-props': {
                bordered: false,
              },
            },
            config: {
              type: 'object',
              title: '配置复杂数据',
              'x-component': 'Editable.Popover',
              'x-reactions':
                '{{(field)=>field.title = field.value && field.value.input || field.title}}',
              properties: {
                date: {
                  type: 'string',
                  title: '日期',
                  'x-decorator': 'FormItem',
                  'x-component': 'DatePicker.RangePicker',
                  'x-component-props': {
                    style: {
                      width: 160,
                    },
                  },
                },
                input: {
                  type: 'string',
                  title: '输入框',
                  'x-decorator': 'FormItem',
                  'x-component': 'Input',
                },
                select: {
                  type: 'string',
                  title: '下拉框',
                  enum: [
                    { label: '选项1', value: 1 },
                    { label: '选项2', value: 2 },
                  ],
                  'x-decorator': 'FormItem',
                  'x-component': 'Select',
                  'x-component-props': {
                    style: {
                      width: 160,
                    },
                  },
                },
              },
            },
            remove: {
              type: 'void',
              'x-decorator': 'FormItem',
              'x-component': 'ArrayItems.Remove',
            },
          },
        },
        properties: {
          add: {
            type: 'void',
            title: '添加条目',
            'x-component': 'ArrayItems.Addition',
          },
        },
      },
    },
  }

  // let loading
  return<>
    <FormBody title={''} loading={false}
              // pageContainerProps
      div={<>
        <Form form={form} labelCol={8} wrapperCol={16}>
            <Col span={12}>
              <Field
                name="username1"
                title="用户名1"
                required
                decorator={[FormItem]}
                component={[Input]}
              />
              <Field
                name="username2"
                title="用户名2"
                required
                decorator={[FormItem]}
                component={[Input]}
              />
              <Field
                name="tree"
                title="选择框"
                decorator={[FormItem]}
                component={[TreeSelect,{treeCheckable:true,showCheckedStrategy:TreeSelect.SHOW_ALL,treeDefaultExpandAll:true,treeCheckStrictly:true}]}
                dataSource={listData}
              />
            </Col>
            <Col span={12}>
              <Field
                name="username3"
                title="用户名3"
                decorator={[FormItem]}
                component={[Input]}
              />
              <Field
                name="username4"
                title="用户名4"
                decorator={[FormItem]}
                component={[Input]}
              />
              <Field
                name="自定义组件"
                title="自定义组件"
                decorator={[FormItem]}
                // content={<MyInput/>}
              />
            </Col>
            <Submit
              // onClick={e=>console.log('onClick',e.target)}
              onSubmit={e=>console.log('onSubmit',e)}
              // onSubmitSuccess={e=>console.log('onSubmitSuccess',e)}
              // onSubmitFailed={e=>onSubmitFailed(e)}
            >提交</Submit>
          </Form>

        <Form form={form} labelCol={8} wrapperCol={16}>
          <SchemaField>
            <SchemaField.Void
              x-component="FormCollapse"
              x-index={0}
              name="prprh9uwyb1"
            >
              <SchemaField.Void
                x-component="FormCollapse.CollapsePanel"
                x-component-props={{ header: "Unnamed Title" }}
                x-index={0}
                name="t39v1nu45c3"
              >
                <SchemaField.Void
                  x-component="FormGrid"
                  x-validator={[]}
                  x-index={0}
                  name="g15ao8ug6ur"
                >
                  <SchemaField.Void
                    x-component="FormGrid.GridColumn"
                    x-index={0}
                    x-validator={[]}
                    name="epwn2i9ytt1"
                  >
                    <SchemaField.String
                      name="address"
                      title="地址选择"
                      x-decorator="FormItem"
                      x-component="Cascader"
                      x-component-props={{style: {width: 240}}}
                    />
                    <SchemaField.String
                      title="啊书法大赛的"
                      x-decorator="FormItem"
                      x-component="Select"
                      x-validator={[]}
                      x-index={0}
                      name="proName"
                      enum={[
                        { children: [], label: "选项 1", value: "1" },
                        { children: [], label: "选项 2", value: "2" },
                        { children: [], label: "选项 3", value: "3" },
                      ]}
                      default="1"
                    />
                    <SchemaField.Markup
                      title="标题"
                      x-decorator="FormItem"
                      x-component="Select"
                      x-validator={[]}
                      name="proCode"
                      enum={[
                        { children: [], label: "选项 1", value: "1" },
                        { children: [], label: "选项 2", value: "2" },
                        { children: [], label: "选项 3", value: "3" },
                      ]}
                      default="2"
                    />
                  </SchemaField.Void>
                  <SchemaField.Void
                    x-component="FormGrid.GridColumn"
                    x-validator={[]}
                    x-index={1}
                    name="ba1m9nautrk"
                  >
                    <SchemaField.Markup
                      title="阿西吧"
                      x-decorator="FormItem"
                      x-component="Select"
                      x-validator={[]}
                      x-index={0}
                      name="Select3"
                      enum={[
                        { children: [], label: "选项 1", value: "1" },
                        { children: [], label: "选项 2", value: "2" },
                        { children: [], label: "选项 3", value: "3" },
                      ]}
                      default="2"
                    />
                    <SchemaField.String
                      title="我会被渲染的自定义组件"
                      x-decorator="FormItem"
                      x-validator={[]}
                      name="3123213123"
                      x-component="MyInput"
                    />
                    <SchemaField.String
                      title="自定义SelectTooltip"
                      x-decorator="FormItem"
                      x-validator={[]}
                      name="SelectTooltip"
                      x-component="SelectTooltip"
                      enum={[
                        { children: [], label: "选项 1", value: "1" },
                        { children: [], label: "选项 2", value: "2" },
                        { children: [], label: "选项 3", value: "3" },
                      ]}
                    />
                    <SchemaField.String
                      title="TreeSelect"
                      x-decorator="FormItem"
                      x-validator={[]}
                      name="TreeSelect"
                      x-component="TreeSelect"
                      enum={listData}
                      x-component-props={{
                        treeCheckStrictly:true,////父子节点选中状态不再关联
                        allowClear: true,//支持清除
                        showArrow: true,//是否显示下拉小箭头
                        showSearch: true,//配置是否可搜索
                        treeCheckable: true,//显示 Checkbox
                        treeDefaultExpandAll: true,//默认展开所有树节点
                        showCheckedStrategy: "SHOW_ALL",//显示所有选中节点
                        placeholder:"请选择",
                        // maxTagCount:1,//响应式布局让选项自动收缩
                      }}
                    />
                    <SchemaField.String
                      title="自定义TreeSelectTooltip"
                      x-decorator="FormItem"
                      x-validator={[]}
                      name="TreeSelectTooltip"
                      x-component="TreeSelectTooltip"
                      enum={listData}
                    />
                  </SchemaField.Void>
                </SchemaField.Void>
              </SchemaField.Void>
            </SchemaField.Void>
          </SchemaField>
          <SchemaField schema={schema} />
          <FormButtonGroup>
            <Submit onSubmit={(values) => {
              console.log('onSubmit',values)
            }}
            >提交
            </Submit>
            <Submit
              // onClick={(e)=>{
              //   return false
              // }}
              onSubmit={(values) => {
                console.log('onSubmit',values)
              }}
              onSubmitFailed={(values) => {
                console.log('onSubmit',values)
              }}
            >暂存
            </Submit>
          </FormButtonGroup>
        </Form>
      </>}
    />
  </>
}

export default Index
