// 流程的连线图

let scale = 1;

let ctx = null;
// 高度之间的间隔
let ySpace = 10;
// 阶段背景默认宽度
let defaultWidth = 1000;
// 阶段背景的基础高度
let phaseBasedHight = 80;
// 阶段里面高度的留白
let phaseInnerSpace = 30;
// 舞台边缘的留白
let whiteSpace = 50;
// 舞台的宽度
let stageWidth = 1000;
// 圆点的半径
let circleRadius = 10;
// 圆点的直径
let circleDiameter = circleRadius * 2;
// 流程连接的线预留的距离
let processLineSpace = 70;
// 分叉限制 超过多少以后改变方向
let forkLimt = 7;
// 竖着排列的点容器的高度
let colWrapHeight = 120;
// 线的颜色
let lineColor = '#C6CEDA';
// 背景之间的高度
let bgSpc = 8;
// 竖着的点向上便宜的距离
let pointTansY = 60;

// 拐弯的弧度
let angle = 18;

// 预设的bg的颜色
const preSetBgColorList = [
  'rgba(255, 243, 247, 0.8)',
  'rgba(253, 255, 243, 0.8)',
  'rgba(243, 255, 254, 0.8)',
  'rgba(243, 245, 255, 0.8)',
  'rgba(255, 243, 255, 0.8)',
];
// 预设每个点的颜色
const preSetCircleColorList = ['#0681c7', '#fd4d36', '#fdab23', '#37b5ff', '#9537ff'];
// 原点置灰的颜色
const circleDisabledColor = '#C6CEDA';
// 文字置灰的颜色
const fontDisabledColor = '#95A4BC';

/**
 * 获取随机颜色
 *
 * @return  {string}  [色值]
 */
function handlerRgba(isTransparent = false) {
  // rgb颜色随机
  const r = Math.random() * 236 + 50;
  const g = Math.random() * 236 + 50;
  const b = Math.random() * 236 + 100;
  // var a = Math.random() * 0.5 + 0.2;
  const a = 0.2;
  return isTransparent ? `rgba(${r},${g},${b},${a})` : `rgb(${r},${g},${b})`;
}
/**
 * 基础的属性配置
 */
class Basis {
  constructor(color = handlerRgba()) {
    this.x = 0;
    this.y = 0;
    this.width = 0;
    this.height = 0;
    this.color = color;
    this.id = -1;
    this.next = -1;
    this.type = null;
    this.lineStyle = null;
    this.stageCode = null;
    this.digit = null;
    this.nodeActionType = '//';
    this.nodeActionUri = '//';
    this.count = 0;
    this.status = 0;
  }
}
/**
 * 圆点
 */
class Circle extends Basis {
  constructor(dir = 'row', color) {
    super();
    this.radius = circleRadius;
    this.label = '';
    this.dir = dir;
  }

  draw() {
    ctx.beginPath();
    ctx.fillStyle = '#EB852A';
    ctx.save();
    ctx.shadowOffsetX = 1; // 阴影Y轴偏移
    ctx.shadowOffsetY = 1; // 阴影X轴偏移
    ctx.shadowBlur = 5; // 模糊尺寸
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)'; // 颜色
    // status 0未发起|1处理中|2已完成
    if (this.status != 2) {
      // 如果不是已完成 都是正常颜色
      ctx.fillStyle = this.type != 'common' ? this.color : circleDisabledColor; // 填充颜色,默认是黑色
    } else {
      // 已完成的状态
      ctx.fillStyle = circleDisabledColor;
    }
    ctx.arc(this.x, this.y, this.radius, 0, 360, false);
    ctx.fill(); // 画实心圆
    ctx.closePath();
    if (this.type != 'common' && this.count) {
      // 圆上面的数字
      ctx.beginPath();
      const count = new custText(`${this.count}`, 'row', '#FFFFFF', 's');
      count.x = this.x;
      count.y = this.y + 1;
      count.draw();
      ctx.closePath();
    }
    // 默认的颜色
    let tempColor = '#474C54';
    // 不是正常的节点
    if (this.type == 'common') {
      tempColor = circleDisabledColor;
    } else if (this.status == 2) {
      // 已处理的话
      tempColor = fontDisabledColor;
    }

    // 圆的名字
    ctx.beginPath();
    const text = new custText(this.label, this.dir, tempColor, 'n', this.procode, this.stageCode);
    text.x = this.x;
    text.y = this.y + this.radius * 3;
    text.draw();
    ctx.closePath();
    ctx.restore();
  }
}
/**
 * 文本
 */
class custText extends Basis {
  constructor(text, dir, color = '#474C54', spec = 'n', _procode, _stageCode) {
    super();
    this.text = text;
    this.color = color;
    // 方向 是横着还是竖着
    this.dir = dir;
    this.lineHeight = 20 * scale;
    this.width = circleDiameter * 3;
    this.height = circleDiameter * 5;
    this.spec = spec;

    this.proCode = _procode;
    this.stageCode = _stageCode;
  }

