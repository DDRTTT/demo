// 表格模板配置文件
export default {
  contractDeal: {
    // 招募说明书办理
    ids: '020686d9-96d9-4fe1-bff9-76361e4be026', // 原菜单列表
    pageCode: '020686d9-96d9-4fe1-bff9-76361e4be026_T001_1', // 原菜单列表
    contentType: 2, // 未知
    linkId:'a878187fa60744f895b58fd979194864',
    coreModule:'TContractBusinessArchive',
    // path:"/ams/yss-contract-server/RpProduct/queryAllByCondition", // 列表页获取产品名称
    path:'/ams/yss-contract-server/businessArchive/getBusinessArchiveListProcessInfo?coreModule=TContractBusinessArchive' // 列表请求路径，注意方式为post
  },
  fundAchieveNote: {
    // 基金绩注解
    pageCode: '7b8aac5e-630a-46d1-a753-2acd765640a8', // 菜单拿到的，portal
    contentType: 2, //未知
    config: '',// 通过portal拿到，如有外部服务器，要传的token
    linkId: 'a878187fa60744f895b58fd979194864', // 通过portal拿到的列表id
    path: '/ams/yss-contract-server/RpFundAnno/RpFundAnnos', // 服务地址,新建保存等
    route: '/baseInfoManagement/fundAchieveNote', // 服务地址,新建保存等

    coreModule: 'TRpFundPerformanceAnno', // 核心模块代码
    id: '4028e9b3837e6d8d01846467aac40000', // 新增模板Id
  }
}
