import { Button, Dropdown, Menu } from 'antd';
import { handleEdit } from '@/pages/investorReview/func';
import Action from '@/utils/hocUtil';

// 加工后操作按钮 绑定名字和事件
const EnrichEditButton = props => {
  /**
   * buttonList 按钮的列表
   * buttonConfig 单独按钮的设置
   * handler 按钮的自定义事件
   */
  const {
    buttonList,
    buttonConfig = { type: 'link', size: 'small' },
    record,
    pageConfig,
    moreBtnStyle = { marginRight: 10, display: 'inline-block' },
    pageName,
    pageConfigParam,
  } = props;
  return buttonList.map((item, index) => {
    const { unRender = true } = item;
    if (!unRender) return '';
    let button;
    if (item.type === 'button') {
      button = (
        <Button
          style={moreBtnStyle}
          onClick={() => {
            if (item.handler) {
              item.handler();
            } else {
              handleEdit(item.code, record, pageConfig, pageConfigParam);
            }
          }}
          {...buttonConfig}
          {...item.config}
        >
          {item.label}
        </Button>
      );
    } else if (item.type === 'more') {
      const menu = (
        <Menu>
          {item.list.map((option, optionIndex) => {
            return (
              <Menu.Item key={optionIndex}>
                <a
                  style={{ textAlign: 'center' }}
                  onClick={() => {
                    item.batchHandler
                      ? item.batchHandler(option['action'])
                      : handleEdit(option, record, pageConfig, pageConfigParam);
                  }}
                >
                  {typeof option === 'string' ? option : option['label']}
                </a>
              </Menu.Item>
            );
          })}
        </Menu>
      );
      button = (
        <Dropdown overlay={menu} trigger={['click']}>
          <Button
            {...buttonConfig}
            {...item.config}
            className="ant-dropdown-link"
            style={moreBtnStyle}
          >
            {item.label}
            {/*{buttonConfig.type && */}
            {/*  <Icon type="down" />*/}
            {/*}*/}
          </Button>
        </Dropdown>
      );
    } else {
      button = (
        <a
          style={moreBtnStyle}
          onClick={() => {
            if (item.handler) {
              item.handler();
            } else {
              handleEdit(item.code, record, pageConfig, pageConfigParam);
            }
          }}
          {...buttonConfig}
          {...item.config}
        >
          {item.label}
        </a>
      );
    }
    return pageName && item.code ? (
      <Action key={index} code={`${pageName}:${item.code || ''}`}>
        <span>{button}</span>
      </Action>
    ) : (
      <span key={index}>{button}</span>
    );
  });
};

export default EnrichEditButton;