  draw() {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.font = this.spec == 'n' ? 14 * scale + "px '微软雅黑'" : 11 * scale + "px '微软雅黑'";
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    // 文字换行
    // 字符串分割成数组
    const arrText = this.text.split('');
    // 横着的
    if (this.dir == 'row') {
      // 当前字符串及宽度
      let currentText = '';
      let currentWidth = 0;
      for (const letter of arrText) {
        currentText += letter;
        currentWidth = ctx.measureText(currentText).width;
        if ((this.proCode == 'A002_2' || this.proCode == 'A002_3') && false) {
          if (currentWidth > this.width - 14) {
            ctx.fillText(currentText, this.x, this.y);
            currentText = '';
            this.y += this.lineHeight;
          }
        } else if (
          this.proCode != 'A002_2' &&
          this.proCode != 'A002_3' &&
          false
        ) {
          if (currentWidth > this.width - 14) {
            ctx.fillText(currentText, this.x, this.y);
            currentText = '';
            this.y += this.lineHeight;
          }
        }
      }
      if (currentText) {
        ctx.fillText(currentText, this.x, this.y);
      }
    } else {
      // 当前字符串及宽度
      const currentText = '';
      const currentWidth = 0;
      const spa = Math.floor(this.height / this.lineHeight);
      const result = [];
      for (let i = 0; i < arrText.length; i += spa) {
        result.push(arrText.slice(i, i + spa));
      }
      const xStandard = result.length == 1 ? 0 : this.lineHeight;
      const initValue = (xStandard * result.length) / 2;
      // 如果只有一个x就是this.x
      const specialOne = result.length == 1 ? 0 : 1;
      result.forEach((item, index) => {
        item.forEach((sonItem, sonIndex) => {
          ctx.fillText(
            sonItem,
            this.x - initValue + (this.lineHeight / 2) * specialOne + xStandard * index,
            this.y + this.lineHeight * sonIndex,
          );
        });
      });
    }
    ctx.closePath();
  }
}
/**
 * 流程阶段背景
 */
class Rect extends Basis {
  constructor() {
    super();
  }

  draw() {
    ctx.beginPath();
    const r = 20 * scale;
    ctx.fillStyle = this.color;
    ctx.moveTo(this.x + r, this.y);
    ctx.arcTo(this.x + this.width, this.y, this.x + this.width, this.y + r, r);
    ctx.arcTo(
      this.x + this.width,
      this.y + this.height,
      this.x + this.width - r,
      this.y + this.height,
      r,
    );
    ctx.arcTo(this.x, this.y + this.height, this.x, this.y + this.height - r, r);
    ctx.arcTo(this.x, this.y, this.x + r, this.y, r);
    ctx.fill();
    // ctx.fillStyle = this.color;
    // ctx.rect(this.x, this.y, this.width, this.height);
    // ctx.fill();
    // ctx.closePath();
  }
}
/**
 * 直线
 */
class Line {
  constructor(startX, startY, endX, endY) {
    this.startX = startX;
    this.startY = startY;
    this.endX = endX;
    this.endY = endY;
    this.draw();
  }

  draw() {
    ctx.beginPath();
    // ctx.strokeStyle = this.color;
    // ctx.strokeStyle = '#A9A9A9';
    // ctx.strokeStyle = '#C6CEDA';
    ctx.strokeStyle = '#e0e6ef';
    ctx.moveTo(this.startX, this.startY);
    ctx.lineTo(this.endX, this.endY);
    ctx.lineWidth = 4 * scale;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.closePath();
  }
}
/**
 * 弧线
 */
class arcToLine extends Line {
  constructor(startX, startY, midX, midY, endX, endY) {
    super(startX, startY, endX, endY);
    this.midX = midX;
    this.midY = midY;
    this.draw();
  }

