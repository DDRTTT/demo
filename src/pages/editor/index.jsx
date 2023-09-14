import React, { Component } from 'react';
import { Breadcrumb, Button, Card, Tabs } from 'antd';
import { SyncOutlined } from '@ant-design/icons';
import styles from './index.less';
import request from '@/utils/request';
import { stringify } from 'qs';
import router from 'umi/router';
import monment from 'moment';
const { TabPane } = Tabs;

let cx = {};


class Index extends Component {
  state = {
    userInfo: {},
    saveBtn: true,
    tags: [],
    IPObject: {},
    saveLoading: false,
    authoritiesDirectoryNumber: [], // 可以改的内容域的数组
  };

  renderCXEditor = (fileType, key, title, url) => {
    console.log('renderCXEditor-params:', fileType, key, title, url);
    console.time('文档加载时间');
    // mode为view时，直接只读打开。mode为“edit”时，review为true，并且edit为false，是修订强制开启
    const { IPObject, userInfo, authoritiesDirectoryNumber } = this.state;
    let authlist = [];
    // 设置有权限编辑内容域的数组
    authoritiesDirectoryNumber.forEach(item => {
      authlist.push({
        "partId": item,//内容域id
        "canView": true,//是否隐藏
        "canEdit": true,//是否可以编辑
        "canAddBlock": true,//是否能添加富文本
        "canAddInline": true,//是否可以添加纯文本
        "canCut": true,//是否可以剪贴
        "canDelete": false,//子内容域是否可以删除
        "canDeleteCurrent": false,//当前内容域是否可以删除
        "canSetting": false,//能否设置内容域
        "canCopy": true,//能否拷贝
        "canComment": true,//能否批注
        "canSetPermission": false//是否有内容域设置权限
      })
    })
    let cxo_config = {
      document: {
        fileType,
        key,
        title,
        url,
        permissions: {
          edit: false, //
          review: true, // 是否可修订
          copyoutenabled: true,
          partauth: {
            "canLockStyle": true,//是否能锁定样式
            "canUnLockStyle": false,//能否解锁样式
            "isStyleLock": false,//是不是样式锁
            authlist,
          },
        },
      },
      documentType: this.getDocumentType(fileType),
      editorConfig: {
        callbackUrl: `${IPObject.gateWayIp}/ams/ams-file-service/businessArchive/callbackUpdateFile`,
        customization: {
          about: false,
          chat: true,
          zoom: 100,
          rightMenu: false,
          logo: {
            image: '',
          },
        },
        mode: 'edit',
        user: {
          id: userInfo?.id + '', //  id 一定要string类型
          name: userInfo?.username,
        },
      },
      events: {
        onAppReady: this.onAppReady,
        onDocumentReady: this.onDocumentReady,
        onError: this.onError,
        onRequestClose: this.onRequestClose,
        onWarning: this.onWarning,
        onGetDocumentContent: this.onGetDocumentContent,
      },
      height: '800px',
      width: '100%',
      type: 'desktop',
    };

    cx = new CXO_API.CXEditor('_COX_Editor_SKD', cxo_config);
  }; //  在线编辑 模板

  getDocumentType = ext => {
    if ('.doc.docx.docm.dot.dotx.dotm.odt.fodt.ott.rtf.txt.html.htm.mht.pdf.djvu.fb2.epub.xps'.indexOf(ext) !== -1) return 'text';
    if ('.xls.xlsx.xlsm.xlt.xltx.xltm.ods.fods.ots.csv'.indexOf(ext) !== -1) return 'spreadsheet';
    if ('.pps.ppsx.ppsm.ppt.pptx.pptm.pot.potx.potm.odp.fodp.otp'.indexOf(ext) !== -1) return 'presentation';
    return null;
  };

  onAppReady = () => {
    message.success('编辑器加载完成');
  };

  onDocumentReady = () => {
    message.success('文档加载完成');
    console.timeEnd('文档加载时间');
    this.setState({ saveBtn: false });
  };

  onError = event => {
    message.error(`编辑器错误: code ${event.data.errorCode}, 描述 ${event.data.errorDescription}`);
  };

  onRequestClose = () => {
    if (window.opener) {
      window.close();
      return;
    }
    cx.destroyEditor();
  };

