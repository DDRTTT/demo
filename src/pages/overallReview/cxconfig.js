// 编辑器权限参数
let unitParameters = {
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
  forcesave: false, // 强制保存
  mode: 'view', // view 只读  edit 编辑
  user: {
    id: '',
    mane: '',
  },
};
// 编辑器页面样式参数
let cssParameters = {
  height: '800px',
  // height: "500px",
  width: '100%',
  type: 'desktop', // desktop PC端 mobile 移动端
};
export { unitParameters, cssParameters };
