<template>
  <div style="height: 100vh">
    <FlowChart :flowData="data" :readOnly="state === 'look'"/>
  </div>
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
      state:'add',
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
      console.log(this.data)
    },
  }
}
</script>

<style scoped lang="scss">

</style>
