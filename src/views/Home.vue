<template>
  <div class="home">
    <Flow :flowData="data"></Flow>
  </div>
</template>

<script>
// @ is an alias to /src
import Flow from '@/components/flow/Index'
import data from '@/mock/data.json'
export default {
  name: 'Home',
  components: {
    Flow
  },
  data(){
    return {
      data:{}
    }
  },
  created() {
    this.handleData()
  },
  methods:{
    handleData(){
      setTimeout(() => {
        console.log(data)
        this.data = data
      } , 1000)
    }
  }

}
</script>
