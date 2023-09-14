export default [
  // {
  //   name: '招募说明书主流程',
  //   path: '/contract/prospectuSetHome',
  //   component: './prospectuSetHome',
  // },
  {
    name: '在线编辑',
    path: '/contract/contractManage',
    component: './contractManage/operation',
  },
  {
    name: '文档管理',
    path: '/contract/electronicRecord',
    component: './electronicRecord',
  },
  {
    name: '模板管理',
    path: '/contract/templateSet',
    component: './templateManage/templateSet',
  },
  {
    name: '模板详情',
    path: '/contract/templateDetails',
    component: './templateManage/tplDetail',
  },
  {
    name: '产品模板详情',
    path: '/contract/templateProduct',
    component: './templateManage/tplProduct',
  },
  {
    name: '已办理产品详情',
    path: '/contract/templateCheckView',
    component: './templateManage/tplCheckView',
  },
  {
    name: '合同管理',
    path: '/contract/contractList',
    component: './contractList',
  },
  {
    name: '模板条款管理',
    path: '/contract/templateClauseManage',
    component: './templateClauseManage',
  },
  {
    name: '模板条款查看',
    path: '/contract/templateClauseManage/check',
    component: './templateClauseManage/check',
  },
  {
    name: '招募说明书设置',
    path: '/contract/prospectuSet',
    component: './prospectuSet',
  },
  {
    name: '招募说明书产品模板',
    path: '/contract/productSet',
    component: './productSet',
  },
  {
    name: '招募说明书标准模板',
    path: '/contract/standardTpl',
    component: './standardTpl',
  },
  {
    name: '招募说明书看板(统稿人)',
    path: '/contract/instructionsBoard',
    component: './instructionsBoard',
  },
  {
    name: '招募说明书通篇审核',
    path: '/contract/overallReview',
    component: './overallReview',
  },
  {
    name: '招募说明书通篇审核审核页',
    path: '/contract/overallReviewDetail',
    component: './overallReview/review',
  },
  {
    name: '招募说明书通篇审核反审核页',
    path: '/contract/overallDeReviewDetail',
    component: './overallReview/dereview',
  },
  {
    name: '招募说明书查看',
    path: '/contract/detail',
    component: './instructionsBoard/detail',
  },
  {
    name: '招募说明书预览',
    path: '/contract/preview',
    component: './instructionsBoard/preview',
  },
  {
    name: '投资组合报告预览',
    path: '/contract/cxpreview',
    component: './cxPreview',
  },
  {
    name: '清洁版Word文档',
    path: '/contract/cleanWord',
    component: './cleanWord',
  },
  //投资组合报告
  {
    name: '投资组合报告',
    path: '/contract/portfolioReport',
    component: './portfolioReport',
  },
  {
    name: '投资组合报告-查看',
    path: '/contract/portfolioReport/viewTable',
    component: './portfolioReport/viewTable',
  },
  {
    name: '招募说明书设置',
    path: '/contract/prospectusConfigIndex',
    component: './prospectusConfigIndex/',
  },
  {
    name: '招募说明书设置查看',
    path: '/contract/prospectusConfig/view',
    component: './prospectusConfig/pages/view'
  },
  {
    name: '招募说明书设置修改',
    path: '/contract/prospectusConfig/edit',
    component: './prospectusConfig/pages/EditConfig'
  },
  {
    name: 'FormDemo',
    path: '/contract/FormDemo',
    component: './FormDemo'
  },
  {
    name: '招募说明书标准模板',
    path: '/contract/standardTemplateProspectus',
    component: './standardTemplateProspectus/',
  },

  {
    name: '产品相关服务机构',
    path: '/contract/productServiceOrganizations',
    component: './productServiceOrganizations/',
  },
  {
    name: '产品相关服务机构-表单',
    path: '/contract/productServiceOrganizations/form',
    component: './productServiceOrganizations/form',
  },

  {
    name: '产品基本信息',
    path: '/contract/basicProductInformation',
    component: './basicProductInformation/',
  },
  {
    name: '产品基本信息-表单',
    path: '/contract/basicProductInformation/form',
    component: './basicProductInformation/form',
  },

  {
    name: '其他应披露事项',
    path: '/contract/otherMattersDisclosed',
    component: './otherMattersDisclosed/',
  },
  {
    name: '其他应披露事项-表单',
    path: '/contract/otherMattersDisclosed/form',
    component: './otherMattersDisclosed/form',
  },

  {
    name: '产品经理人任职情况',
    path: '/contract/positionProductManager',
    component: './positionProductManager',
  },
  {
    name: '产品经理人任职情况-表单',
    path: '/contract/positionProductManager/form',
    component: './positionProductManager/form',
  },

  {
    name: '产品经理人简介',
    path: '/contract/productManagerProfile',
    component: './productManagerProfile',
  },
  {
    name: '产品经理人简介-表单',
    path: '/contract/productManagerProfile/form',
    component: './productManagerProfile/form',
  },

  {
    name: '产品经理人简介',
    path: '/contract/institutionalManage',
    component: './institutionalManage',
  },
  {
    name: '产品经理人简介-表单',
    path: '/contract/institutionalManage/form',
    component: './institutionalManage/form',
  },

  {
    name: '机构管理',
    path: '/contract/institutionalManage',
    component: './institutionalManage',
  },
  {
    name: '机构管理-表单',
    path: '/contract/institutionalManage/form',
    component: './institutionalManage/form',
  },

  {
    name: '机构信息',
    path: '/contract/institutionalManage/organizationInformation',
    component: './institutionalManage/organizationInformation',
  },
  {
    name: '机构信息-表单',
    path: '/contract/institutionalManage/organizationInformation/form',
    component: './institutionalManage/organizationInformation/form',
  },
  {
    name: '基金业绩',
    path: '/contract/fundPerformance',
    component: './fundPerformance/',
  },
  {
    name: '基金业绩-表单',
    path: '/contract/fundPerformance/form',
    component: './fundPerformance/form',
  },

  {
    name: '基金业绩注解',
    path: '/contract/notesFundPerformance',
    component: './notesFundPerformance/',
  },
  {
    name: '基金业绩注解-表单',
    path: '/contract/notesFundPerformance/form',
    component: './notesFundPerformance/form',
  },
  {
    name: '投委会管理',
    path: '/contract/investmentCommittee',
    component: './investmentCommittee'
  },
  {
    name: '招募说明书干预',
    path: '/contract/prospectusIntervention',
    component: './prospectusIntervention'
  },
  {
    name: '招募说明书干预-表单',
    path: '/contract/prospectusIntervention/form',
    component: './prospectusIntervention/form'
  },
  {
    name: '招募说明书干预-岗位表单',
    path: '/contract/prospectusIntervention/formPositions',
    component: './prospectusIntervention/formPositions'
  },
  {
    name: '干预-修改文档',
    path: '/contract/interventionDefect',
    component: './interventionDefect'
  },
  {
    name: '招募说明书干预-强制修改文档',
    path: '/contract/interventionDefect/cxConfig',
    component: './interventionDefect/cxConfig'
  }
]