  draw() {
    ctx.beginPath();
    ctx.strokeStyle = '#e0e6ef';
    ctx.moveTo(this.startX, this.startY);
    ctx.arcTo(this.midX, this.midY, this.endX, this.endY, angle);
    ctx.lineCap = 'round';
    ctx.lineWidth = 4 * scale;
    ctx.stroke();
    ctx.closePath();
  }
}
// 处理接口返回的数据
function disposeData(_list) {
  // 替换一些属性名(只是懒得全局改属性了而已)
  _list = JSON.parse(
    JSON.stringify(_list)
      .replace(/elementId/g, 'id')
      .replace(/name/g, 'label'),
  );
  //   预设的两个点 用来辅助计算用的
  const forkPlace = {
    id: '',
    label: 'place',
    type: 'place',
  };
  const forkEnd = {
    id: '',
    label: 'forkEnd',
    type: 'forkEnd',
  };
  const resultList = [];
  const parallelList = [];
  _list.forEach((stageItem, stageIndex) => {
    const normal = stageItem.normal || [];
    const { stageCode, stageName } = stageItem;
    const phaseItem = {
      stageCode,
      stageName,
      normal,
    };
    const { nextCells } = stageItem;
    nextCells.forEach((item, index) => {
      // 如果是并行的节点就不添加了
      if (parallelList.includes(item.id)) return;
      // 如果只有一个
      if (!item.nextCell || item.nextCell.length == 1) {
        if (item.code != 'parallel') {
          normal.push(item);
        }
      } else {
        // 如果是分叉 (分叉的点必须要在同一个阶段,不支持有不同阶段的分叉)
        if (item.code != 'parallel') {
          normal.push(item);
        }
        const forkStart = {
          id: '',
          label: 'forkStart',
          type: 'forkStart',
          children: [],
        };
        // 如果是同一个阶段
        if (stageCode == item.nextCell[0].stageCode) {
          item.nextCell.forEach((sonItem, sonIndex) => {
            const forkItem = nextCells.find(temp => temp.id == sonItem.id);
            if (!forkItem) return;
            forkStart.children.push(forkItem);
            parallelList.push(forkItem.id);
          });
          normal.push(forkStart, forkPlace, forkEnd);
        } else {
          item.nextCell.forEach((sonItem, sonIndex) => {
            const forkItem = _list[stageIndex + 1].nextCells.find(temp => temp.id == sonItem.id);
            if (!forkItem) return;
            forkStart.children.push(forkItem);
            parallelList.push(forkItem.id);
          });
          _list[stageIndex + 1].normal = [];
          _list[stageIndex + 1].normal.push(forkStart, forkPlace, forkEnd);
        }
      }
    });
    resultList.push(phaseItem);
  });
  return resultList;
}

// 假数据,canvas要的数据格式,接口返回的数据,要转成这个格式的
// #region <------------- start----------->
// var fakeData = [{
//     stageCode: 1,
//     stageName: 'name1',
//     normal: [{
//       id: 1,
//       label: '开始',
//     }, {
//       id: 2,
//       label: '产品评审产品评审',
//       digit: 10
//     }, {
//       id: 19,
//       label: 'forkStart',
//       type: 'forkStart',
//       children: [{
//         id: 20,
//         label: '产品评审',
//         digit: 10
//       }, {
//         id: 21,
//         label: '持有人大会',
//         digit: 10
//       }, ]
//     }, {
//       id: 100,
//       label: 'place',
//       type: 'place'
//     }, {
//       id: 101,
//       label: 'forkEnd',
//       type: 'forkEnd'
//     }, {
//       id: 3,
//       label: '立项通过',
//       digit: 10
//     }, {
//       id: 4,
//       label: '合同定稿',
//       digit: 10
//     }, ]
//   },
//   {
//     stageCode: 100,
//     stageName: 'name100',
//     normal: [{
//       id: 6,
//       label: 'forkStart',
//       type: 'forkStart',
//       children: [{
//         id: 7,
//         label: '文件审核公告'
//       }, {
//         id: 8,
//         label: '运营参数'
//       }, ]
//     }, {
//       id: 100,
//       label: 'place',
//       type: 'place'
//     }, {
//       id: 9,
//       label: 'forkEnd',
//       type: 'forkEnd'
//     }, ]
//   }
// ]
// #endregion <------------- end----------->

// bg的数组
let rectList = [];

// 关系列表
let relation = [];

// 每个阶段的高度
let layerHeightStages = [];
// 每个阶段有几层
let phaseLayerNum = [];
// 阶段背景颜色
let rectColor = {};

/**
 * 计算流程阶段背景的高度
 */
function computedRectHeight(_number) {
  let height = 0;
  const initSpace = _number > 1 ? phaseInnerSpace : 0;
  // height = initSpace * 2 + phaseBasedHight + (ySpace + circleDiameter) * _number;
  height = initSpace * 1.5 + phaseBasedHight + (ySpace + circleDiameter) * _number;
  phaseLayerNum.push(_number);
  return height;
}