  onWarning = event => {
    message.warn(`编辑器警告: code ${event.data.warningCode}, 描述 ${event.data.warningDescription}`,);
  };

  onGetDocumentContent = event => {
    let tags = event.data.text;
    this.setState({ tags })
  };

  appendJQCDN = apiSrc => {
    let _this = this;
    let head = document.head || document.getElementsByTagName('head')[0];
    let script = document.createElement('script');
    script.setAttribute('src', apiSrc);
    head.appendChild(script);
    // 判断外部js是否加载完成
    script.onload = script.onreadystatechange = function () {
      if (!this.readyState || this.readyState == 'loaded' || this.readyState == 'complete') {
        const { IPObject } = _this.state;
        _this.renderCXEditor(
          'docx',
          '4567uhfjdvhgyuik3131',
          'test',
          `${IPObject.gateWayIp}/ams/ams-file-service/fileServer/downloadUploadFile?getFile=01281611214034992965`,
        );
      }
      script.onload = script.onreadystatechange = null;
    };
  };

  // 获取地址
  getNginxIP = () => {
    request('/yss-contract-server/contractfile/getnginxip').then(res => {
      if (res?.status === 200) {
        this.setState({ IPObject: res.data }, () => {
          this.appendJQCDN(res.data.jsApi);
        });
      }
    });
  };

  backJumpPage = () => {
    router.push('./');
  };

  reloadSignList = () => {
    cx.getDocumentContent({
      object: 'content',
      type: 'text',
      name: '',
      id: '',
    });
  };

  // 选择指定内容域并跳转到内容域所在位置
  selectTags = id => {
    let obj = {
      object: 'content',
      type: 'select',
      id,
    };

    cx.setDocumentContent(obj);
  };

  componentDidMount() {
    cx.destroyEditor && cx.destroyEditor();
    this.setState({ userInfo: JSON.parse(sessionStorage.getItem('USER_INFO')), }, () => {
      this.getNginxIP();
    });
  }

  componentWillUnmount() {
    cx.destroyEditor && cx.destroyEditor();
  }

  render() {
    const { userInfo, tags, saveBtn, saveLoading } = this.state;
    return (
      <div >
        <div style={{ backgroundColor: '#fff' }}>
          <Breadcrumb style={{ marginTop: 7 }}>
            <Breadcrumb.Item><a onClick={this.backJumpPage}>招募说明书办理</a></Breadcrumb.Item>
            <Breadcrumb.Item>新增更新</Breadcrumb.Item>
          </Breadcrumb>
          <div className={styles.btnArea}>

            <Button
              onClick={null}
              type="primary"
              disabled={saveBtn}
              style={{ marginRight: 8 }}
              loading={saveLoading}
            >
              保存
            </Button>
            <Button
              onClick={null}
              type="primary"
              disabled={saveBtn}
              style={{ marginRight: 8 }}
              loading={saveLoading}
            >
              提交
            </Button>
            <Button
              onClick={this.backJumpPage}
              type="primary"
              disabled={saveBtn}
            >
              取消
            </Button>
          </div>
        </div>
        <div style={{ width: '77%', float: 'left', minHeight: '800px' }}>
          <div id="_COX_Editor_SKD"></div>
        </div>
        <div className={styles.operatorArea}>
          <Card
            title=""
            style={{ marginTop: 20 }}
            headStyle={{ borderBottom: 'none', padding: '0 10px' }}
            bodyStyle={{ padding: '10px', minHeight: 800 }}
          >
            <Tabs defaultActiveKey="1" onChange={null} size="small">
              <TabPane tab="标签设置" key="1">
                <div>
                  <div className={styles.labelSetBox}>
                    <div
                      className={styles.syncBtn}
                      style={{ color: '#2450A5' }}
                      onClick={this.reloadSignList}
                    >
                      标签列表
                      <SyncOutlined style={{ marginLeft: 10 }} />
                    </div>
                    <div className={styles.tagsBox}>
                      {tags.map((item, i) => (
                        <p key={item.id}>
                          标签：<a onClick={() => this.selectTags(item.id)}>{item.name}</a>
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </TabPane>
            </Tabs>
          </Card>
        </div>
      </div>
    );
  }
}

export default Index;
