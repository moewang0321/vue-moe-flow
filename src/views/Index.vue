<template>
  <FlowChart :flowData="data" :readOnly="state === 'look'"/>
</template>

<script>
import FlowChart from '@/components/FlowChart/Index'
import {getData} from '@/components/FlowChart/mock/data'
export default {
  name: "Index",
  components:{FlowChart},
  data(){
    return {
      data:{},
      state:'look',
      refresh: true
    }
  },
  created() {
    this.getFlowData()
  },
  methods:{
    // 模拟异步请求数据
    getFlowData(){
      let data = getData()
      if(this.state === 'look') {
        data.nodeList.forEach( (item) => {
          item.viewOnly = true
        })
      }
      this.data = data
    },
  }
}
</script>

<style scoped lang="scss">

</style>
