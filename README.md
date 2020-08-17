# moe-flow

## 依赖

> Vue + Element.UI + JsPlumb + lodash

## 引入方式

---

找到`src/components/FlowChart`目录，复制粘贴到需要放置的位置并引入即可。

```js
import FlowChart from '@/components/FlowChart/Index'
```

### prop参数

|    参数    |      描述      |     类型     |
| :--------: | :------------: |   :------------: |
|  flowData  |     流程图数据      |      Object      |
|  readOnly  |     是否只读      |      Boolean      |


## 数据格式

---

``` js

 {
    name: '流程D',
    nodeList: [
        {
            id: 'nodeA',
            name: '流程D-节点A',
            type: 'task',
            left: '18px',
            top: '223px',
            ico: 'el-icon-user-solid',
            state: 'success'
        },
        {
            id: 'nodeB',
            type: 'task',
            name: '流程D-节点B',
            left: '351px',
            top: '96px',
            ico: 'el-icon-goods',
            viewOnly: true,
            state: 'error'
        },
        {
            id: 'nodeC',
            name: '流程D-节点C',
            type: 'task',
            left: '354px',
            top: '351px',
            ico: 'el-icon-present',
            state: 'warning'
        }, {
            id: 'nodeD',
            name: '流程D-节点D',
            type: 'task',
            left: '723px',
            top: '215px',
            ico: 'el-icon-present',
            state: 'running'
        }
    ],
    lineList: [{
        from: 'nodeA',
        to: 'nodeB',
        label: '直线,自定义线样式,固定锚点',
        connector: 'Straight',
        anchors: ['Top', 'Bottom'],
        paintStyle: {strokeWidth: 2, stroke: '#1879FF'}
    }, {
        from: 'nodeA',
        to: 'nodeC',
        label: '贝塞尔曲线,固定锚点',
        connector: 'Bezier',
        anchors: ['Bottom', 'Left']
    }, {
        from: 'nodeB',
        to: 'nodeD',
        label: '默认连线样式,动态锚点'
    }, {
        from: 'nodeC',
        to: 'nodeD',
        label: '默认连线样式,动态锚点'
    }
    ]
}
```

### data 参数说明
|    参数    |      描述      |
| :--------: | :------------: |
|  name  |     流程图名称      |

### nodeList 参数说明
|    参数    |    必填    |      描述      |      可选值      |
| :--------: | :------------: | ---------- | ---------- |
|  id  |  是  |     标识唯一的节点、可以与业务ID相结合      |           |
|  name  |  是  |   节点名称      |         |
| type | 是 | 节点类型，可以和业务相结合做处理 |  |
|  left  |  是  | 节点在页面上的X坐标，以px结尾  |         |
|  top  |  是  |  节点在页面上的Y坐标，以px结尾 |         |
|  ico  |  是  |   节点显示的图标，标识   |         |
|  state  |  否  |   状态，状态不同右侧展示的图标不同   | success、error、warning、running |
|  viewOnly  |  否  |   是否仅用于浏览，true: 不可拖拽   | true 、false|




### lineList 参数说明
|    参数    |    必填    |      备注      |      可选值      |
| :--------: | :------------: | -------------- | -------------- |
|  from  |  是  |     连线的起始节点的ID      |           |
|  to  |  是  |   连线的终点节点ID      |         |
|  label  |  否  |   连线上的描述信息   |         |
| anchors | 否 | 连线的起始锚点位置，如：["Top","Right"] | ['Top', 'TopCenter', 'TopRight', 'TopLeft', 'Right', 'RightMiddle', 'Bottom', 'BottomCenter', 'BottomRight', 'BottomLeft', 'Left', 'LeftMiddle'], |
| connector | 否 | 连线类型 | StateMachine、Flowchart，Bezier、Straight |
