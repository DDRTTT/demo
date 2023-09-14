import { Input} from "antd";
import React from 'react';
const { Search } = Input;
const fuzz = ({submit, filterStatus, setHeadStatus})=>{
  const tagStatus = e => {
    e.preventDefault()
    setHeadStatus(true);
  };
  return (
    <span style={{float: 'right'}}>
    { !filterStatus ? ( <span>
      <Search
        placeholder="请输入"
        onSearch={value => submit({code: 'keyWords', value})}
        style={{ width: 200 }}
      />
      <a style={{marginLeft: 10, fontSize:12}} className="ant-dropdown-link" onClick={e => tagStatus(e)}>
        高级搜索
      </a>
      </span>): (<span></span>) }
    </span>
  )
}

export default fuzz;
