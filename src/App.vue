<template>
  <div id="app">
    <div class="app-grid">
      <ColorPicker />
      <RenderOptions />
      <ShaderMenu />
      <VoxelPicker />
    </div>
  </div>
</template>

<script>
// import HelloWorld from './components/HelloWorld.vue'
import ColorPicker from './components/ColorPicker.vue';
import RenderOptions from './components/RenderOptions.vue';
import ShaderMenu from './components/ShaderMenu.vue';
import VoxelPicker from './components/VoxelPicker.vue';

export default {
  name: 'App',
  components: {
    ColorPicker,
    RenderOptions,
    ShaderMenu,
    VoxelPicker
  }
}
</script>

<style>
:root {
  --bg-primary: #121212;
  --bg-secondary: #1a1a1a;
  --bg-tertiary: #242424;
  --accent-primary: #4a9eff;
  --text-primary: #e1e1e1;
  --text-secondary: #a1a1a1;
  --spacing-unit: clamp(0.5rem, 1vw, 1rem);
  --border-radius: 8px;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}

#app {
  min-height: 100vh;
  padding: var(--spacing-unit);
}

.app-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: var(--spacing-unit);
  height: calc(100vh - 2 * var(--spacing-unit));
}

/* Common component styling */
.color-picker,
.render-options,
.shader-menu {
  background: var(--bg-secondary);
  border-radius: var(--border-radius);
  padding: var(--spacing-unit);
  height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-unit);
}

/* Scrollbar styling */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: var(--bg-secondary);
}

::-webkit-scrollbar-thumb {
  background: var(--bg-tertiary);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--accent-primary);
}

/* Responsive breakpoints */
@media screen and (max-width: 1200px) {
  .app-grid {
    grid-template-columns: 1fr;
    grid-template-rows: repeat(4, auto);
    height: auto;
  }
}

/* Common form controls */
button {
  background: linear-gradient(135deg, var(--accent-primary), #3a8eef);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius);
  cursor: pointer;
  font-weight: 500;
  transition: transform 0.2s;
}

button:hover {
  transform: translateY(-2px);
}

input[type="range"] {
  width: 100%;
  height: 4px;
  background: var(--bg-tertiary);
  border-radius: 2px;
}

input[type="number"],
select {
  background: var(--bg-tertiary);
  border: 1px solid #333;
  color: var(--text-primary);
  padding: 0.3rem;
  border-radius: 4px;
}

h2, h3, h4 {
  color: var(--text-primary);
  font-weight: 600;
}

label {
  color: var(--text-secondary);
}
</style>

