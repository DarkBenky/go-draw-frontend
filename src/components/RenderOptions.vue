<template>
  <div class="render-options">
    <h3>Render Options</h3>

    <button @click="SubmitRenderOptions" class="btn">
      Submit Render Options
    </button>

    <div class="options-grid">
      <!-- Main Parameters Section -->
      <div class="option-card">
        <h4>Main Parameters</h4>
        <div class="slider-group" v-for="param in exponentialParams" :key="param.name">
          <div class="slider-with-input">
            <label>{{ param.name }}</label>
            <div class="controls">
              <input type="range" v-model.number="param.value" :min="0" :max="10" step="1"
                @input="updateExponentialValue(param)" />
              <input type="number" v-model.number="param.actualValue" @input="updateSliderValue(param)"
                class="number-input" />
            </div>
          </div>
        </div>

        <h4>Field of View</h4>
        <div class="slider-with-input">
          <label>FOV</label>
          <div class="controls">
            <input type="range" v-model.number="FOV" min="30" max="120" step="1" />
            <input type="number" v-model.number="FOV" class="number-input" />
          </div>
        </div>

        <!-- Gamma Control -->
        <h4>Gamma</h4>
        <div class="slider-with-input">
          <label>Gamma</label>
          <div class="controls">
            <input type="range" v-model.number="gamma" min="0" max="1" step="0.001" />
            <input type="number" v-model.number="gamma" step="0.1" class="number-input" />
          </div>
        </div>
      </div>


      <!-- Render Settings Section -->
      <div class="option-card">
        <h4>Render Settings</h4>
        <div class="options-flex">
          <div class="select-group" v-for="option in binaryOptions" :key="option.name">
            <label>{{ option.name }}</label>
            <select v-model="option.value">
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>

          <div class="select-group">
            <label>Mode</label>
            <select v-model="selectedMode">
              <option v-for="mode in modes" :key="mode" :value="mode">
                {{ mode }}
              </option>
            </select>
          </div>

          <div class="select-group">
            <label>Resolution</label>
            <select v-model="resolution">
              <option v-for="res in resolutions" :key="res" :value="res">
                {{ res }}
              </option>
            </select>
          </div>

          <div class="select-group">
            <label>Version</label>
            <select v-model="renderVersion">
              <option v-for="version in renderVersions" :key="version" :value="version">
                {{ version }}
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { inject } from "vue";

export default {
  name: "RenderOptions",
  setup() {
    const apiAddress = inject("apiAddress");
    return { apiAddress };
  },

  data() {
    return {
      exponentialParams: [
        { name: "Depth", value: 3, actualValue: 8 },
        { name: "Scatter", value: 0, actualValue: 0 },
      ],
      binaryOptions: [
        { name: "Snap Light to Camera", value: "no" },
        { name: "Raymarching", value: "no" },
        { name: "Performance Mode", value: "no" },
      ],
      FOV: 90,
      resolution: "Native",
      resolutions: ["Native", "2x", "4x", "8x"],
      selectedMode: 'Classic',
      modes: ["Classic", "Normals", "Depth"],
      renderVersion: "V2",
      renderVersions: ["V1", "V2", "V2-Log", "V2-Linear", "V2-Linear-Texture", "V2-Log-Texture", "V4-Log", "V4-Linear", "V4-Log-Optim", "V4-Linear-Optim"],
      gamma: 0.25,
    };
  },
  methods: {
    updateExponentialValue(param) {
      // if (param.value <= 1 ) {
      //   param.actualValue = 0;
      // }
      // else {
        // param.value = param.value - 1;
        param.actualValue = Math.pow(2, param.value) - 1;
      // }
    },
    updateSliderValue(param) {
      param.value = Math.log2(param.actualValue);
    },
    SubmitRenderOptions() {
      console.log("Submitting render options...");
      const renderOptions = {
        depth: this.exponentialParams[0].actualValue,
        scatter: this.exponentialParams[1].actualValue,
        gamma: this.gamma,
        snapLight: this.binaryOptions[0].value,
        rayMarching: this.binaryOptions[1].value,
        performance: this.binaryOptions[2].value,
        resolution: this.resolution,
        version: this.renderVersion,
        mode: this.selectedMode,
        fov: this.FOV,
      };
      axios
        .post(`${this.apiAddress}/submitRenderOptions`, renderOptions)
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
.render-options {
  background: var(--bg-secondary);
  border-radius: var(--border-radius);
  padding: var(--spacing-unit);
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-unit);
}

.btn {
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

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(74, 158, 255, 0.2);
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--spacing-unit);
  overflow-y: auto;
}

.option-card {
  background: var(--bg-tertiary);
  padding: var(--spacing-unit);
  border-radius: var(--border-radius);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.slider-group,
.slider-with-input {
  margin-bottom: var(--spacing-unit);
}

.controls {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: calc(var(--spacing-unit) * 0.5);
  align-items: center;
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
  width: 80px;
  padding: 0.4rem;
  background: var(--bg-secondary);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  color: var(--text-primary);
  text-align: right;
  font-family: "JetBrains Mono", monospace;
}

.options-flex {
  display: grid;
  gap: var(--spacing-unit);
}

.select-group {
  display: grid;
  grid-template-columns: 1fr;
  gap: calc(var(--spacing-unit) * 0.5);
}

select {
  width: 100%;
  padding: 0.5rem;
  background: var(--bg-secondary);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  color: var(--text-primary);
  cursor: pointer;
}

select:hover {
  border-color: var(--accent-primary);
}

h3,
h4 {
  color: var(--text-primary);
  margin-bottom: var(--spacing-unit);
}

h4 {
  color: var(--accent-primary);
  font-size: 0.9rem;
}

label {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .options-grid {
    grid-template-columns: 1fr;
  }

  .select-group {
    grid-template-columns: 1fr 1fr;
    align-items: center;
  }
}
</style>