// #endregion <------------- end----------->
// 画线
function drawLine(startPoint, endPoint, dir = 'row', isThrou = false, phaseDir = null) {
  // 拐弯的时候预留的宽度
  const reserved = angle;
  // 阶段内的连线
  if (!isThrou) {
    // 横着
    if (dir == 'row') {
      // 在一条普通的线上普通的连
      if (startPoint.y == endPoint.y) {
        new Line(startPoint.x, startPoint.y, endPoint.x, endPoint.y);
      } else {
        // 前方高能 会拐弯的线要来了
        // 分叉的线是从分叉的点向普通的点连的
        // 特殊情况上下对齐的直接连线就好了
        if (startPoint.y == endPoint.y) {
          new Line(startPoint.x, startPoint.y, endPoint.x, endPoint.y);
          return;
        }
        // 右边的
        if (startPoint.x < endPoint.x) {
          // 上面的
          if (startPoint.y < endPoint.y) {
            // 右上角
            new Line(startPoint.x, startPoint.y, endPoint.x - reserved * 2, startPoint.y);
            new arcToLine(
              endPoint.x - reserved * 2,
              startPoint.y,
              endPoint.x - reserved,
              startPoint.y,
              endPoint.x - reserved,
              startPoint.y + reserved,
            );
            new Line(
              endPoint.x - reserved,
              startPoint.y + reserved,
              endPoint.x - reserved,
              endPoint.y - reserved,
            );
            new arcToLine(
              endPoint.x - reserved,
              endPoint.y - reserved,
              endPoint.x - reserved,
              endPoint.y,
              endPoint.x,
              endPoint.y,
            );
          } else {
            // 右下角
            new Line(startPoint.x, startPoint.y, endPoint.x - reserved * 2, startPoint.y);
            new arcToLine(
              endPoint.x - reserved * 2,
              startPoint.y,
              endPoint.x - reserved,
              startPoint.y,
              endPoint.x - reserved,
              startPoint.y - reserved,
            );
            new Line(
              endPoint.x - reserved,
              startPoint.y - reserved,
              endPoint.x - reserved,
              endPoint.y + reserved,
            );
            new arcToLine(
              endPoint.x - reserved,
              endPoint.y + reserved,
              endPoint.x - reserved,
              endPoint.y,
              endPoint.x,
              endPoint.y,
            );
          }
        } else {
          // 左边的
          if (startPoint.y < endPoint.y) {
            // 左上角
            new Line(startPoint.x, startPoint.y, endPoint.x + reserved * 2, startPoint.y);
            new arcToLine(
              endPoint.x + reserved * 2,
              startPoint.y,
              endPoint.x + reserved,
              startPoint.y,
              endPoint.x + reserved,
              startPoint.y + reserved,
            );
            new Line(
              endPoint.x + reserved,
              startPoint.y + reserved,
              endPoint.x + reserved,
              endPoint.y - reserved,
            );
            new arcToLine(
              endPoint.x + reserved,
              endPoint.y - reserved,
              endPoint.x + reserved,
              endPoint.y,
              endPoint.x,
              endPoint.y,
            );
          } else {
            // 左下角
            new Line(startPoint.x, startPoint.y, endPoint.x + reserved * 2, startPoint.y);
            new arcToLine(
              endPoint.x + reserved * 2,
              startPoint.y,
              endPoint.x + reserved,
              startPoint.y,
              endPoint.x + reserved,
              startPoint.y - reserved,
            );
            new Line(
              endPoint.x + reserved,
              startPoint.y - reserved,
              endPoint.x + reserved,
              endPoint.y + reserved,
            );
            new arcToLine(
              endPoint.x + reserved,
              endPoint.y + reserved,
              endPoint.x + reserved,
              endPoint.y,
              endPoint.x,
              endPoint.y,
            );
          }
        }
      }
    } else {
      // 竖着
      // 特殊情况上下对齐的直接连线就好了
      if (startPoint.x == endPoint.x) {
        // 下面的
        if (startPoint.y < endPoint.y) {
          new Line(startPoint.x, startPoint.y + colWrapHeight, endPoint.x, endPoint.y);
        } else {
          // 上面的
          new Line(startPoint.x, startPoint.y, endPoint.x, endPoint.y);
        }
        return;
      }
      // 四种情况
      // 从分叉的点连向开始的点
      // 右边的
      if (startPoint.x > endPoint.x) {
        // 上面的
        if (startPoint.y > endPoint.y) {
          // 右上角
          new Line(startPoint.x, startPoint.y, startPoint.x, endPoint.y + reserved);
          new arcToLine(
            startPoint.x,
            endPoint.y + reserved,
            startPoint.x,
            endPoint.y,
            startPoint.x - reserved,
            endPoint.y,
          );
          new Line(startPoint.x - reserved, endPoint.y, endPoint.x, endPoint.y);
        } else {
          // 右下角
          new Line(startPoint.x, startPoint.y + colWrapHeight, startPoint.x, endPoint.y - reserved);
          new arcToLine(
            startPoint.x,
            endPoint.y - reserved,
            startPoint.x,
            endPoint.y,
            startPoint.x - reserved,
            endPoint.y,
          );
          new Line(startPoint.x - reserved, endPoint.y, endPoint.x, endPoint.y);
        }
      } else {
        // 左边的
        if (startPoint.y > endPoint.y) {
          // 左上角
          new Line(startPoint.x, startPoint.y, startPoint.x, endPoint.y + reserved);
          new arcToLine(
            startPoint.x,
            endPoint.y + reserved,
            startPoint.x,
            endPoint.y,
            startPoint.x + reserved,
            endPoint.y,
          );
          new Line(startPoint.x + reserved, endPoint.y, endPoint.x, endPoint.y);
        } else {
          // 左下角
          new Line(startPoint.x, startPoint.y + colWrapHeight, startPoint.x, endPoint.y - reserved);
          new arcToLine(
            startPoint.x,
            endPoint.y - reserved,
            startPoint.x,
            endPoint.y,
            startPoint.x + reserved,
            endPoint.y,
          );
          new Line(startPoint.x + reserved, endPoint.y, endPoint.x, endPoint.y);
        }
      }
    }
  } else {
    // 右边的边界
    const rightX = stageWidth - whiteSpace;
    // 左边的边界
    const leftX = whiteSpace;
    // 阶段的连线
    if (startPoint.x > stageWidth / 2 || phaseDir == 'right') {
      // 后面的连线
      new Line(startPoint.x, startPoint.y, rightX - reserved, startPoint.y);
      new arcToLine(
        rightX - reserved,
        startPoint.y,
        rightX,
        startPoint.y,
        rightX,
        startPoint.y + reserved,
      );
      new Line(rightX, startPoint.y + reserved, rightX, endPoint.y - reserved);
      new arcToLine(
        rightX,
        endPoint.y - reserved,
        rightX,
        endPoint.y,
        rightX - reserved,
        endPoint.y,
      );
      new Line(rightX - reserved, endPoint.y, endPoint.x, endPoint.y);
    } else {
      // 前面的连线
      // 有弧度的连线
      new Line(startPoint.x, startPoint.y, leftX + reserved, startPoint.y);
      new arcToLine(
        leftX + reserved,
        startPoint.y,
        leftX,
        startPoint.y,
        leftX,
        startPoint.y + reserved,
      );
      new Line(leftX, startPoint.y + reserved, leftX, endPoint.y - reserved);
      new arcToLine(leftX, endPoint.y - reserved, leftX, endPoint.y, leftX + reserved, endPoint.y);
      new Line(leftX + reserved, endPoint.y, endPoint.x, endPoint.y);
    }
  }
}

