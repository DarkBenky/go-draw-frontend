<template>
    <div class="color-picker">
      <h2>Volume Picker</h2>
  
      <button @click="submitVolumeColors">Submit Volume Colors</button>
      

      <!-- Randomness Select -->
      <div class="randomness-select">
        <label>Color Randomness:</label>
        <select v-model="colorRandomnessVoxel">
          <option value="none">None</option>
          <option value="random">Random</option>
        </select>
      </div>

      <!-- Render Voxels Select -->
      <div class="randomness-select">
        <label>Render Voxels</label>
        <select v-model="renderVoxel">
          <option value="false">False</option>
          <option value="true">True</option>
        </select>
      </div>
  
      <!-- Add after randomness select -->
      <div class="randomness-control" v-if="colorRandomnessVoxel === 'random'">
        <label>Randomness Scale:</label>
        <div class="slider-v2">
          <input
            type="range"
            v-model.number="randomnessScaleVoxel"
            min="1"
            max="255"
            step="1"
          />
          <input
            type="number"
            v-model.number="randomnessScaleVoxel"
            min="1"
            max="255"
            class="number-input"
          />
        </div>
      </div>
      
  
      <!-- Voxel Color Section -->
      <div class="color-section">
        <h3>Voxel Color</h3>
        <div class="channel-inputs">
          <div v-for="channel in voxelColor" :key="channel.name" class="channel">
            <label>{{ channel.name }}:</label>
            <input
              type="range"
              v-model.number="channel.value"
              min="0"
              max="255"
            />
            <input
              type="number"
              v-model.number="channel.value"
              min="0"
              max="255"
              class="number-input"
            />
            <label>Mul:</label>
            <input
              type="range"
              v-model.number="channel.multiplier"
              min="1"
              max="10"
              step="0.1"
            />
            <input
              type="number"
              v-model.number="channel.multiplier"
              min="1"
              max="10"
              step="0.1"
              class="number-input"
            />
          </div>
        </div>
        <div class="color-preview" :style="{ backgroundColor: voxelPreviewColor }"></div>
      </div>
  
      <!-- Smoke Color Section -->

      <!-- Randomness Select -->
      <div class="randomness-select">
        <label>Color Randomness:</label>
        <select v-model="colorRandomness">
          <option value="none">None</option>
          <option value="random">Random</option>
        </select>
      </div>


       <!-- Render Voxels Select -->
       <div class="randomness-select">
        <label>Render Volume</label>
        <select v-model="renderVolume">
          <option value="false">False</option>
          <option value="true">True</option>
        </select>
      </div>
  
      <!-- Add after randomness select -->
      <div class="randomness-control" v-if="colorRandomness === 'random'">
        <label>Randomness Scale:</label>
        <div class="slider-v2">
          <input
            type="range"
            v-model.number="randomnessScale"
            min="1"
            max="255"
            step="1"
          />
          <input
            type="number"
            v-model.number="randomnessScale"
            min="1"
            max="255"
            class="number-input"
          />
        </div>
      </div>


      <div class="color-section">
        <h3>Smoke Color</h3>
        <div class="channel-inputs">
          <div v-for="channel in smokeColor" :key="channel.name" class="channel">
            <label>{{ channel.name }}:</label>
            <input
              type="range"
              v-model.number="channel.value"
              min="0"
              max="255"
            />
            <input
              type="number"
              v-model.number="channel.value"
              min="0"
              max="255"
              class="number-input"
            />
            <label>Mul:</label>
            <input
              type="range"
              v-model.number="channel.multiplier"
              min="1"
              max="10"
              step="0.1"
            />
            <input
              type="number"
              v-model.number="channel.multiplier"
              min="1"
              max="10"
              step="0.1"
              class="number-input"
            />
          </div>
        </div>
        <div class="color-preview" :style="{ backgroundColor: smokePreviewColor }"></div>
      </div>
  
      <!-- Density & Transmittance -->
      <div class="sliders volume-properties">
        <h3>Volume Properties</h3>
        <div class="slider-v2">
          <label>Density:</label>
          <input
            type="range"
            v-model.number="density"
            min="0"
            max="0.1"
            step="0.00001"
          />
          <input
            type="number"
            v-model.number="density"
            min="0"
            max="0.1"
            step="0.0001"
            class="number-input"
          />
        </div>
        <div class="slider-v2">
          <label>Transmittance:</label>
          <input
            type="range"
            v-model.number="transmittance"
            min="0"
            max="255"
            step="0.01"
          />
          <input
            type="number"
            v-model.number="transmittance"
            min="0"
            max="1"
            step="0.01"
            class="number-input"
          />
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { inject } from "vue";
  import axios from "axios";
  
  export default {
    name: "VolumeColorPicker",
    setup() {
      const apiAddress = inject("apiAddress");
      return { apiAddress };
    },
    data() {
      return {
        colorRandomness: "none",
        colorRandomnessVoxel: "none",
        voxelColor: [
          { name: "R", value: 128, multiplier: 1 },
          { name: "G", value: 128, multiplier: 1 },
          { name: "B", value: 128, multiplier: 1 },
          { name: "A", value: 255, multiplier: 1 },
        ],
        smokeColor: [
          { name: "R", value: 200, multiplier: 1 },
          { name: "G", value: 200, multiplier: 1 },
          { name: "B", value: 200, multiplier: 1 },
          { name: "A", value: 100, multiplier: 1 },
        ],
        density: 0.0,
        transmittance: 0.5,
        randomnessScale: 10,
        randomnessScaleVoxel : 10,
        renderVolume : false,
        renderVoxel : false,
      };
    },
    computed: {
      voxelPreviewColor() {
        const [r, g, b, a] = this.voxelColor;
        return this.toRGBA(r, g, b, a);
      },
      smokePreviewColor() {
        const [r, g, b, a] = this.smokeColor;
        return this.toRGBA(r, g, b, a);
      },
    },
    methods: {
      applyRandomness(channel) {
        if (this.colorRandomness === "random") {
          const randValue = Math.random() * this.randomnessScale;
          channel.value = Math.min(
            Math.max(Math.round(channel.value + randValue - this.randomnessScale/2), 0),
            255
          );
        }
      },
      toRGBA(r, g, b, a) {
        const rr = r.value * r.multiplier;
        const gg = g.value * g.multiplier;
        const bb = b.value * b.multiplier;
        const aa = (a.value * a.multiplier) / 255;
        return `rgba(${Math.round(rr)}, ${Math.round(gg)}, ${Math.round(bb)}, ${aa.toFixed(2)})`;
      },
      submitVolumeColors() {
        const voxel = this.convertChannels(this.voxelColor);
        const smoke = this.convertChannels(this.smokeColor);
        
        const payload = {
          voxelColorR: voxel[0].value,
          voxelColorG: voxel[1].value,
          voxelColorB: voxel[2].value,
          voxelColorA: voxel[3].value,
          smokeColorR: smoke[0].value,
          smokeColorG: smoke[1].value,
          smokeColorB: smoke[2].value,
          smokeColorA: smoke[3].value,
          density: this.density,
          transmittance: this.transmittance,
          randomness: this.colorRandomness === "random" ? this.randomnessScale : 0,
          randomnessVoxel: this.colorRandomnessVoxel === "random" ? this.randomnessScaleVoxel : 0,
          renderVolume: this.renderVolume === "true", // Convert to boolean
          renderVoxel: this.renderVoxel === "true"    // Convert to boolean
        };
      
        axios
          .post(`${this.apiAddress}/submitVoxel`, payload)
          .then((res) => console.log(res.data))
          .catch((err) => console.error(err));
      },
      convertChannels(arr) {
        return arr.map((chan) => ({
          name: chan.name,
          value: chan.value * chan.multiplier,
        }));
      },
    },
  };
  </script>

  <style scoped>
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

