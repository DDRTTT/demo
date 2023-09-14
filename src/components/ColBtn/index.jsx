import React from 'react';
import ownStyle from './index.less'
import {Popconfirm} from "antd";

const Index = props => {
  const { text, onClick, disabled, styles, popConfig } = props;
  const popConfirm = () => {
    popConfig.confirm();
  };

  const clickEvent = (e) => {
    e.preventDefault();
    onClick();
  }
  return (<>
      {(popConfig && !disabled)?
        <Popconfirm {...popConfig} onConfirm={(e) => popConfirm()}>
          <span
            className={ownStyle.btnStyle}
            style={styles ? {...styles} : {}}
            >{text}</span>
        </Popconfirm> :
        <span
          className={!disabled ? ownStyle.btnStyle : ownStyle.btnDisabledStyle}
          style={styles ? {...styles} : {}}
          onClick={(e) => !disabled && clickEvent(e)}>{text}</span>
      }
    </>
  )
};


export default Index;
