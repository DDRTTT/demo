// 文档下载地址
export const downloadUrl = 'ams/ams-file-service/fileServer/downloadUploadFile';
// http://192.168.105.46:18000/ams/ams-file-service/fileServer/downloadUploadFile?getFile=0215102544017530351
// 文档修改的回调地址
export const callbackUrl = 'ams/ams-file-service/businessArchive/callbackUpdateFile';
// 权限参数
export const unitParameters = {
  download: true, // 下载
  edit: true, // 编辑
  print: true,
  review: true, // 修订
  copyoutenabled: true, // 是否可以复制编辑器里的内容
  commentFilter: {
    // 批注设置
    type: 'Default', // Default 全部可见 NoDisplay 全部不可见  DisplaySection 部分可见 NoDisplaySection 部分不可见
    userList: [], // 设置可以看见批注人员的id
  },
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
  mode: 'edit', // view 只读  edit 编辑
  user: {
    id: '',
    name: '',
  },
};
// 页面样式参数
export const cssParameters = {
  height: '800px',
  // height: "500px",
  width: '100%',
  type: 'desktop', // desktop PC端 mobile 移动端
};
// 1.	提取当前文档所有内容域的标题、标签名称、id
export const OBJECT = {
  object: 'content', // /操作内容域，必填项
  type: 'text', // 提取内容域属性，必填项
  name: '', // 提取指定标签名称内容域的属性，和id互斥，优先级高于id,如name及id都未填写，则获取当前文档全部内容域
  id: '', // 提取指定id内容域的属性，和name互斥,优先级低于id,如name及id都未填写，则获取当前文档全部内容域
};