.randomness-select {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: var(--spacing-unit);
  align-items: center;
  background: var(--bg-tertiary);
  padding: calc(var(--spacing-unit) * 0.75);
  border-radius: var(--border-radius);
  margin-bottom: var(--spacing-unit);
}

.randomness-control {
  background: var(--bg-tertiary);
  padding: var(--spacing-unit);
  border-radius: var(--border-radius);
  margin-bottom: var(--spacing-unit);
}

.color-section {
  background: var(--bg-tertiary);
  padding: var(--spacing-unit);
  border-radius: var(--border-radius);
  margin-bottom: var(--spacing-unit);
}

.channel-inputs {
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing-unit) * 0.5);
}

.channel {
  display: grid;
  grid-template-columns: 30px 1fr 60px 30px 1fr 60px;
  gap: calc(var(--spacing-unit) * 0.5);
  align-items: center;
  background: var(--bg-secondary);
  padding: calc(var(--spacing-unit) * 0.5);
  border-radius: calc(var(--border-radius) * 0.5);
}

.color-preview {
  height: 60px;
  border-radius: var(--border-radius);
  margin-top: var(--spacing-unit);
  border: 2px solid rgba(255, 255, 255, 0.05);
  background-image: 
    linear-gradient(45deg, #2a2a2a 25%, transparent 25%),
    linear-gradient(-45deg, #2a2a2a 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #2a2a2a 75%),
    linear-gradient(-45deg, transparent 75%, #2a2a2a 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
  transition: all 0.3s ease;
}

.color-preview:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.slider-v2 {
  display: grid;
  grid-template-columns: 120px 1fr 80px;
  gap: calc(var(--spacing-unit) * 0.5);
  align-items: center;
  margin-bottom: calc(var(--spacing-unit) * 0.5);
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

.number-input {
  width: 100%;
  padding: 0.4rem;
  background: var(--bg-secondary);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: calc(var(--border-radius) * 0.5);
  color: var(--text-primary);
  text-align: right;
  font-family: 'JetBrains Mono', monospace;
}

select {
  background: var(--bg-secondary);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
  padding: 0.4rem;
  border-radius: calc(var(--border-radius) * 0.5);
  cursor: pointer;
}

h2, h3 {
  color: var(--text-primary);
  margin-bottom: var(--spacing-unit);
}

label {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .channel {
    grid-template-columns: 30px 1fr 60px;
  }
  
  .slider-v2 {
    grid-template-columns: 100px 1fr 70px;
  }
}
</style>