// 设置点的基本属性
function pointProperty(point, dataItem) {
  point.id = dataItem.id;
  point.next = dataItem.next || -1;
  point.label = dataItem.label;
  point.type = dataItem.type;
  point.lineStyle = dataItem.lineStyle;
  point.nodeActionType = dataItem.nodeActionType;
  point.nodeActionUri = dataItem.nodeActionUri;
  point.count = dataItem.count;
  point.status = dataItem.status || 0;
  point.preColor = point.color;
}

let procode = null;
// 导出流程线路图
export default class processLineMap {
  /**
   * 流程线路图
   *
   * @param   {[type]}  _canvas  [_canvas canvas的实例]
   * @param   {[type]}  _data    [_data 数据]
   * * @param   {[type]}  _animation   [是否开启动画]
   *
   * @return  {[type]}           [return description]
   */
  constructor(_canvas, _data, _animation = false, proCode = null) {
    // 获取canvas
    if (typeof _canvas === 'string') {
      this.canvas = document.querySelector(_canvas);
    } else {
      this.canvas = _canvas;
    }
    // 转换数据
    this.dataList = disposeData(_data);

    ctx = this.canvas.getContext('2d');

    this.setInvterID = null;

    this.setParam();
    this.animation = _animation;

    procode = proCode;

    this.loop = () => {
      this.hz++;
      if (this.hz > 20) {
        this.hz = 0;
        this.clear();
        this.draw();
      }
    };
    this.init();
    this.draw();

    this.canvas.addEventListener(
      'click',
      e => {
        // 系数 浏览器小窗口的时候,点击事件的值坐标会计算不精确
        const coefficient = this.canvas.clientWidth / this.canvas.width;
        const x = e.layerX || e.offsetX;
        const y = e.layerY || e.offsetY;
        // console.log(x, y);
        const exclude = ['forkStart', 'forkEnd', 'place'];
        relation.forEach(phItem => {
          // console.log(phItem);
          phItem.forEach(oneItem => {
            if (Array.isArray(oneItem)) {
              oneItem.forEach(item => {
                if (
                  x >= (item.x - item.radius) * coefficient &&
                  x <= (item.x + item.radius) * coefficient &&
                  y >= (item.y - item.radius) * coefficient &&
                  y <= (item.y + item.radius) * coefficient
                ) {
                  this.canvas.dispatchEvent(
                    new CustomEvent('circleClick', {
                      detail: item,
                    }),
                  );
                }
              });
            } else if (!exclude.includes(oneItem.type) || !oneItem.type) {
              if (
                x >= (oneItem.x - oneItem.radius) * coefficient &&
                x <= (oneItem.x + oneItem.radius) * coefficient &&
                y >= (oneItem.y - oneItem.radius) * coefficient &&
                y <= (oneItem.y + oneItem.radius) * coefficient
              ) {
                this.canvas.dispatchEvent(
                  new CustomEvent('circleClick', {
                    detail: oneItem,
                  }),
                );
              }
            }
          });
        });
      },
      false,
    );
  }

  unmount() {
    if (this.setInvterID) {
      clearInterval(this.setInvterID);
      this.setInvterID = null;
    }
    this.clear();
  }

