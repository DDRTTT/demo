
import {onFieldReact} from "@formily/core";
//取交集
export function handleIntersection(field, code, listCode) {
  let intersection
  if(field.dataSource?.length>0){
    let arr = field.query(code).value()
    if(!Array.isArray(arr)) arr=[arr]
    intersection = arr.filter(x =>
      [...field.dataSource].some(y =>
        y[listCode] === x
      ));
  }
  return intersection||''
}

export const useRequestDefaults = (pattern,service) => {
  onFieldReact(pattern, (field) => {
    field.loading = true
    service(field)
  })
}
