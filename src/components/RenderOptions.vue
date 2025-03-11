<template>
  <div class="render-options">
    <h3>Render Options</h3>

    <div class="button-group">
      <button @click="SubmitRenderOptions" class="btn">
        Submit Render Options
      </button>

      <button @click="GetCameraPosition" class="btn">
        Get Camera Position
      </button>

      <button @click="GetRenderedImage" class="btn">Get Current Image</button>

      <button @click="toggleImageDisplay" class="btn toggle-btn">
        {{ showImage ? "Hide Image" : "Show Image" }}
      </button>

      <button @click="toggleCameraPosition" class="btn toggle-btn">
        {{ showCameraPosition ? "Hide Camera" : "Show Camera" }}
      </button>
    </div>

    <!-- Image display with conditional rendering -->
    <div v-if="showImage" class="image-container">
      <h4>Current Rendered Image</h4>
      <canvas
        ref="currentImageCanvas"
        width="800"
        height="600"
        class="render-canvas"
      ></canvas>
    </div>

    <!-- Camera Positions with conditional rendering -->
    <div v-if="showCameraPosition" class="camera-position-container">
      <div
        v-for="cameraPosition in cameraPositions"
        :key="cameraPosition"
        class="camera-position-card"
      >
        <div class="position-group">
          <div class="position-item">
            <span class="position-label">X:</span>
            <span class="position-value">{{
              cameraPosition.x.toFixed(2)
            }}</span>
          </div>
          <div class="position-item">
            <span class="position-label">Y:</span>
            <span class="position-value">{{
              cameraPosition.y.toFixed(2)
            }}</span>
          </div>
          <div class="position-item">
            <span class="position-label">Z:</span>
            <span class="position-value">{{
              cameraPosition.z.toFixed(2)
            }}</span>
          </div>
        </div>
        <div class="axis-group">
          <div class="position-item">
            <span class="position-label">X-Axis:</span>
            <span class="position-value">{{
              cameraPosition.cameraX.toFixed(2)
            }}</span>
          </div>
          <div class="position-item">
            <span class="position-label">Y-Axis:</span>
            <span class="position-value">{{
              cameraPosition.cameraY.toFixed(2)
            }}</span>
          </div>
        </div>
        <button @click="moveToPosition(cameraPosition)" class="btn">
          Move to Position
        </button>
      </div>
    </div>

    <div class="options-grid">
      <!-- Main Parameters Section -->
      <div class="option-card">
        <h4>Main Parameters</h4>
        <div
          class="slider-group"
          v-for="param in exponentialParams"
          :key="param.name"
        >
          <div class="slider-with-input">
            <label>{{ param.name }}</label>
            <div class="controls">
              <input
                type="range"
                v-model.number="param.value"
                :min="0"
                :max="10"
                step="1"
                @input="updateExponentialValue(param)"
              />
              <input
                type="number"
                v-model.number="param.actualValue"
                @input="updateSliderValue(param)"
                class="number-input"
              />
            </div>
          </div>
        </div>

        <!-- Sliders Section -->
        <h4>Lighting Parameters</h4>
        <div
          class="slider-with-input"
          v-for="slider in sliders"
          :key="slider.name"
        >
          <label>{{ slider.name }}</label>
          <div class="controls">
            <input
              v-if="slider.name == 'Light Intensity'"
              type="range"
              v-model="slider.value"
              min="0"
              max="32"
              step="0.1"
            />
            <input
              v-else
              type="range"
              v-model="slider.value"
              min="0"
              max="256"
              step="1"
            />
            <input type="number" v-model="slider.value" class="number-input" />
          </div>
        </div>

        <h4>Field of View</h4>
        <div class="slider-with-input">
          <label>FOV</label>
          <div class="controls">
            <input
              type="range"
              v-model.number="FOV"
              min="15"
              max="120"
              step="1"
            />
            <input type="number" v-model.number="FOV" class="number-input" />
          </div>
        </div>

        <!-- Gamma Control -->
        <h4>Gamma</h4>
        <div class="slider-with-input">
          <label>Gamma</label>
          <div class="controls">
            <input
              type="range"
              v-model.number="gamma"
              min="0"
              max="1"
              step="0.001"
            />
            <input
              type="number"
              v-model.number="gamma"
              step="0.1"
              class="number-input"
            />
          </div>
        </div>
      </div>

      <!-- Render Settings Section -->
      <div class="option-card">
        <h4>Render Settings</h4>
        <div class="options-flex">
          <div
            class="select-group"
            v-for="option in binaryOptions"
            :key="option.name"
          >
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
              <option
                v-for="version in renderVersions"
                :key="version"
                :value="version"
              >
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
      showImage: false,
      showCameraPosition: false,
      exponentialParams: [
        { name: "Depth", value: 1, actualValue: 1 },
        { name: "Scatter", value: 0, actualValue: 0 },
      ],
      binaryOptions: [
        { name: "Snap Light to Camera", value: "no" },
        { name: "Raymarching", value: "no" },
        { name: "Performance Mode", value: "no" },
      ],
      cameraPositions: [],
      FOV: 35,
      resolution: "2X",
      resolutions: ["Native", "2X", "4X", "8X"],
      selectedMode: "Classic",
      modes: ["Classic", "Normals", "Depth"],
      renderVersion: "V2M",
      renderVersions: [
        "V1",
        "V2",
        "V2M",
        "V2-Log",
        "V2-Linear",
        "V2-Linear-Texture",
        "V2-Log-Texture",
        "V4-Log",
        "V4-Linear",
        "V4-Log-Optim",
        "V4-Linear-Optim",
        "V4-Log-Optim-V2",
        "V4-Linear-Optim-V2"
      ],
      gamma: 0.25,
      sliders: [
        { name: "Light Intensity", value: 3 },
        { name: "R", value: 1 },
        { name: "G", value: 1 },
        { name: "B", value: 1 },
      ],
      currentImage: false,
    };
  },
  methods: {
    GetRenderedImage() {
      this.SubmitRenderOptions();
      this.UpdateImage();
      // wait for the image to be rendered
      setTimeout(() => {
        axios
          .get(`${this.apiAddress}/sendImage`, {
            responseType: "arraybuffer", // Request as binary data
          })
          .then((response) => {
            // Convert arraybuffer to blob
            const blob = new Blob([response.data], { type: "image/png" });

            // Create object URL from blob
            const imageUrl = URL.createObjectURL(blob);

            // Get canvas and context
            const canvas = this.$refs.currentImageCanvas;
            if (!canvas) {
              console.error("Canvas element not found");
              return;
            }

            const ctx = canvas.getContext("2d");

            // Load image with created URL
            const image = new Image();
            image.onload = () => {
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
              this.currentImage = true;

              // Clean up object URL after use
              URL.revokeObjectURL(imageUrl);
            };

            image.onerror = (err) => {
              console.error("Image failed to load:", err);
              URL.revokeObjectURL(imageUrl);
            };

            image.src = imageUrl;
          })
          .catch((error) => {
            console.error("API error:", error);
          });
      }, 1000);
    },

    UpdateImage() {
      axios
        .get(`${this.apiAddress}/getCurrentImage`)
        .then((response) => {
          console.log(response.data);
          this.cameraPositions.push(response.data);
        })
        .catch((error) => {
          console.error(error);
        });
    },

    moveToPosition(cameraPosition) {
      axios
        .post(`${this.apiAddress}/moveToPosition`, cameraPosition)
        .then((response) => {
          console.log(response.data);
        })
        .catch((error) => {
          console.error(error);
        });
    },

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
    GetCameraPosition() {
      axios
        .get(`${this.apiAddress}/getCameraPosition`)
        .then((response) => {
          console.log(response.data);
          this.cameraPositions.push(response.data);
        })
        .catch((error) => {
          console.error(error);
        });
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
        lightIntensity: Number(this.sliders[0].value),
        r: Number(this.sliders[1].value),
        g: Number(this.sliders[2].value),
        b: Number(this.sliders[3].value),
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
    toggleImageDisplay() {
      this.showImage = !this.showImage;
    },
    toggleCameraPosition() {
      this.showCameraPosition = !this.showCameraPosition;
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

/* Add these new styles */
.button-group {
  display: flex;
  gap: var(--spacing-unit);
  flex-wrap: wrap;
  margin-bottom: var(--spacing-unit);
}

.toggle-btn {
  background: var(--bg-tertiary);
  border: 1px solid var(--accent-primary);
}

.toggle-btn:hover {
  background: var(--accent-primary);
}

.camera-position-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-unit);
  margin-bottom: var(--spacing-unit);
  animation: slideDown 0.3s ease-out;
}

.camera-position-card {
  background: var(--bg-tertiary);
  border-radius: var(--border-radius);
  padding: var(--spacing-unit);
  border: 1px solid rgba(255, 255, 255, 0.05);
  display: grid;
  gap: var(--spacing-unit);
}

.position-group,
.axis-group {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: calc(var(--spacing-unit) * 0.5);
}

.position-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  background: var(--bg-secondary);
  border-radius: calc(var(--border-radius) * 0.5);
}

.position-label {
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-weight: 500;
}

.position-value {
  color: var(--accent-primary);
  font-family: "JetBrains Mono", monospace;
  font-size: 0.9rem;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.image-container {
  margin: 20px 0;
  padding: 15px;
  background-color: var(--bg-secondary);
  border-radius: var(--border-radius);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.render-canvas {
  display: block;
  margin: 10px auto;
  border: 2px solid var(--border-color);
  border-radius: var(--border-radius);
  background-color: #f0f0f0;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.toggle-btn {
  background-color: var(--accent-color);
  color: white;
  transition: all 0.3s ease;
}

.toggle-btn:hover {
  background-color: var(--accent-color-dark);
  transform: translateY(-2px);
}

/* ...existing styles... */
</style>