  init() {
    if (this.setInvterID) {
      clearInterval(this.setInvterID);
      this.setInvterID = null;
    }
    if (this.animation && !this.setInvterID) {
      this.setInvterID = setInterval(this.loop, 1000 / 60);
    }
    // bg的数组
    rectList = [];
    // 关系列表
    relation = [];
    // 每个阶段的高度
    layerHeightStages = [];
    // 每个阶段有几层
    phaseLayerNum = [];
    // 阶段背景颜色
    rectColor = {};
    // 绘制的频率
    this.hz = 0;
    // 舞台的高度
    this.stageHeight = 0;
    // 舞台的总高度
    this.numStageHeight = 0;
    const tempList = [];
    // 处理数据
    this.dataList.map((dataItem, dataIndex) => {
      const { normal, stageName, stageCode } = dataItem;
      const sonGroup = [];
      // 分捡出要分离的点
      normal.map((item, index) => {
        if (item.children && item.children.length > forkLimt && index) {
          sonGroup.push(index);
        }
      });

      if (sonGroup.length > 0) {
        const conf = {
          stageCode,
          stageName,
        };
        sonGroup.map((item, index) => {
          const first = normal.slice(index == 0 ? 0 : sonGroup[index - 1] + 3, item);
          const mid = normal.slice(item, item + 3);
          tempList.push(
            {
              ...conf,
              normal: first,
            },
            {
              ...conf,
              normal: mid,
            },
          );
        });
        let bottom = null;
        if (sonGroup.slice(-1)[0] + 3 != normal.length) {
          bottom = normal.slice(sonGroup.slice(-1)[0] + 3, normal.length);
        }
        bottom
          ? tempList.push({
              ...conf,
              normal: bottom,
            })
          : '';
      } else {
        // 如果没有就直接push
        tempList.push(dataItem);
      }
    });
    this.dataList = tempList;
    /**
     * 获取每个阶段有几层的流程
     */
    this.dataList.map((phase, index) => {
      let max = 1;
      const fork = phase.normal.filter(item => item.type == 'forkStart');
      // 如果里面有分叉
      if (fork && fork.length > 1) {
        fork.map(item => {
          max = item.children.length > max ? item.children.length : max;
        });
      } else {
        // 如果只有一个分叉
        max = fork.length == 0 ? 1 : fork[0].children.length;
        if (max > forkLimt) {
          max = 3;
        }
      }
      this.stageHeight += computedRectHeight(max);
      layerHeightStages.push({
        height: computedRectHeight(max),
        id: phase.stageCode,
      });
    });

    // 这一块是用来画背景的
    // 画背景用的
    // 计算一共要分几个阶段
    const bgTempList = [];
    let currentId = null;
    layerHeightStages.map((item, index) => {
      if (currentId == item.id) return;
      currentId = item.id;
      for (let temIndex = layerHeightStages.length - 1; temIndex >= 0; temIndex--) {
        if (layerHeightStages[temIndex].id == currentId) {
          bgTempList.push(layerHeightStages.slice(index, temIndex + 1));
          return;
        }
      }
    });
    // 计算完阶段以后 重新计算canvas的高度
    this.numStageHeight = this.stageHeight + (bgTempList.length - 1) * bgSpc + 30;
    this.canvas.setAttribute('height', this.numStageHeight);

    // 展示出来的背景
    this.bgSecList = [];
    bgTempList.map((item, index) => {
      // let color = rgba(true);
      const color = preSetBgColorList[index % preSetBgColorList.length];
      // return;
      // console.log(color);
      let height = 0;
      item.map(sonItem => {
        height += sonItem.height;
      });
      const rectItem = new Rect();
      rectItem.color = preSetBgColorList[index % preSetBgColorList.length];
      rectItem.width = stageWidth;
      rectItem.height = height;
      rectItem.id = item.id;
      rectItem.x = 0;
      rectItem.y =
        index === 0 ? 0 : this.bgSecList[index - 1].y + this.bgSecList[index - 1].height + bgSpc;
      // rectItem.draw();
      this.bgSecList.push(rectItem);
    });
    // 真实的背景
    // 这一块是用来辅助计算点的位置的
    layerHeightStages.map((item, index) => {
      // 同一个id用同一个颜色
      const isSame = !!rectColor[item.id];
      const color = rectColor[item.id] || preSetBgColorList[index % preSetBgColorList.length];
      rectColor[item.id] = rectColor[item.id] || color;
      const rectItem = new Rect();
      rectItem.color = color;
      rectItem.width = stageWidth;
      rectItem.height = item.height;
      rectItem.id = item.id;
      rectItem.x = 0;
      rectItem.y = index === 0 ? 0 : rectList[index - 1].y + rectList[index - 1].height;
      rectItem.y += isSame || index == 0 ? 0 : bgSpc;
      rectList.push(rectItem);
    });
    // 生成节点的实例
    this.dataList.map((phaseItem, phaseIndex) => {
      const { normal, stageCode } = phaseItem;
      // 真实舞台的宽度
      const realStageWidth = stageWidth - processLineSpace * 2 - whiteSpace * 2;
      // 左边的空白
      const preSpace = whiteSpace + processLineSpace;
      if (normal) {
        // 如果是奇数就反转
        if (phaseIndex % 2 == 1) {
          normal.reverse();
          phaseItem.groupDir = 'left';
        } else {
          phaseItem.groupDir = 'right';
        }
        // 当前阶段里面是否含有分叉的节点
        const isFork = normal.find(item => item.type == 'forkStart');
        // 判断分叉的方向
        const forkDir = isFork && isFork.children.length > forkLimt ? 'col' : 'row';
        // 圆之间的间隔
        const circleSpace = realStageWidth / (normal.length - 1);
        // 当前阶段的容器
        const rectItem = rectList[phaseIndex];

        const shipList = [];
        // 如果只有一个的话
        if (normal.length == 1) {
          const point = new Circle();
          point.stageCode = stageCode;
          point.groupIndex = phaseIndex;
          point.color = preSetCircleColorList[phaseIndex % preSetCircleColorList.length];
          pointProperty(point, normal[0]);
          // 默认是正常情况
          point.x = stageWidth / 2;
          point.y = rectItem.y + rectItem.height / 2;
          // point.draw();
          shipList.push(point);
          relation.push(shipList);
          return;
        }
        normal.map((item, index) => {
          if (forkDir == 'col' && (item.type == 'forkEnd' || item.type == 'place')) return;
          if (phaseItem.groupDir == 'right' && forkDir != 'col') {
            const point = new Circle();
            point.stageCode = stageCode;
            point.groupIndex = phaseIndex;
            point.color = preSetCircleColorList[phaseIndex % preSetCircleColorList.length];
            pointProperty(point, item);
            // 默认是正常情况
            point.x = preSpace + circleSpace * index;
            point.y = rectItem.y + rectItem.height / 2 - bgSpc;
            if (item.type != 'place') {
              // point.draw();
              shipList.push(point);
            }
          }
          if (item.type == 'forkStart') {
            const symbol = phaseItem.groupDir == 'left' ? index - 1 : index + 1;

            const specialSymbol = phaseItem.groupDir == 'left' ? index + 1 : index - 1;
            // 判断上一个节点是否是当前节点里面的
            const prePoint = normal[specialSymbol];

            // 如果是横着的
            if (forkDir == 'row') {
              const forkItemList = [];
              item.children.map((cItem, cIndex) => {
                const forkPoint = new Circle();
                forkPoint.stageCode = stageCode;
                forkPoint.groupIndex = phaseIndex;
                forkPoint.color = preSetCircleColorList[phaseIndex % preSetCircleColorList.length];
                pointProperty(forkPoint, cItem);
                forkPoint.x = preSpace + circleSpace * symbol;
                forkPoint.y =
                  phaseInnerSpace +
                  rectItem.y +
                  ((rectItem.height - phaseInnerSpace * 2) / (item.children.length - 1)) * cIndex -
                  bgSpc;
                // forkPoint.draw();
                forkItemList.push(forkPoint);
              });
              shipList.push(forkItemList);
            } else {
              // 如果是竖着的
              // 如果是混合的
              if (prePoint) {
                // 这个暂时不用管,因为在别的的地方处理过了
                console.log(prePoint);
              } else {
                const arr = normal;
                if (phaseItem.groupDir == 'left') {
                  arr.reverse();
                }
                arr.map((cItem, cIndex) => {
                  const forkPoint = new Circle();
                  forkPoint.stageCode = stageCode;
                  forkPoint.groupIndex = phaseIndex;
                  forkPoint.color =
                    preSetCircleColorList[phaseIndex % preSetCircleColorList.length];
                  pointProperty(forkPoint, cItem);
                  forkPoint.x = rectItem.x + rectItem.width / 2;
                  forkPoint.y =
                    phaseInnerSpace +
                    rectItem.y +
                    ((rectItem.height - phaseInnerSpace * 2) / (arr.length - 1)) * cIndex;
                  // forkPoint.draw();
                  if (forkPoint.type != 'place') {
                    shipList.push(forkPoint);
                  }
                  const forkItemList = [];
                  if (cItem.type == 'forkStart') {
                    cItem.children.map((sItem, sIndex) => {
                      const forkPoint = new Circle('col');
                      forkPoint.stageCode = stageCode;
                      forkPoint.groupIndex = phaseIndex;
                      forkPoint.color =
                        preSetCircleColorList[phaseIndex % preSetCircleColorList.length];
                      pointProperty(forkPoint, sItem);
                      forkPoint.x = preSpace + (realStageWidth / cItem.children.length) * sIndex;
                      forkPoint.y = rectItem.y + rectItem.height / 2 - pointTansY;
                      // forkPoint.draw();
                      forkItemList.push(forkPoint);
                    });
                  }
                  if (forkItemList.length > 0) {
                    shipList.push(forkItemList);
                  }
                });
                return;
              }
            }
          }
          if (phaseItem.groupDir == 'left' && forkDir != 'col') {
            const point = new Circle();
            point.stageCode = stageCode;
            point.groupIndex = phaseIndex;
            point.color = preSetCircleColorList[phaseIndex % preSetCircleColorList.length];
            pointProperty(point, item);
            // 默认是正常情况
            point.x = preSpace + circleSpace * index;
            point.y = rectItem.y + rectItem.height / 2 - bgSpc;
            if (item.type != 'place') {
              // point.draw();
              shipList.push(point);
            }
          }
        });
        relation.push(shipList);
      }
    });
  }

