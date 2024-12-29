<template>
  <div id="app">
    <ColorPicker />
    <RenderOptions />
  </div>
</template>

<script>
// import HelloWorld from './components/HelloWorld.vue'
import ColorPicker from './components/ColorPicker.vue';
import RenderOptions from './components/RenderOptions.vue';

export default {
  name: 'App',
  components: {
    ColorPicker,
    RenderOptions
  }
}
</script>

<style>
#app {
  display: flex;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
 margin: 0;
 padding: 0;
}
</style>