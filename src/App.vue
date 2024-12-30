<template>
  <div id="app">
    <div class="element">
      <ColorPicker />
    </div>
    <div class="element">
      <RenderOptions />
    </div>
    <div class="element">
      <ShaderMenu />
    </div>
  </div>
</template>

<script>
// import HelloWorld from './components/HelloWorld.vue'
import ColorPicker from './components/ColorPicker.vue';
import RenderOptions from './components/RenderOptions.vue';
import ShaderMenu from './components/ShaderMenu.vue';

export default {
  name: 'App',
  components: {
    ColorPicker,
    RenderOptions,
    ShaderMenu
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
  flex-direction: row;
  justify-content: center;
  align-items: flex-start;
 margin: 0px;
 padding: 20px;
 background: #2c3e50;
}

.element {
  margin: 10px;
  padding: 10px;
}
</style>