  draw() {
    // 画背景
    this.bgSecList.map(item => item.draw());
    // 根据点画线
    relation.map((shipItem, shipIndex) => {
      shipItem.map((normalItem, normalIndex) => {
        const nextPoint = shipItem[normalIndex + 1];
        if (!nextPoint) return;
        let dir = 'row';
        if (Array.isArray(normalItem)) {
          if (normalItem.length > forkLimt) {
            dir = 'col';
          }
          normalItem.map((item, index) => {
            drawLine(item, nextPoint, dir);
          });
          return;
        }
        if (Array.isArray(nextPoint)) {
          if (nextPoint.length > forkLimt) {
            dir = 'col';
          }
          nextPoint.map((item, index) => {
            drawLine(item, normalItem, dir);
          });
          return;
        }
        drawLine(normalItem, nextPoint);
      });
      // 阶段之间的连线
      // 下一个阶段是否存在
      const nextPhase = relation[shipIndex + 1];
      if (nextPhase) {
        if (!shipItem[0]) return;
        if (
          (shipItem[0].type == 'forkStart' && shipItem[1].length > forkLimt) ||
          (nextPhase[0] &&
            nextPhase[0].type == 'forkStart' &&
            nextPhase[1] &&
            nextPhase[1].length > forkLimt) ||
          (shipItem[2] && shipItem[2].type == 'forkEnd')
        ) {
          if (nextPhase[0].type == 'forkStart') {
            if (shipIndex % 2 == 0) {
              drawLine(shipItem[shipItem.length - 1], nextPhase[0], 'col', true, 'right');
            } else {
              drawLine(shipItem[0], nextPhase[0], 'col', true, 'left');
            }
          } else if (shipIndex % 2 == 0) {
            drawLine(
              shipItem[shipItem.length - 1],
              nextPhase[nextPhase.length - 1],
              'col',
              true,
              'right',
            );
          } else {
            drawLine(shipItem[shipItem.length - 1], nextPhase[0], 'col', true, 'left');
          }
        } else {
          // 正常的点
          // 连后面
          if (shipIndex % 2 == 0) {
            drawLine(shipItem[shipItem.length - 1], nextPhase[nextPhase.length - 1], 'row', true);
          } else {
            drawLine(shipItem[0], nextPhase[0], 'row', true);
          }
        }
      }
    });
    // 这几个特殊的类型不画
    const exclude = ['forkStart', 'forkEnd', 'place'];
    // 最后画点
    relation.forEach(phItem => {
      phItem.forEach(oneItem => {
        if (Array.isArray(oneItem)) {
          oneItem.forEach(item => {
            item.procode = procode;
            // 如果原点的状态是处理中就置灰并且存起来
            if (item.status == 1) {
              // console.log(item.preColor);
              item.color =
                item.color != circleDisabledColor
                  ? circleDisabledColor
                  : item.preColor || item.color;
            }
            item.draw();
          });
        } else if (!exclude.includes(oneItem.type) || !oneItem.type) {
          // 如果原点的状态是处理中就置灰并且存起来
          if (oneItem.status == 1) {
            oneItem.color =
              oneItem.color != circleDisabledColor
                ? circleDisabledColor
                : oneItem.preColor || oneItem.color;
          }
          oneItem.procode = procode;
          oneItem.draw();
        }
      });
    });
  }

