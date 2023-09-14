/**
 *找出树目录中某个节点的所有父节点的指定参数
 *
 * @param {*} arr  树目录数据
 * @param {*} code    当前节点的code
 * @param {*} title
 * @returns
 */
export const getPath = (arr, code, title, paramCode, paramTitle) => {
  if (title == undefined || '') {
    title = [];
  }
  for (let index = 0; index < arr.length; index++) {
    const item = arr[index];
    var tempTitle = [...title];
    tempTitle.push(item[paramTitle]);
    if (item[paramCode] == code) {
      return tempTitle;
    }
    if (item.children) {
      let result = getPath(item.children, code, tempTitle, paramCode, paramTitle);
      if (result) {
        return result;
      }
    }
  }
};
