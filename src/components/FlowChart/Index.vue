<template>
  <div  v-if="easyFlowVisible" style="height: calc(100% - 20px);width: calc(100% - 20px);padding: 10px;font-size: 12px;">
    <el-row>
      <!--顶部工具菜单-->
      <el-col :span="24">
        <div class="ef-tooltar">
          <el-col :span="4">
            <el-input type="primary" :underline="false" v-model="data.name" :disabled="readOnly" placeholder="请输入流程名称" />
          </el-col>
          <el-divider direction="vertical"></el-divider>
          <el-button  type="text" icon="el-icon-delete" size="large" @click="deleteElement" :disabled="!this.activeElement.type || readOnly"></el-button>
          <el-divider direction="vertical"></el-divider>
          <el-button type="text" icon="el-icon-download" size="large" @click="downloadData"></el-button>
          <el-divider direction="vertical"></el-divider>
          <el-button type="text" icon="el-icon-plus" size="large" @click="zoomAdd"></el-button>
          <el-divider direction="vertical"></el-divider>
          <el-button type="text" icon="el-icon-minus" size="large" @click="zoomSub"></el-button>
          <el-divider direction="vertical"></el-divider>
          <el-button type="text" icon="el-icon-refresh" size="large" @click="cleanAll"></el-button>
          <div style="float: right;margin-right: 5px">
            <!--                        <el-button type="info" plain round icon="el-icon-document" @click="dataInfo" size="mini">流程信息</el-button>-->
<!--            <el-button type="primary" plain round @click="dataReloadA" icon="el-icon-refresh" size="mini">切换流程A</el-button>-->
            <el-button type="primary" plain round @click="saveData" size="mini">保存</el-button>
            <!--                        <el-button type="info" plain round icon="el-icon-document" @click="openHelp" size="mini">帮助</el-button>-->
          </div>
        </div>
      </el-col>
    </el-row>

    <div style="display: flex;height: calc(100% - 47px);">
      <div style="width: 230px;border-right: 1px solid #dce3e8;" v-if="!readOnly">
        <NodeMenu @addNode="addNode" ref="nodeMenu"></NodeMenu>
      </div>
      <div class="efBg" :class="readOnly ? 'noHasMenu' : 'hasMenu'">
        <div id="efContainer" ref="efContainer" class="container"  style="width: 200%;height: 200%;overflow: hidden;transform-origin: 0 0 0">
          <template v-for="node in data.nodeList">
            <Node
                v-flowDrag
                :id="node.id"
                :key="node.id"
                :node="node"
                :activeElement="activeElement"
                @changeNodeSite="changeNodeSite"
                @nodeRightMenu="nodeRightMenu"
                @clickNode="clickNode"
            >
            </Node>
          </template>
          <!-- 给画布一个默认的宽度和高度 -->
          <div style="position:absolute;top: 2000px;left: 2000px;">&nbsp;</div>
        </div>

      </div>
      <!-- 右侧表单 -->
      <div style="width: 300px;border-left: 1px solid #dce3e8;background-color: #FBFBFB">
        <NodeForm ref="nodeForm" :readOnly="readOnly" @setLineLabel="setLineLabel" @repaintEverything="repaintEverything" ></NodeForm>
      </div>
    </div>
  </div>
</template>

