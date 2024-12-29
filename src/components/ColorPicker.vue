<template>
  <div class="color-picker">
    <h2>Color Picker</h2>

    <div>
      <button @click="submitColor">Submit Color</button>
    </div>

    <!-- RGBA Sliders -->
    <div class="channel-inputs">
      <div v-for="channel in rgbaChannels" :key="channel.name" class="channel">
        <label :for="channel.name">{{ channel.name }}:</label>
        <input
          type="range"
          :id="channel.name"
          v-model.number="channel.value"
          min="0"
          max="255"
        />
        <span>{{ channel.value }}</span>

        <label :for="channel.name - multiplier">Multiplier:</label>
        <input
          type="range"
          :id="`${channel.name}-multiplier`"
          v-model.number="channel.multiplier"
          min="1"
          max="100"
        />
        <span>{{ channel.multiplier }}</span>

        <span>{{ channel.value * channel.multiplier }}</span>
      </div>
    </div>

    <!-- Color Preview -->
    <div class="color-preview" :style="{ backgroundColor: previewColor }"></div>

    <!-- Additional Settings -->
    <h3>Additional Settings</h3>
    <div class="sliders">
      <div v-for="slider in sliders" :key="slider.name" class="slider">
        <label :for="slider.name">{{ slider.name }}:</label>
        <input
          type="range"
          :id="slider.name"
          v-model.number="slider.value"
          min="0"
          max="1"
          step="0.01"
        />
        <span>{{ slider.value.toFixed(2) }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { inject } from "vue";
import axios from "axios";

export default {
  name: "ColorPicker",
  setup() {
    const apiAddress = inject("apiAddress");
    return { apiAddress };
  },
  data() {
    return {
      rgbaChannels: [
        { name: "R", value: 0, multiplier: 1 },
        { name: "G", value: 0, multiplier: 1 },
        { name: "B", value: 0, multiplier: 1 },
        { name: "A", value: 0, multiplier: 1 },
      ],
      sliders: [
        { name: "Reflection", value: 0.5 },
        { name: "Direct to Scatter", value: 0.5 },
        { name: "Roughness", value: 0.5 },
        { name: "Metallic", value: 0.5 },
      ],
    };
  },
  computed: {
    previewColor() {
      const r = this.rgbaChannels[0].value * this.rgbaChannels[0].multiplier;
      const g = this.rgbaChannels[1].value * this.rgbaChannels[1].multiplier;
      const b = this.rgbaChannels[2].value * this.rgbaChannels[2].multiplier;
      const a = this.rgbaChannels[3].value * this.rgbaChannels[3].multiplier / 255;

      return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(
        b
      )}, ${a.toFixed(2)})`;
    },
  },
  methods: {
    submitColor() {
      const colorData = {
        r: this.rgbaChannels[0].value * this.rgbaChannels[0].multiplier,
        g: this.rgbaChannels[1].value * this.rgbaChannels[1].multiplier,
        b: this.rgbaChannels[2].value * this.rgbaChannels[2].multiplier,
        a: this.rgbaChannels[3].value * this.rgbaChannels[3].multiplier,
        reflection: this.sliders[0].value,
        directToScatter: this.sliders[1].value,
        roughness: this.sliders[2].value,
        metallic: this.sliders[3].value,
      };

      axios
        .post(`${this.apiAddress}/color`, colorData)
        .then((response) => {
          console.log(response.data);
        })
        .catch((error) => {
          console.error(error);
        });
    },
  },
};
</script>

<style scoped>
#app {
  margin-top: 20px;
}

.color-picker, .render-options {
  padding: 1rem;
  max-width: 800px;
  margin: 0 auto 1rem;
  border-radius: 8px;
}

h2, h3 {
  font-size: 1.1rem;
  margin-bottom: 1rem;
}

h3 {
  font-size: 1rem;
  margin-top: 1rem;
}

h4 {
  font-size: 0.9rem;
  margin: 0 0 0.75rem 0;
}

.channel-inputs,
.sliders,
.option-card {
  padding: 0.75rem;
  border-radius: 6px;
  margin-bottom: 0.75rem;
}

.channel,
.slider {
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  gap: 0.5rem;
  border-radius: 4px;
}

label {
  font-size: 0.8rem;
}

input[type="range"] {
  height: 3px;
}

input[type="range"]::-webkit-slider-thumb {
  width: 12px;
  height: 12px;
}

.number-input {
  padding: 0.2rem 0.4rem;
  font-size: 0.8rem;
}

span {
  font-size: 0.8rem;
  padding: 0.2rem 0.4rem;
}

.color-preview {
  height: 60px;
  margin: 1rem 0;
}

button {
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

select {
  padding: 0.3rem;
  font-size: 0.8rem;
}

.slider-with-input {
  grid-template-columns: 80px 1fr;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.controls {
  grid-template-columns: 1fr 60px;
  gap: 0.25rem;
}

.select-group {
  grid-template-columns: 1fr 100px;
  gap: 0.25rem;
}

.options-grid {
  gap: 0.75rem;
}

.options-flex {
  gap: 0.5rem;
}

::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.color-picker {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  padding: 2.5rem;
  background: linear-gradient(145deg, #1a1a1a, #202020);
  border-radius: 16px;
  color: #e1e1e1;
  max-width: 900px;
  margin: 0 auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

h2, h3 {
  color: #ffffff;
  font-weight: 600;
  margin-bottom: 2rem;
  font-size: 1.5rem;
  letter-spacing: -0.02em;
}

h3 {
  font-size: 1.2rem;
  color: #4a9eff;
  margin-top: 2rem;
}

.channel-inputs,
.sliders {
  background: rgba(42, 42, 42, 0.6);
  padding: 2rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.channel,
.slider {
  display: grid;
  grid-template-columns: 100px 1fr 80px 100px 1fr 80px 100px;
  align-items: center;
  margin-bottom: 1.25rem;
  gap: 1rem;
  padding: 0.75rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  transition: background-color 0.2s ease;
}

.channel:hover,
.slider:hover {
  background: rgba(0, 0, 0, 0.3);
}

label {
  font-size: 0.9rem;
  color: #a1a1a1;
  font-weight: 500;
}

input[type="range"] {
  height: 4px;
  border-radius: 4px;
  background: linear-gradient(90deg, #2a2a2a, #3a3a3a);
  appearance: none;
  margin: 0;
  position: relative;
  cursor: pointer;
}

input[type="range"]::-webkit-slider-thumb {
  appearance: none;
  width: 18px;
  height: 18px;
  background: #4a9eff;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

input[type="range"]::-webkit-slider-thumb:hover {
  transform: scale(1.2);
  background: #5db1ff;
  box-shadow: 0 0 16px rgba(74, 158, 255, 0.4);
}

input[type="range"]:focus {
  outline: none;
}

span {
  width: auto;
  text-align: right;
  font-family: 'JetBrains Mono', monospace;
  color: #4a9eff;
  font-size: 0.9rem;
  background: rgba(74, 158, 255, 0.1);
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  transition: all 0.2s ease;
}

span:hover {
  background: rgba(74, 158, 255, 0.2);
}

.color-preview {
  width: 100%;
  height: 120px;
  margin: 2rem 0;
  border-radius: 12px;
  border: 2px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  background-image: linear-gradient(45deg, #222 25%, transparent 25%),
                    linear-gradient(-45deg, #222 25%, transparent 25%),
                    linear-gradient(45deg, transparent 75%, #222 75%),
                    linear-gradient(-45deg, transparent 75%, #222 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
}

.color-preview:hover {
  transform: scale(1.02) translateY(-4px);
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.2);
}

button {
  background: linear-gradient(135deg, #4a9eff, #3a8eef);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 2.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 12px rgba(74, 158, 255, 0.2);
}

button:hover {
  background: linear-gradient(135deg, #5db1ff, #4a9eff);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(74, 158, 255, 0.3);
}

button:active {
  transform: translateY(0);
  box-shadow: 0 4px 12px rgba(74, 158, 255, 0.2);
}

@media (max-width: 1024px) {
  .channel,
  .slider {
    grid-template-columns: 100px 1fr 60px;
  }
  
  .color-picker,
  .render-options {
    padding: 0.75rem;
    margin: 0.5rem;
  }
}

/* Add smooth scrollbar */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: #1a1a1a;
}

::-webkit-scrollbar-thumb {
  background: #3a3a3a;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #4a9eff;
}
</style>