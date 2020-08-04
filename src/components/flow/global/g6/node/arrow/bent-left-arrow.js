/**
 * Created by OXOYO on 2019/12/26.
 *
 * 左弯箭头
 */

import * as G6Util from '@antv/util'
import base from '../base'
import utils from '../../utils'

export default {
  name: 'bent-left-arrow',
  extendName: 'single-node',
  options: {
    ...base,
    shapeType: 'path',
    getShapeStyle (cfg) {
      const size = this.getSize(cfg)
      const width = size[0]
      const height = size[1]
      const x = 0 - width / 2
      const y = 0 - height / 2
      // 计算箭头
      const { L1, L2, L7 } = utils.node.calculateArrow({
        deg: 85,
        L1: width / 3,
        L7: height / 8
      })
      // 箭头顶点
      const P0 = {
        x: -width / 2,
        y: -height / 2 + L2
      }

      // 左上顶点
      const P1 = {
        x: P0.x + L1,
        y: P0.y - L2
      }
      // 左上中
      const P2 = {
        x: P1.x,
        y: P0.y - L7
      }
      // 右上弧起点
      const P3 = {
        x: width / 2 - 2 * L7,
        y: P0.y - L7
      }
      // 右上弧终点
      const P4 = {
        x: width / 2,
        y: P0.y + L7
      }
      // 右下右顶点
      const P5 = {
        x: width / 2,
        y: height / 2
      }
      // 右下左顶点
      const P6 = {
        x: P5.x - 2 * L7,
        y: P5.y
      }
      // 左下中拐点
      const P7 = {
        x: P6.x,
        y: P0.y + L7
      }
      // 左下中
      const P8 = {
        x: P0.x + L1,
        y: P7.y
      }
      // 左下顶点
      const P9 = {
        x: P8.x,
        y: P0.y + L2
      }

      const path = [
        [ 'M', P0.x, P0.y ],
        [ 'L', P1.x, P1.y ],
        [ 'L', P2.x, P2.y ],
        [ 'L', P3.x, P3.y ],
        [ 'A', 2 * L7, 2 * L7, 45, 0, 1, P4.x, P4.y ],
        [ 'L', P5.x, P5.y ],
        [ 'L', P6.x, P6.y ],
        [ 'L', P7.x, P7.y ],
        [ 'L', P8.x, P8.y ],
        [ 'L', P9.x, P9.y ],
        [ 'Z' ]
      ]
      const color = cfg.color
      const style = G6Util.mix({}, {
        // 节点的位置在上层确定，所以这里仅使用相对位置即可
        x,
        y,
        width,
        height,
        path,
        stroke: color
      }, cfg.style)
      return style
    }
  }
}
