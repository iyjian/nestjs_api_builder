<template>
  <div class="wrapper">
    <el-input
      v-model="input"
      style="width: 30%"
      placeholder="智能判断, 支持JSON, epochTime, Base64 etc."
    ></el-input>
    <div class="content">
      <json-viewer
        v-if="result.dataType === 'jsonStr'"
        :value="JSON.parse(result.content)"
        :expand-depth="5"
      ></json-viewer>
      <div v-else-if="result.dataType === 'img'">
        <img :src="result.content" />
      </div>
      <p v-else class="text">{{ result.content }}</p>
    </div>
  </div>
  <!-- <div class="panel">
    <div
      v-for="transform in transformers"
      class="transform"
      @click="doTransform(transform)"
    >
      <div>{{ transform.name }}</div>
      <div v-for="(paramVal, paramKey) in transform.params">
        <el-input
          v-if="paramVal.type === 'string'"
          v-model="transformerOptions.params[paramKey.toString()]"
        >
          <template #prepend>{{ paramVal.name }}</template>
        </el-input>
      </div>
    </div>
  </div> -->
</template>

<script lang="ts">
export default {
  name: "Tools",
};
</script>

<script lang="ts" setup>
import { reactive, computed, ref, watch } from "vue";
import { toolsClient } from "@/plugins";
// @ts-ignore
import JsonViewer from "vue-json-viewer";
import { TransformerOptions } from "./Tools/types";

const input = ref("");

const result = ref({
  content: "",
  dataType: "",
});

const transformerOptions = reactive<TransformerOptions>({
  name: "",
  func: "",
  content: "",
  signature: "",
  manual: true,
  params: {},
});

const transformers = await toolsClient.getTransformers();

const getDataType = async (content: string) => {
  const dataType = await toolsClient.getDateTypeSignature(content);
  transformerOptions.signature = dataType.signature;
  if (dataType.possibleFunc.highestScoreFunc) {
    // 如果有高分数的转化函数，则直接调用
    console.log(dataType);
    doTransform(transformers[dataType.possibleFunc.highestScoreFunc], false);
  }
};

async function doTransform(transform: any, manual = true) {
  if (!input.value) {
    return;
  }

  transformerOptions.func = transform.func;
  transformerOptions.content = input.value;
  transformerOptions.manual = manual;
  console.log(transformerOptions);
  result.value = await toolsClient.doTransform(transformerOptions);
}

watch(input, async (newInputVal: string) => {
  result.value = {
    content: "",
    dataType: "",
  };
  await getDataType(newInputVal);
});
</script>

<style scoped lang="stylus">
.wrapper
  margin 10px 0px 0px 0px
  display flex
  flex-direction column
  justify-content center
  align-items center
  .content
    width 60vw
    min-height 40vh
    max-height 80vh
    overflow scroll
    margin 20px 20px
    .text
      display flex
      justify-content center
      font-size 1.2em
      word-wrap break-word
      word-break break-all
      white-space pre-wrap
    img
      width 100%
.panel
  position fixed
  top 100px
  left 50px
  width 200px
  height 500px
  border 1px solid lightgray
  display flex
  flex-direction column
  // align-items center
  padding 10px 20px
  .transform
    flex-direction column
    align-items left
    .el-input
      width 100%
      margin-bottom 5px
    margin-bottom 10px
</style>
