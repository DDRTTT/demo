export default class staticInstance {
  constructor() {
    this.instance = null;
    // 机构管理机构名称
    this.orgName = '';
    // 产品看板的系列切换
    this.billboardRadioKey = '1';
    // 电子档案左侧树点击信息
    this.treeClickData = {};
    // 电子档案，完整树
    this.tree = [];
    // 电子档案，关键词
    this.keyWords = '';
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new staticInstance();
    }
    return this.instance;
  }
}