  update(_data, _proCode) {
    procode = _proCode;
    this.dataList = disposeData(_data);
    this.clear();
    this.setParam();
    this.init();
    this.draw();
  }

  clear() {
    ctx.clearRect(0, 0, stageWidth, this.numStageHeight);
  }

  setParam() {
    scale = this.canvas.parentNode.clientWidth / stageWidth;
    if (scale >= 1) {
      scale = 1;
    } else if (scale <= 0.8) {
      scale = 0.8;
    }
    stageWidth *= scale;
    // 设置cavas的宽度
    this.canvas.setAttribute('width', stageWidth);
    // 舞台的高度
    this.stageHeight = 0;
    // 舞台的总高度
    this.numStageHeight = 0;
    // 高度之间的间隔
    ySpace = 10 * scale;
    // 阶段背景默认宽度
    defaultWidth = 1000 * scale;
    // 阶段背景的基础高度
    phaseBasedHight = 80 * scale;
    // 阶段里面高度的留白
    phaseInnerSpace = 30 * scale;
    // 舞台边缘的留白
    whiteSpace = 50 * scale;
    // 舞台的宽度
    stageWidth = 1000 * scale;
    // 圆点的半径
    circleRadius = 10 * scale;
    // 圆点的直径
    circleDiameter = circleRadius * 2 * scale;
    // 流程连接的线预留的距离
    processLineSpace = 70 * scale;
    // 竖着排列的点容器的高度
    colWrapHeight = 120 * scale;
    // 背景之间的高度
    bgSpc = 8 * scale;
    // 竖着的点向上便宜的距离
    pointTansY = 60 * scale;
    // 拐弯的弧度
    angle = 18 * scale;
  }
}