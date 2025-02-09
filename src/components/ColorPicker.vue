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
        <input type="range" :id="channel.name" v-model.number="channel.value" min="0" max="255" />
        <span>{{ channel.value }}</span>

        <label :for="channel.name - multiplier">Multiplier:</label>
        <input type="range" :id="`${channel.name}-multiplier`" v-model.number="channel.multiplier" min="1" max="100" />
        <span>{{ channel.multiplier }}</span>

        <span>{{ channel.value * channel.multiplier }}</span>
      </div>
    </div>

    <!-- Color Preview -->
    <div class="color-preview-container">
      <div class="color-preview" :style="{ backgroundColor: previewColor }"></div>
      <TextureCanvas :selectedColor="previewColor" :MaterialProperties="materialProperties"
        :R="this.rgbaChannels[0].value * this.rgbaChannels[0].multiplier"
        :G="this.rgbaChannels[1].value * this.rgbaChannels[1].multiplier"
        :B="this.rgbaChannels[2].value * this.rgbaChannels[2].multiplier"
        :A="this.rgbaChannels[3].value * this.rgbaChannels[3].multiplier" />
    </div>

    <!-- Additional Settings -->
    <h3>Additional Settings</h3>
    <div class="sliders-v2">
      <div v-for="slider in sliders" :key="slider.name" class="slider-v2">
        <label :for="slider.name">{{ slider.name }}:</label>
        <input type="range" :id="slider.name" v-model.number="slider.value" min="0" max="1" step="0.01" />
        <span>{{ slider.value.toFixed(2) }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import TextureCanvas from "./TextureCanvas.vue";

export default {
  name: "ColorPicker",
  components: {
    TextureCanvas,
  },
  data() {
    return {
      url: "http://localhost:5053",
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
    materialProperties() {
      return {
        reflection: this.sliders[0].value.toFixed(2),
        directToScatter: this.sliders[1].value.toFixed(2),
        roughness: this.sliders[2].value.toFixed(2),
        metallic: this.sliders[3].value.toFixed(2),
      };
    },
  },
  methods: {
    submitColor() {
      const colorData = {
        r: parseFloat((this.rgbaChannels[0].value * this.rgbaChannels[0].multiplier / 255)),
        g: parseFloat((this.rgbaChannels[1].value * this.rgbaChannels[1].multiplier / 255)),
        b: parseFloat((this.rgbaChannels[2].value * this.rgbaChannels[2].multiplier / 255)),
        a: parseFloat((this.rgbaChannels[3].value * this.rgbaChannels[3].multiplier / 255)),
        reflection: parseFloat(this.sliders[0].value.toFixed(2)),
        directToScatter: parseFloat(this.sliders[1].value.toFixed(2)),
        roughness: parseFloat(this.sliders[2].value.toFixed(2)),
        metalic: parseFloat(this.sliders[3].value.toFixed(2))
      };

      axios
        .post(`${this.url}/submitColor`, colorData)
        .then((response) => {
          console.log(response.data);
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }
};
</script>

<style scoped>
.color-preview-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  gap: var(--spacing-unit);
}

.color-picker {
  background: var(--bg-secondary);
  border-radius: var(--border-radius);
  padding: var(--spacing-unit);
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-unit);
  overflow-y: auto;
}

button {
  background: linear-gradient(135deg, var(--accent-primary), #3a8eef);
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: var(--border-radius);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: var(--spacing-unit);
}

button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(74, 158, 255, 0.2);
}

.channel-inputs {
  background: var(--bg-tertiary);
  padding: var(--spacing-unit);
  border-radius: var(--border-radius);
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing-unit) * 0.5);
}

.channel {
  display: grid;
  grid-template-columns: 30px 1fr 60px 60px 1fr 60px;
  gap: calc(var(--spacing-unit) * 0.5);
  align-items: center;
  background: var(--bg-secondary);
  padding: calc(var(--spacing-unit) * 0.75);
  border-radius: calc(var(--border-radius) * 0.5);
}

.color-preview {
  padding: 100px;
  height: 50px;
  border-radius: var(--border-radius);
  margin: var(--spacing-unit) 0;
  border: 2px solid rgba(255, 255, 255, 0.05);
  background-image:
    linear-gradient(45deg, #2a2a2a 25%, transparent 25%),
    linear-gradient(-45deg, #2a2a2a 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #2a2a2a 75%),
    linear-gradient(-45deg, transparent 75%, #2a2a2a 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.sliders-v2 {
  display: grid;
  gap: var(--spacing-unit);
  background: var(--bg-tertiary);
  padding: var(--spacing-unit);
  border-radius: var(--border-radius);
}

.slider-v2 {
  display: grid;
  grid-template-columns: 120px 1fr 60px;
  gap: calc(var(--spacing-unit) * 0.5);
  align-items: center;
  background: var(--bg-secondary);
  padding: calc(var(--spacing-unit) * 0.75);
  border-radius: calc(var(--border-radius) * 0.5);
}

input[type="range"] {
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, var(--accent-primary), #3a8eef);
  border-radius: 2px;
  appearance: none;
}

input[type="range"]::-webkit-slider-thumb {
  appearance: none;
  width: 16px;
  height: 16px;
  background: var(--accent-primary);
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.2s;
  border: 2px solid rgba(255, 255, 255, 0.1);
}

input[type="range"]::-webkit-slider-thumb:hover {
  transform: scale(1.2);
}

h2,
h3 {
  color: var(--text-primary);
  margin-bottom: var(--spacing-unit);
}

label {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

span {
  color: var(--text-primary);
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .channel {
    grid-template-columns: 30px 1fr 60px;
  }

  .slider-v2 {
    grid-template-columns: 100px 1fr 60px;
  }
}
</style>
