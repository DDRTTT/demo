// 需要配置的项
// document: {
  // fileType, // 指明要打开的文档的类型
  // key, // 文档唯一id
  // title, // 文档标题
  // url, // 文件存放路径
  // permissions: { partauth: { authlist } }
      // authlist.push({
        //   partId: item['directoryNumber'], // 内容域id  item，后端返回的标签
        // `/ams/yss-contract-server/directory/selectDirectoryVoListByChangxiekeyInFlow?changxieKey=${contractKey}&isTransacting=${isTransacting}`
          // isTransacting // 是否有权力编辑
      //   canEdit: true, // 是否可以编辑
      //   canView: true, // 是否隐藏
      //   canSetting: false, // 能否设置内容域
      //   canSetPermission: false, // 是否有内容域设置权限
      //   canComment: true, // 能否批注
      // });
// }  // document 结束
// editorConfig: {
  // callbackUrl,  // `${gateWayIp}/ams/ams-file-service/businessArchive/callbackUpdateFile`,
  // user: { id: userInfo.id, name: userInfo.username },
// }
// events: {
//  文档加载事件
//  onDocumentReady: this.onDocumentReady,
//  onRequestClose: this.onRequestClose,
//  onGetDocumentContent: this.onGetDocumentContent,
// }



const cx_edit_config = {
  height: '100%',
  width: '100%',
  type: 'desktop', // desktop PC端 mobile 移动端
  documentType: "text", // 指明文档类型 如 word excel

  document: {
    fileType: 'docx', // 指明要打开的文档的类型
    key: '', // 文档唯一ID
    title: '未知文件名', // 文档标题
    url: '', // 文件存放路径
    permissions: {
      // permissions 文档权限  (permissions.edit和permissions.review 与 mode的值有关
      download: true, // 是否可下载
      edit: false, // 是否可编辑 true 可编辑 false 只读
      print: true,
      review: true, // 是否可修订
      copyoutenabled: true, // 是否可以复制编辑器里的内容
      commentFilter: {
        // 批注设置
        type: 'Default', // Default 全部可见 NoDisplay 全部不可见  DisplaySection 部分可见 NoDisplaySection 部分不可见
        userList: [], // 设置可以看见批注人员的id
      },
      setPermissionShow: true,  // 显示权限配置按钮
      contentControlDefaultPermission: 'ctctrl',
      partauth:  {
        canLockStyle: true, // 是否能锁定样式
        canUnLockStyle: false, // 能否解锁样式
        isStyleLock: false, // 是不是样式锁
        authlist: []
      }
    }
  },
  editorConfig: {
    callbackUrl: ``, //  `${gateWayIp}/ams/ams-file-service/businessArchive/callbackUpdateFile`
    customization: {
      about: false,
      chat: true, // 聊天菜单
      comments: true,
      zoom: 100, // 缩放 默认100
      leftMenu: true, // 左侧菜单  主要操作 搜索、文档结构(目录)、批注、聊天
      rightMenu: false, // 右侧菜单  主要操作 行间距、段间距、背景色、标签、边距等
      toolbar: true, // 上边菜单  所有的操作(包含左右菜单的所有功能)
      header: true,
      statusBar: true, // 下边菜单 主要操作 缩放、修订、显示总页数和当前页
      autosave: true,
      forcesave: true, // 强制保存
      logo: {
        image: '',
      },
    },
    mode: 'edit', // view 只读  edit 编辑
    user: {id: '', name: ''}, // {id: userInfo.id, name: userInfo.username},
    templates: [],
    limitEditMode: 'ctctrl', // editAll ? 'nolimit' : 'ctctrl',
  },
  events: {
    onDocumentReady: ()=>{},
    onRequestClose: ()=>{},
    onGetDocumentContent: ()=>{},
  },
};

export default cx_edit_config;
