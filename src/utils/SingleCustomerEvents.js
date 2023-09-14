// 自定义事件控制 发布订阅模式
export default class SingleCustomerEvents {
  constructor() {
    this.instance = null;
    this.handlers = {};
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new SingleCustomerEvents();
    }
    return this.instance;
  }
  //   事件添加方法
  addEventListener(type, handler) {
    if (!(type in this.handlers)) {
      this.handlers[type] = null;
    }
    this.handlers[type] = handler;
  }

  //   触发事件
  dispatchEvent(type, ...params) {
    if (!(type in this.handlers)) {
      return new Error('未注册事件');
    }
    this.handlers[type](...params);
  }
  //   事件移除
  removeEventListener(type, handler) {
    if (!(type in this.handlers)) {
      return new Error('无效事件');
    }
    delete this.handlers[type];
  }
}
