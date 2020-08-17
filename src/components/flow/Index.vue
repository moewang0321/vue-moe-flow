
<style lang="scss" scoped>
.flow-box {
  margin: 0 auto;
}
.sketchpad-box {
  overflow: auto;
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  #sketchpad {
    display: inline-block;
    width: 960px;
    height: 1200px;
    position: absolute;
    left: 50%;
    margin-left: -480px;
    margin-top: 100px;
    margin-bottom: 100px;
    z-index: 100;
    background: #ffffff;
    box-shadow: 0 0 2px 2px rgba(0, 0, 0, 0.1);
  }
}
</style>

<template>
  <div class="flow-box">
    <div class="sketchpad-box">
      <div id="sketchpad"></div>
    </div>
  </div>
</template>

<script>
import G6 from "./global/g6/index";
import * as G6Util from "@antv/util";
export default {
  name: "Index",
  props: {
    width: {
      type: Number,
      default: 800,
    },
    height: {
      type: Number,
      default: 800,
    },
    flowData: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  data() {
    return {
      editor: null,
      editorInfo: {},
      defInfo: {
        // 编辑器状态：add || edit || preview
        status: "preview",
      },
    };
  },
  computed: {},
  methods: {
    init() {
      const _t = this;
      const el = _t.$el;
      const plugins = [];

      const sketchpad = el.querySelector("#sketchpad");
      const grid = new G6.Grid();

      plugins.push(grid);

      _t.editor = new G6.Graph({
        plugins,
        container: sketchpad,
        width: sketchpad.clientWidth,
        height: sketchpad.clientHeight,
        fitView: true,
        fitViewPadding: 20,
        autoPaint: true,
        // 模式
        modes: {
          edit: [
            {
              type: "node-control",
              config: {
                shapeControlPoint: {
                  // 是否在缩放、旋转节点时更新所有与之相连的边
                  updateEdge: false,
                },
                dragNode: {
                  // 是否在拖拽节点时更新所有与之相连的边
                  updateEdge: false,
                },
                // 是否支持在节点上添加文本
                nodeLabel: true,
                // 是否支持在边上添加文本
                edgeLabel: true,
                // tooltip 是否启用
                tooltip: {
                  shapeControl: true,
                  dragNode: true,
                  dragEdge: true,
                },
                // 是否启用对齐线
                alignLine: {
                  enable: true,
                  style: {
                    stroke: "#FFA500",
                    lineWidth: 1,
                  },
                },
              },
            },
          ],
          // 只读，
          preview: ["zoom-canvas", "drag-canvas", "preview-canvas"],
        },
        // 分组样式
        groupType: "rect",
        groupStyle: {
          default: {
            lineWidth: 1,
            stroke: "#29B6F2",
            // lineDash: [ 5, 5 ],
            strokeOpacity: 1,
            fill: "#29B6F2",
            fillOpacity: 0.1,
            opacity: 1,
            minDis: 0,
            maxDis: 0,
          },
        },
      });

      // 挂载G6配置
      _t.editor.$C = G6.$C;
      // 挂载编辑器$D命名空间，用于Vue组件与Graph之间传值
      _t.editor.$D = {
        fill: "#FFFFFF",
        fillOpacity: 1,
        lineColor: "#000000",
        strokeOpacity: 1,
        lineWidth: 1,
        lineType: "x-line",
        lineDash: "solid",
        startArrow: false,
        endArrow: false,
        lineAppendWidth: 10,
        autoRotate: true,
      };
      // 设置模式为编辑
      _t.mode = "preview";
      _t.editor.setMode("preview");

      window.editor = _t.editor;
      console.log(_t.flowData);

      _t.renderData();
    },
    initInfo(data = {}) {
      const _t = this;
      _t.editorInfo = {
        ..._t.defInfo,
        ...data,
      };
    },
    renderData() {
      const _t = this;
      _t.editor.data(_t.flowData);
      _t.editor.render();
    },
  },
  created() {
    const _t = this;
    // 处理操作类型，初始化编辑器
    _t.initInfo();
    _t.$nextTick(() => {
      _t.init();
    });
  },
};
</script>
