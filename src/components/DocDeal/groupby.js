export const groupBy = (arr) => arr.reduce((acc, current) => {
    const x = acc.find(item => item['id'] === current['id']);
    if (!x) {
        return acc.concat([current]);
    } else {
        acc.forEach(item=>{
            if(item.id == current.id) {
                item.child.push(current.child[0])
            }
        });
        return acc
    }
}, []);

export const queryArrByType=(arr, filter, keyWord)=>{
  if (!(filter instanceof Array) && !(typeof filter)) throw new TypeError('filter must be a array or string')
  if (typeof filter === 'string') filter = [filter]
  return arr.filter(item => {
    for (let key of filter) {
      if (item[key] && item[key].indexOf(keyWord) !== -1) {
        return true
      }
    }
    return false
  })
}