<script>
import draggable from 'vuedraggable'
import lodash from 'lodash'
import { jsPlumb } from 'jsplumb'
import './index.css'
import { easyFlowMixin } from './mixins'
import Node from './node'
import NodeMenu from './node_menu'
import NodeForm from './node_form'
export default {
  name: "Index",
  components:{
    draggable, Node, NodeMenu, NodeForm
  },
  props:{
    flowData: { // 数据
      type: Object,
      default(){
        return {
          nodeList:[],
          lineList:[]
        }
      }
    },
    readOnly: { // 只读
      type: Boolean,
      default: false
    }
  },
  data(){
    return {
      // jsPlumb 实例
      jsPlumb: null,
      // 控制画布销毁
      easyFlowVisible: true,
      // 是否加载完毕标志位
      loadFlowFinish: false,
      // 数据
      data: {
        nodeList:[],
        lineList:[]
      },
      // 激活的元素、可能是节点、可能是连线
      activeElement: {
        // 可选值 node 、line
        type: undefined,
        // 节点ID
        nodeId: undefined,
        // 连线ID
        sourceId: undefined,
        targetId: undefined
      },
      zoom: 1
    }
  },
  // 基础配置
  mixins:[ easyFlowMixin ],
  directives:{
    'flowDrag': {
      bind(el , binding , vnode , oldNode) {
        if(!binding) return

        el.onmousedown = (e) => {
          if(e.button !== 0) return

          // 计算鼠标点击位置距离可视区的高度
          let disx = e.clientX,
              disy = e.clientY
          el.style.cursor = 'move'

          document.onmousemove = function (e) {
            e.preventDefault()

            const left = e.clientX - disx
            const top = e.clientY - disy

            disx = e.clientX
            disy = e.clientY

            el.scrollLeft += -left
            el.scrollTop += -top
          }

          document.onmouseup = function (e) {
            el.style.cursor = ''
            document.onmousemove = null
            document.onmouseup = null
          }
        }
      }
    }
  },
  mounted() {
    this.jsPlumb = jsPlumb.getInstance()
    this.$nextTick(() => {
      console.log('mounted:' , this.flowData)
      this.dataReload(this.flowData)
    })
  },
  methods:{
    // 生成id
    getUUID() {
      return Math.random().toString(36).substr(3, 10)
    },
    init() {
      this.jsPlumb.ready(() => {
        // 导入默认配置
        this.jsPlumb.importDefaults(this.jsplumbSetting)
        // 会使整个jsPlumb重绘
        this.jsPlumb.setSuspendDrawing(false , true)
        // 初始化节点
        this.loadFlow()
        // 单击连接线
        this.jsPlumb.bind('click' , (conn , originalEvent) => {
          this.activeElement.type = 'line'
          this.activeElement.sourceId = conn.sourceId
          this.activeElement.targetId = conn.targetId
          this.$refs.nodeForm.lineInit({
            from: conn.sourceId,
            to: conn.targetId,
            label: conn.getLabel()
          })
        })
        // 连接线
        this.jsPlumb.bind('connection' , (evt) => {
          console.log('evt:' + evt)
          let from = evt.source.id
          let to = evt.target.id
          if (this.loadFlowFinish) {
            this.data.lineList.push({from: from, to: to})
          }
        })

        // 删除连线回调
        this.jsPlumb.bind("connectionDetached", (evt) => {
          this.deleteLine(evt.sourceId, evt.targetId)
        })

        // 改变线的连接节点
        this.jsPlumb.bind("connectionMoved", (evt) => {
          this.changeLine(evt.originalSourceId, evt.originalTargetId)
        })

        // 连线右击
        this.jsPlumb.bind("contextmenu", (evt) => {
          console.log('contextmenu', evt)
        })

        // 连线
        this.jsPlumb.bind("beforeDrop", (evt) => {
          let from = evt.sourceId
          let to = evt.targetId
          if (from === to) {
            this.$message.error('节点不支持连接自己')
            return false
          }
          if (this.hasLine(from, to)) {
            this.$message.error('该关系已存在,不允许重复创建')
            return false
          }
          if (this.hashOppositeLine(from, to)) {
            this.$message.error('不支持两个节点之间连线回环');
            return false
          }
          this.$message.success('连接成功')
          return true
        })

        this.jsPlumb.setContainer(this.$refs.efContainer)

      })
    },
    loadFlow(){
      // 初始化节点
      for (var i = 0; i < this.data.nodeList.length; i++) {
        let node = this.data.nodeList[i]
        // 设置源点，可以拖出线连接其他节点
        this.jsPlumb.makeSource(node.id, lodash.merge(this.jsplumbSourceOptions, {}))
        // 设置目标点，其他源点拖出的线可以连接该节点
        this.jsPlumb.makeTarget(node.id, this.jsplumbTargetOptions)
        if (!node.viewOnly) {
          this.jsPlumb.draggable(node.id, {
            containment: 'parent',
            grid: [17, 17],
            stop: function (el) {
              // 拖拽节点结束后的对调
            }
          })
        }
      }
      // 初始化连线
      for (var i = 0; i < this.data.lineList.length; i++) {
        let line = this.data.lineList[i]
        var connParam = {
          source: line.from,
          target: line.to,
          label: line.label ? line.label : '',
          connector: line.connector ? line.connector : '',
          anchors: line.anchors ? line.anchors : undefined,
          paintStyle: line.paintStyle ? line.paintStyle : undefined,
        }
        this.jsPlumb.connect(connParam, this.jsplumbConnectOptions)
      }
      this.$nextTick(function () {
        this.loadFlowFinish = true
      })
    },
    // 设置连线条件
    setLineLabel(from, to, label) {
      var conn = this.jsPlumb.getConnections({
        source: from,
        target: to
      })[0]
      if (!label || label === '') {
        conn.removeClass('flowLabel')
        conn.addClass('emptyFlowLabel')
      } else {
        conn.addClass('flowLabel')
      }
      conn.setLabel({
        label: label,
      })
      this.data.lineList.forEach(function (line) {
        if (line.from == from && line.to == to) {
          line.label = label
        }
      })

    },
    // 删除激活的元素
    deleteElement() {
      if (this.activeElement.type === 'node') {
        this.deleteNode(this.activeElement.nodeId)
      } else if (this.activeElement.type === 'line') {
        this.$confirm('确定删除所点击的线吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          var conn = this.jsPlumb.getConnections({
            source: this.activeElement.sourceId,
            target: this.activeElement.targetId
          })[0]
          this.jsPlumb.deleteConnection(conn)
        }).catch(() => {
        })
      }
    },
    // 删除线
    deleteLine(from, to) {
      this.data.lineList = this.data.lineList.filter(function (line) {
        if (line.from == from && line.to == to) {
          return false
        }
        return true
      })
    },
    // 改变连线
    changeLine(oldFrom, oldTo) {
      this.deleteLine(oldFrom, oldTo)
    },
    // 改变节点的位置
    changeNodeSite(data) {
      for (var i = 0; i < this.data.nodeList.length; i++) {
        let node = this.data.nodeList[i]
        if (node.id === data.nodeId) {
          node.left = data.left
          node.top = data.top
        }
      }
    },
    /**
     * 拖拽结束后添加新的节点
     * @param evt
     * @param nodeMenu 被添加的节点对象
     * @param mousePosition 鼠标拖拽结束的坐标
     */
    addNode(evt, nodeMenu, mousePosition) {
      var screenX = evt.originalEvent.clientX, screenY = evt.originalEvent.clientY
      let efContainer = this.$refs.efContainer
      var containerRect = efContainer.getBoundingClientRect()
      var left = screenX, top = screenY
      // 计算是否拖入到容器中
      if (left < containerRect.x || left > containerRect.width + containerRect.x || top < containerRect.y || containerRect.y > containerRect.y + containerRect.height) {
        this.$message.error("请把节点拖入到画布中")
        return
      }
      left = left - containerRect.x + efContainer.scrollLeft
      top = top - containerRect.y + efContainer.scrollTop
      // 居中
      left -= 85
      top -= 16
      var nodeId = this.getUUID()
      // 动态生成名字
      var origName = nodeMenu.name
      var nodeName = origName
      var index = 1
      while (index < 10000) {
        var repeat = false
        for (var i = 0; i < this.data.nodeList.length; i++) {
          let node = this.data.nodeList[i]
          if (node.name === nodeName) {
            nodeName = origName + index
            repeat = true
          }
        }
        if (repeat) {
          index++
          continue
        }
        break
      }
      var node = {
        id: nodeId,
        name: nodeName,
        type: nodeMenu.type,
        left: left + 'px',
        top: top + 'px',
        ico: nodeMenu.ico,
        state: 'success'
      }
      /**
       * 这里可以进行业务判断、是否能够添加该节点
       */
      this.data.nodeList.push(node)
      this.$nextTick(function () {
        this.jsPlumb.makeSource(nodeId, this.jsplumbSourceOptions)
        this.jsPlumb.makeTarget(nodeId, this.jsplumbTargetOptions)
        this.jsPlumb.draggable(nodeId, {
          containment: 'parent',
          grid: [17, 17],
          stop: function (el) {
            // 拖拽节点结束后的对调
            console.log('拖拽结束: ', el)
          }
        })
      })
    },
    /**
     * 删除节点
     * @param nodeId 被删除节点的ID
     */
    deleteNode(nodeId) {
      this.$confirm('确定要删除节点' + nodeId + '?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        closeOnClickModal: false
      }).then(() => {
        /**
         * 这里需要进行业务判断，是否可以删除
         */
        this.data.nodeList = this.data.nodeList.filter(function (node) {
          if (node.id === nodeId) {
            // 伪删除，将节点隐藏，否则会导致位置错位
            // node.show = false
            return false
          }
          return true
        })
        this.$nextTick(function () {
          this.jsPlumb.removeAllEndpoints(nodeId);
        })
      }).catch(() => {
      })
      return true
    },
    clickNode(nodeId) {
      this.activeElement.type = 'node'
      this.activeElement.nodeId = nodeId
      console.log(this.activeElement)
      this.$refs.nodeForm.nodeInit(this.data, nodeId)
    },
    // 是否具有该线
    hasLine(from, to) {
      for (var i = 0; i < this.data.lineList.length; i++) {
        var line = this.data.lineList[i]
        if (line.from === from && line.to === to) {
          return true
        }
      }
      return false
    },
    // 是否含有相反的线
    hashOppositeLine(from, to) {
      return this.hasLine(to, from)
    },
    nodeRightMenu(nodeId, evt) {
      this.menu.show = true
      this.menu.curNodeId = nodeId
      this.menu.left = evt.x + 'px'
      this.menu.top = evt.y + 'px'
    },
    repaintEverything() {
      this.jsPlumb.repaint()
    },
    // 加载流程图
    dataReload(data) {
      this.easyFlowVisible = false
      this.data.nodeList = []
      this.data.lineList = []
      this.$nextTick(() => {
        data = lodash.cloneDeep(data)
        this.easyFlowVisible = true
        this.data = data
        this.$nextTick(() => {
          this.jsPlumb = jsPlumb.getInstance()
          this.$nextTick(() => {
            console.log(this.data)
            this.init()
          })
        })
      })
    },
    zoomAdd() {
      if (this.zoom >= 1) {
        return
      }
      this.zoom = this.zoom + 0.1
      this.$refs.efContainer.style.transform = `scale(${this.zoom})`
      this.jsPlumb.setZoom(this.zoom)
    },
    zoomSub() {
      if (this.zoom <= 0.5) {
        return
      }
      this.zoom = this.zoom - 0.1
      this.$refs.efContainer.style.transform = `scale(${this.zoom})`
      this.jsPlumb.setZoom(this.zoom)
    },
    // 下载数据
    downloadData() {
      this.$confirm('确定要下载该流程数据吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        closeOnClickModal: false
      }).then(() => {
        var datastr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.data, null, '\t'));
        var downloadAnchorNode = document.createElement('a')
        downloadAnchorNode.setAttribute("href", datastr);
        downloadAnchorNode.setAttribute("download", 'data.json')
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        this.$message.success("正在下载中,请稍后...")
      }).catch(() => {
      })
    },
    // 上传数据
    saveData(){

    },
    cleanAll() {
      this.data.nodeList = []
      this.data.lineList.forEach((item) => {
        var conn = this.jsPlumb.getConnections({
          source: item.sourceId,
          target: item.targetId
        })[0]
        this.jsPlumb.deleteConnection(conn)
      })
      this.data.name = ''
    }
  }

}
</script>

<style lang="scss" scoped>
.hasMenu{
  width:calc( 100vw - 530px );
}
.noHasMenu{
  width:calc( 100vw - 300px );
}
/deep/.el-input__inner {
  height: 32px;
  margin: 5px 0;
}
</style>
