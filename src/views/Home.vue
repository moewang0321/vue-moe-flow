
<template>
  <div class="home">
    <Flow :flowData="data" ref="flow"></Flow>
  </div>
</template>

<script>
// @ is an alias to /src
import Flow from "@/components/flow/Index";
import data from "@/mock/nodes.json";
export default {
  name: "Home",
  components: {
    Flow,
  },
  data() {
    return {
      data: {},
    };
  },
  async created() {
    await this.handleData();
  },
  methods: {
    handleData() {
      setTimeout(() => {
        this.data = data;
      }, 1000);
    },
  },
};
</script>
