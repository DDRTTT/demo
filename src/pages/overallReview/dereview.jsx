import { useEffect, useState } from 'react';
import request from '../../utils/request';
import { unitParameters, cssParameters } from './cxconfig';
import {Button, Card, Tree, message, Breadcrumb} from 'antd';
import styles from './index.less';
const authToken = '';
let gateWayIp = '';
let jsApiIp = '';
let cx = {};
const treeData = [
  {
    title: '0-0',
    key: '0-0',
    children: [
      {
        title: '0-0-0',
        key: '0-0-0',
        children: [
          { title: '0-0-0-0', key: '0-0-0-0' },
          { title: '0-0-0-1', key: '0-0-0-1' },
          { title: '0-0-0-2', key: '0-0-0-2' },
        ],
      },
      {
        title: '0-0-1',
        key: '0-0-1',
        children: [
          { title: '0-0-1-0', key: '0-0-1-0' },
          { title: '0-0-1-1', key: '0-0-1-1' },
          { title: '0-0-1-2', key: '0-0-1-2' },
        ],
      },
      {
        title: '0-0-2',
        key: '0-0-2',
      },
    ],
  },
  {
    title: '0-1',
    key: '0-1',
    children: [
      { title: '0-1-0-0', key: '0-1-0-0' },
      { title: '0-1-0-1', key: '0-1-0-1' },
      { title: '0-1-0-2', key: '0-1-0-2' },
    ],
  },
  {
    title: '0-2',
    key: '0-2',
  },
];
const OBJECT = {
  object: 'content',
  type: 'text',
  name: '',
  id: '',
};
const Dereview = () => {
  const [expandedKeys, setExpandedKeys] = useState(['0-0-0', '0-0-1']);
  const [checkedKeys, setCheckedKeys] = useState(['0-0-0']);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [autoExpandParent, setAutoExpandParent] = useState(true);
  const [templateKey, setTemplateKey] = useState(sessionStorage.getItem('templateDetailsParams'));
  const [tags, setTags] = useState([]);

  const onExpand = expandedKeysValue => {
    console.log('onExpand', expandedKeysValue);
    // if not set autoExpandParent to false, if children expanded, parent can not collapse.
    // or, you can remove all expanded children keys.
    setExpandedKeys(expandedKeysValue);
    setAutoExpandParent(false);
  };

  const onCheck = checkedKeysValue => {
    console.log('onCheck', checkedKeysValue);
    setCheckedKeys(checkedKeysValue);
  };

  const onSelect = (selectedKeysValue, info) => {
    console.log('onSelect', info);
    setSelectedKeys(selectedKeysValue);
  };

  const onDocumentReady = () => {
    message.success('文档加载完成');
    console.timeEnd('文档加载时间');
    cx.getDocumentContent(OBJECT);
  };

  const onGetDocumentContent = event => {
    if (event.data.text.length > 0) {
      setTags(event.data.text);
    }
  };

  // 选择指定内容域并跳转到内容域所在位置
  const selectTags = id => {
    let obj = {
      object: 'content',
      type: 'select',
      id,
    };

    cx.setDocumentContent(obj);
  };

  const renderCXEditor = (fileType, key, title, url) => {
    console.log('加载编辑器', fileType, key, title, url);
    let menuData = [],
      children = [],
      actions = [];
    //  获取用户权限
    fetch(`/ams/yss-base-admin/user/menutree?needAction=true&sysId=1`, {
      //@ts-ignore
      headers: {
        Token: authToken,
        Accept: 'application/json',
        'Content-Type': 'application/json;charset=UTF-8',
        Data: new Date().getTime(),
        Sys: 1,
      },
    }).then(res => {
      if (res?.status === 200) {
        res.json().then(response => {
          if (response?.status === 200) {
            menuData = response.data;
            if (menuData.length > 0) {
              for (let i = 0; i < menuData.length; i++) {
                if (menuData[i].code === 'electronic') {
                  children = menuData[i].children;
                  break;
                }
              }
              for (let i = 0; i < children.length; i++) {
                if (children[i].code === 'contractList') {
                  actions = children[i].actions;
                  break;
                }
              }
              for (let i = 0; i < actions.length; i++) {
                if (actions[i].code === 'contractList:power') {
                  isPower = true;
                  break;
                }
              }
            }
          }
          // this.setState({ operatorDisable: true });
          console.time('文档加载时间');
          let cxo_config = {
            document: {
              fileType, // 指明要打开的文档的类型
              key, // 文档唯一ID
              title, // 文档标题
              url, // 文件存放路径
              permissions: {
                // permissions 文档权限  (permissions.edit和permissions.review 与 mode的值有关
                download: unitParameters.download, // 是否可下载
                edit: unitParameters.edit, // 是否可编辑 true 可编辑 false 只读
                print: unitParameters.print, // 是否可打印
                review: unitParameters.review, // 是否可修订
                copyoutenabled: unitParameters.copyoutenabled, // 是否可复制编辑器里的内容
                commentFilter: unitParameters.commentFilter, // 批注权限
              },
            },
            documentType: 'text', // 指明文档类型 如 word excel
            editorConfig: {
              callbackUrl: `${gateWayIp}/ams/ams-file-service/businessArchive/callbackUpdateFile`,
              customization: {
                about: false,
                chat: unitParameters.chat,
                comments: unitParameters.comments,
                zoom: unitParameters.zoom,
                leftMenu: unitParameters.leftMenu,
                rightMenu: unitParameters.rightMenu,
                toolbar: unitParameters.toolbar,
                header: unitParameters.header,
                statusBar: unitParameters.statusBar,
                autosave: unitParameters.autosave,
                forcesave: unitParameters.forcesave,
                logo: {
                  image: '',
                },
              },
              mode: unitParameters.mode,
              user: unitParameters.user,
              templates: [],
              // limitEditMode: "ctctrl",
              limitEditMode: 'nolimit',
            },
            events: {
              onDocumentReady: onDocumentReady,
              // onRequestClose: this.onRequestClose,
              onGetDocumentContent: onGetDocumentContent,
            },
            height: cssParameters.height,
            width: cssParameters.width,
            type: cssParameters.type,
          };

          // @ts-ignore
          cx = new CXO_API.CXEditor('COX_Editor_SKD', cxo_config);
        });
      }
    });
  };
  const getContractBaseData = () => {
    renderCXEditor(
      'docx',
      '04131009244298322765',
      'test001',
      'http://192.168.105.46:18000/ams/ams-file-service/fileServer/downloadUploadFile?getFile=04131009244298322765',
    );
  };
  const appendJQCDN = apiSrc => {
    let head = document.head || document.getElementsByTagName('head')[0];
    let script = document.createElement('script');
    script.setAttribute('src', apiSrc);
    head.appendChild(script);
    // 判断外部js是否加载完成
    script.onload = script.onreadystatechange = function() {
      if (!this.readyState || this.readyState == 'loaded' || this.readyState == 'complete') {
        getContractBaseData();
      }
      script.onload = script.onreadystatechange = null;
    };
  };
  const getNginxIP = () => {
    request('/yss-contract-server/contractfile/getnginxip?').then(res => {
      if (res?.status === 200) {
        gateWayIp = res.gateWayIp;
        // jsApiIp = res.jsApiIp;
        appendJQCDN(res.data.jsApi);
        // setIPObject({ data: res.data });
      }
    });
  };
  useEffect(() => {
    getNginxIP();
  }, []);
  return (
    <div>
      <div className={styles.reviewHeader}>
        <Breadcrumb>
          <Breadcrumb.Item>
            <a href="">招募说明书通篇审核</a>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <a href="">反审核</a>
          </Breadcrumb.Item>
        </Breadcrumb>
        <Button type="primary">退回</Button>
        <Button type="primary">取消</Button>
      </div>
      <div style={{ width: '77%', float: 'left', minHeight: '800px' }}>
        <div id="COX_Editor_SKD" />
      </div>
      <div className={styles.operatorArea}>
        <Card
          title=""
          style={{ marginTop: 20 }}
          headStyle={{ borderBottom: 'none', padding: '0 10px' }}
          bodyStyle={{ padding: '10px', minHeight: 800 }}
        >
          <Tree
            checkable
            onExpand={onExpand}
            expandedKeys={expandedKeys}
            autoExpandParent={autoExpandParent}
            onCheck={onCheck}
            checkedKeys={checkedKeys}
            onSelect={onSelect}
            selectedKeys={selectedKeys}
            treeData={treeData}
          />
          {tags.map((item, i) => (
            <p key={item.id}>
              标签：<a onClick={() => selectTags(item.id)}>{item.name}</a>
            </p>
          ))}
        </Card>
      </div>
    </div>
  );
};
export default Dereview;
