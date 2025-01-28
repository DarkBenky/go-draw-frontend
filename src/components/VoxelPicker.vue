<template>
    <div class="color-picker">
      <h2>Volume Picker</h2>
  
      <button @click="submitVolumeColors">Submit Volume Colors</button>
  
      <!-- Randomness Select -->
      <div class="randomness-select">
        <label>Color Randomness:</label>
        <select v-model="colorRandomness">
          <option value="none">None</option>
          <option value="random">Random</option>
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
              @input="applyRandomness(channel)"
            />
            <input
              type="number"
              v-model.number="channel.value"
              min="0"
              max="255"
              class="number-input"
              @input="applyRandomness(channel)"
            />
            <label>Mul:</label>
            <input
              type="range"
              v-model.number="channel.multiplier"
              min="1"
              max="10"
              step="0.1"
              @input="applyRandomness(channel)"
            />
            <input
              type="number"
              v-model.number="channel.multiplier"
              min="1"
              max="10"
              step="0.1"
              class="number-input"
              @input="applyRandomness(channel)"
            />
          </div>
        </div>
        <div class="color-preview" :style="{ backgroundColor: voxelPreviewColor }"></div>
      </div>
  
      <!-- Smoke Color Section -->
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
            max="1"
            step="0.00001"
          />
          <input
            type="number"
            v-model.number="density"
            min="0"
            max="1"
            step="0.01"
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
        density: 0.5,
        transmittance: 0.5,
        randomnessScale: 50,
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
          voxelColor: voxel,
          smokeColor: smoke,
          density: this.density,
          transmittance: this.transmittance,
          randomness: this.colorRandomness === "random" ? this.randomnessScale : 0,
        };
        axios
          .post(`${this.apiAddress}/volume-colors`, payload)
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
  .btn {
    background: #4a9eff;
    border: none;
    padding: 0.3rem 0.6rem;
    border-radius: 4px;
    color: white;
    cursor: pointer;
    margin-bottom: 15px;
}

button {
    background: #4a9eff;
    border: none;
    padding: 0.3rem 0.6rem;
    border-radius: 4px;
    color: white;
    cursor: pointer;
}

button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
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
  
  .color-section {
    margin-bottom: 2rem;
  }
  
  h2, h3 {
    color: #ffffff;
    font-weight: 600;
    margin-bottom: 1.5rem;
    font-size: 1.2rem;
    letter-spacing: -0.02em;
  }
  
  button {
    background: linear-gradient(135deg, #4a9eff, #3a8eef);
    color: white;
    border: none;
    padding: 0.8rem 1.5rem;
    border-radius: 8px;
    font-weight: 600;
    font-size: 0.95rem;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-bottom: 1.5rem;
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
  }
  
  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
  
  .randomness-select {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
    background: rgba(42, 42, 42, 0.6);
    padding: 1rem;
    border-radius: 8px;
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.05);
  }
  
  .randomness-select select {
    background: #2a2a2a;
    border: 1px solid #3a3a3a;
    padding: 0.5rem;
    color: #e1e1e1;
    border-radius: 4px;
    cursor: pointer;
    transition: border-color 0.2s ease;
  }
  
  .randomness-select select:hover {
    border-color: #4a9eff;
  }
  
  .channel-inputs {
    background: rgba(42, 42, 42, 0.6);
    padding: 1.5rem;
    border-radius: 12px;
    margin-bottom: 1rem;
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.05);
  }
  
  .channel {
    display: grid;
    grid-template-columns: 80px 1fr 60px 80px 1fr 60px;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 8px;
    margin-bottom: 0.75rem;
    transition: background-color 0.2s ease;
  }
  
  .channel:hover {
    background: rgba(0, 0, 0, 0.3);
  }
  
  .color-preview {
    width: 100%;
    height: 80px;
    border-radius: 12px;
    margin-top: 1rem;
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
    transform: scale(1.02) translateY(-2px);
    box-shadow: 0 12px 48px rgba(0, 0, 0, 0.2);
  }
  
  .volume-properties {
    background: rgba(42, 42, 42, 0.6);
    padding: 1.5rem;
    border-radius: 12px;
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.05);
  }
  
  .slider-v2 {
    display: grid;
    grid-template-columns: 120px 1fr 80px;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
    padding: 0.75rem;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 8px;
  }
  
  input[type="range"] {
    height: 4px;
    border-radius: 4px;
    background: linear-gradient(90deg, #2a2a2a, #3a3a3a);
    appearance: none;
    cursor: pointer;
  }
  
  input[type="range"]::-webkit-slider-thumb {
    appearance: none;
    width: 16px;
    height: 16px;
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
  
  .number-input {
    width: 60px;
    background: #2a2a2a;
    border: 1px solid #3a3a3a;
    border-radius: 4px;
    color: #e1e1e1;
    padding: 0.4rem;
    text-align: right;
    font-family: 'JetBrains Mono', monospace;
    transition: border-color 0.2s ease;
  }
  
  .number-input:focus {
    border-color: #4a9eff;
    outline: none;
  }
  
  label {
    font-size: 0.9rem;
    color: #a1a1a1;
    font-weight: 500;
  }

  .randomness-control {
    background: rgba(42, 42, 42, 0.6);
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 1.5rem;
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.05);
  }
  
  .randomness-control label {
    display: block;
    margin-bottom: 0.5rem;
  }
  
  .randomness-control .slider-v2 {
    display: grid;
    grid-template-columns: 1fr 80px;
    gap: 1rem;
    align-items: center;
  }
  </style>