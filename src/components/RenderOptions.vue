<template>
  <div class="render-options">
    <div class="header-section">
      <h3>Render Options</h3>

      <div class="controls-container">
        <!-- Main Actions -->
        <div class="button-panel">
          <button @click="SubmitRenderOptions" class="action-btn primary-btn">
            <span class="btn-icon"></span>
            <span>Submit</span>
          </button>

          <button @click="LockCamera" class="action-btn primary-btn">
            <span class="btn-icon"></span>
            <span v-if="lockedCamera">Unlock Camera</span>
            <span v-else>Lock Camera</span>
          </button>


          <button @click="GetRenderedImage" class="action-btn primary-btn">
            <span class="btn-icon"></span>
            <span>Get Image</span>
          </button>

          <button @click="toggleImageDisplay" class="action-btn toggle-btn">
            <span class="btn-icon"></span>
            <span>{{ showImage ? "Hide Image" : "Show Image" }}</span>
          </button>
          <button @click="downloadBVH" class="action-btn secondary-btn">
            <span>Download BVH</span>
          </button>
          <button @click="downloadBVHLean" class="action-btn secondary-btn">
            <span>Download Lean BVH</span>
          </button>
          <!-- Add these buttons to your button-panel after the download buttons -->
          <label class="action-btn secondary-btn upload-btn">
            <!-- <span class="btn-icon">📤</span> -->
            <span>Upload BVH</span>
            <input 
              type="file" 
              @change="uploadBVH" 
              accept=".json"
              ref="bvhFileInput"
              style="display: none"
            />
          </label>

          <!-- Upload BVH Lean Button -->
          <label class="action-btn secondary-btn upload-btn">
            <!-- <span class="btn-icon">📤</span> -->
            <span>Upload BVH Lean</span>
            <input 
              type="file" 
              @change="uploadBVHLean" 
              accept=".json"
              ref="bvhLeanFileInput"
              style="display: none"
            />
          </label>
        </div>

        <!-- Camera & Scene Controls -->
        <div class="button-panel">
          <button @click="GetCameraPosition" class="action-btn secondary-btn">
            <span class="btn-icon"></span>
            <span>Get Camera Position</span>
          </button>

          <button @click="toggleCameraPosition" class="action-btn toggle-btn">
            <span class="btn-icon"></span>
            <span>{{ showCameraPosition ? "Hide Cameras Positions" : "Show Camera Positions" }}</span>
          </button>

          <button @click="GetSpheres" class="action-btn secondary-btn">
            <span class="btn-icon"></span>
            <span>Load Spheres</span>
          </button>
        </div>
      </div>

      <!-- Frame Averaging Control -->
      <div class="frame-avg-control">
        <label>Frame Averaging:</label>
        <div class="slider-with-number">
          <input type="range" v-model.number="framesToAverage" min="1" max="32" step="1" />
          <input type="number" v-model.number="framesToAverage" min="1" max="32" step="1" class="frame-number-input" />
        </div>
      </div>
    </div>

    <!-- Image display with conditional rendering -->
    <div v-if="showImage" class="image-container">
      <h4>Current Rendered Image</h4>
      <canvas ref="currentImageCanvas" width="800" height="600" class="render-canvas"></canvas>
    </div>

    <!-- Camera Positions with conditional rendering -->
    <div v-if="showCameraPosition" class="camera-position-section">
      <div class="camera-controls-header">
        <h4>Camera Positions</h4>
        <div class="camera-control-buttons">
          <button @click="selectAllCameras" class="control-btn select-btn">
            <span>Select All</span>
          </button>
          <button @click="clearCameraSelection" class="control-btn clear-btn">
            <span>Clear Selected</span>
          </button>
        </div>
      </div>

      <div class="interpolation-controls">
        <button @click="moveCamera" class="control-btn interpolate-btn">
          <span>Interpolate Between Positions</span>
        </button>

        <button @click="savePositionsToDisk" class="control-btn save-btn">
          <span>Save Positions to Disk</span>
        </button>

        <button @click="stopAnimation" class="control-btn save-btn">
          <span>Stop Animation</span>
        </button>

        <button class="control-btn load-btn" @click="$refs.fileInput.click">
          <span class="btn-icon">📂</span>
          <span>Load Positions</span>
        </button>
        <input ref="fileInput" type="file" @change="loadPositionsFromDisk" accept=".json" style="display: none" />

        <div class="duration-control">
          <label>Duration (s):</label>
          <div class="duration-inputs">
            <input type="range" v-model.number="renderDuration" min="1" max="32" step="1" class="duration-slider" />
            <input type="number" v-model.number="renderDuration" min="1" max="32" step="1" class="duration-input" />
          </div>
        </div>
      </div>

      <div class="camera-positions-grid">
        <div v-for="(cameraPosition, index) in cameraPositions" :key="index" class="camera-card"
          :class="{ 'selected': isCameraSelected(cameraPosition) }">
          <div class="camera-card-header">
            <span class="camera-index">Camera #{{ index + 1 }}</span>
            <button @click="toggleCameraSelection(cameraPosition)" class="select-camera-btn"
              :class="{ 'selected': isCameraSelected(cameraPosition) }">
              {{ isCameraSelected(cameraPosition) ? '✓ Selected' : 'Select' }}
            </button>
          </div>

          <div class="camera-coordinates">
            <div class="coordinate-group">
              <span class="coordinate-label">Position:</span>
              <div class="coordinate-values">
                <span class="coordinate">X: {{ cameraPosition.x.toFixed(2) }}</span>
                <span class="coordinate">Y: {{ cameraPosition.y.toFixed(2) }}</span>
                <span class="coordinate">Z: {{ cameraPosition.z.toFixed(2) }}</span>
              </div>
            </div>
            <div class="coordinate-group">
              <span class="coordinate-label">Rotation:</span>
              <div class="coordinate-values">
                <span class="coordinate">X: {{ cameraPosition.cameraX.toFixed(2) }}</span>
                <span class="coordinate">Y: {{ cameraPosition.cameraY.toFixed(2) }}</span>
              </div>
            </div>
          </div>

          <div class="camera-actions">
            <button @click="moveToPosition(cameraPosition)" class="action-btn move-btn">
              <span class="btn-icon">📍</span>
              Move Here
            </button>
            <button @click="removeCameraPosition(index)" class="action-btn delete-btn">
              <span class="btn-icon">🗑️</span>
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>

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

        <!-- Sliders Section -->
        <h4>Lighting Parameters</h4>
        <div class="slider-with-input" v-for="slider in sliders" :key="slider.name">
          <label>{{ slider.name }}</label>
          <div class="controls">
            <input v-if="slider.name == 'Light Intensity'" type="range" v-model="slider.value" min="0" max="32"
              step="0.1" />
            <input v-else type="range" v-model="slider.value" min="0" max="256" step="1" />
            <input type="number" v-model="slider.value" class="number-input" />
          </div>
        </div>

        <h4>Field of View</h4>
        <div class="slider-with-input">
          <label>FOV</label>
          <div class="controls">
            <input type="range" v-model.number="FOV" min="15" max="120" step="1" />
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
            <select
              v-if="['V2-Log', 'V2-Linear', 'V2-Linear-Texture', 'V2-Log-Texture', 'V4-Log', 'V4-Linear'].includes(renderVersion)"
              v-model="selectedMode">
              <option v-for="mode in modes" :key="mode" :value="mode">
                {{ mode }}
              </option>
            </select>
            <label v-else>Normal and Depth mode are not available for this version</label>
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
          <div class="select-group">
            <label>RayMarching Rendering Version</label>
            <select v-model="RaymarchingVersion">
              <option v-for="version in RaymarchingVersions" :key="version" :value="version">
                {{ version }}
              </option>
            </select>
          </div>
          <div class="select-group">
            <label>Volume Rendering Version</label>
            <select v-model="VolumeRenderingVersion">
              <option v-for="version in VolumeRenderingVersions" :key="version" :value="version">
                {{ version }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <div v-if="spheres.length > 0" class="option-card sphere-editor">
        <h4>Spheres Editor</h4>
        <div class="sphere-list">
          <div v-for="(sphere, index) in spheres[0]" :key="index" class="sphere-item">
            <div class="sphere-header">
              <h5 class="sphere-title">Sphere {{ index }}</h5>
              <div class="sphere-color-preview"
                :style="{ backgroundColor: `rgb(${sphere.colorR || 0}, ${sphere.colorG || 0}, ${sphere.colorB || 0})` }">
              </div>
            </div>

            <!-- Position Controls with +/- buttons -->
            <div class="sphere-control-group">
              <div class="control-label">Position</div>
              <div class="position-controls">
                <div class="axis-control" v-for="axis in ['X', 'Y', 'Z']" :key="axis">
                  <label>{{ axis }}</label>
                  <div class="position-input-group">
                    <button @click="adjustPosition(sphere, `center${axis}`, -0.5, index)"
                      class="position-btn">−</button>
                    <input type="number" v-model.number="sphere[`center${axis}`]" step="0.1" class="position-input" />
                    <button @click="adjustPosition(sphere, `center${axis}`, 0.5, index)" class="position-btn">+</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Radius Control -->
            <div class="sphere-control-group">
              <div class="control-label">Radius</div>
              <div class="radius-input-group">
                <button @click="adjustPosition(sphere, 'radius', -1, index)" class="position-btn">−</button>
                <input type="number" v-model.number="sphere.radius" min="0.1" step="0.1" class="radius-input" />
                <button @click="adjustPosition(sphere, 'radius', 1, index)" class="position-btn">+</button>
              </div>
            </div>

            <!-- Amount Control -->
            <div class="sphere-control-group">
              <div class="control-label">Amount</div>
              <div class="position-input-group">
                <button @click="adjustPosition(sphere, 'amount', -1, index)" class="position-btn">−</button>
                <input type="number" v-model.number="sphere.amount" step="0.1" class="position-input" />
                <button @click="adjustPosition(sphere, 'amount', 1, index)" class="position-btn">+</button>
              </div>
            </div>

            <!-- Color Controls -->
            <div class="sphere-control-group">
              <div class="control-label">Color</div>
              <div class="color-controls">
                <div class="color-slider" v-for="colorName in ['R', 'G', 'B', 'A']" :key="colorName">
                  <span class="color-label">{{ colorName }}</span>
                  <div class="color-input-group">
                    <input type="range" v-model.number="sphere[`color${colorName}`]" min="0" max="255" step="1"
                      class="color-range" />
                    <input type="number" v-model.number="sphere[`color${colorName}`]" min="0" max="255"
                      class="color-value" />
                  </div>
                </div>
              </div>
            </div>

            <!-- SDF Type Controls -->
            <div class="sphere-control-group" v-if="'sdfType' in sphere">
              <div class="control-label">SDF Type</div>
              <select v-model.number="sphere.sdfType" class="sdf-select">
                <option v-for="(value, name) in types" :key="name" :value="value">
                  {{ name }}
                </option>
              </select>
            </div>

            <!-- Other Sphere Index -->
            <div class="sphere-control-group" v-if="'indexOfOtherSphere' && sphere.sdfType != 'distance' in sphere">
              <div class="control-label">Related Sphere</div>
              <select v-model.number="sphere.indexOfOtherSphere" class="sdf-select">
                <option v-for="i in spheres[0].length" :key="i - 1" :value="i - 1">
                  Sphere {{ i - 1 }}
                </option>
              </select>
            </div>

            <button @click="updateSphere(index)" class="update-sphere-btn">Update Sphere</button>
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
      renderDuration: 10,
      framesToAverage: 3,
      showImage: false,
      showCameraPosition: false,
      exponentialParams: [
        { name: "Depth", value: 1, actualValue: 1 },
        { name: "Scatter", value: 0, actualValue: 0 },
      ],
      binaryOptions: [
        { name: 'Paint Texture', value: "no" },
        { name: "Snap Light to Camera", value: "no" },
        { name: "Raymarching", value: "no" },
        { name: "Performance Mode", value: "no" },
      ],
      cameraPositions: [],
      selectedCameraPosition: [],
      selectedCameraPositions: [], // Array to hold selected camera positions
      FOV: 35,
      resolution: "2X",
      resolutions: ["Native", "2X", "4X", "8X"],
      selectedMode: "Classic",
      modes: ["Classic", "Normals"],
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
        "V4-Linear-Optim-V2",
        "V4-Optim-V2"
      ],
      RaymarchingVersions: ["V1", "V2"],
      VolumeRenderingVersion: "V1",
      VolumeRenderingVersions: ["V1", "V2"],
      RaymarchingVersion: "V2",
      gamma: 0.25,
      sliders: [
        { name: "Light Intensity", value: 5 },
        { name: "R", value: 1 },
        { name: "G", value: 1 },
        { name: "B", value: 1 },
      ],
      currentImage: false,
      spheres: [],
      types: {},
      lockedCamera : false,
      remainingTime : 0,
      remainingImages : 0,
    };
  },
  methods: {
    stopAnimation() {
      axios
        .get(`${this.apiAddress}/stopAnimation`)
        .then((response) => {
          console.log(response.data);
        })
        .catch((error) => {
          console.error(error);
        });
    },
    LockCamera() {
      this.lockedCamera = !this.lockedCamera;
      axios
        .post(`${this.apiAddress}/lockCamera`, {lockedCamera : this.lockedCamera})
        .then((response) => {
          console.log(response.data);
        })
        .catch((error) => {
          console.error(error);
        });
    },
    moveCamera() {
      const response = {
        positions: this.selectedCameraPositions,
        timeDuration: this.renderDuration
      }
      axios
        .post(`${this.apiAddress}/moveCamera`, response)
        .then((response) => {
          console.log(response.data);
        })
        .catch((error) => {
          console.error(error);
        });
    },
    savePositionsToDisk() {
      if (!this.cameraPositions.length) {
        alert('No camera positions to save');
        return;
      }

      try {
        // Format positions for saving
        const positions = this.cameraPositions.map(pos => ({
          x: pos.x,
          y: pos.y,
          z: pos.z,
          cameraX: pos.cameraX,
          cameraY: pos.cameraY,
        }));

        const blob = new Blob([JSON.stringify(positions, null, 2)], {
          type: "application/json"
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `camera_positions_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

      } catch (error) {
        console.error('Error saving positions:', error);
        alert('Error saving camera positions');
      }
    },
    loadPositionsFromDisk(event) {
      const file = event.target.files?.[0];
      if (!file) {
        console.error('No file selected');
        return;
      }

      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const positions = JSON.parse(e.target.result);
          if (!Array.isArray(positions)) {
            throw new Error('Invalid file format: expected array of positions');
          }

          this.cameraPositions = positions.map(pos => ({
            x: Number(pos.x) || 0,
            y: Number(pos.y) || 0,
            z: Number(pos.z) || 0,
            cameraX: Number(pos.cameraX) || 0,
            cameraY: Number(pos.cameraY) || 0
          }));

          // Clear any previous selections
          this.selectedCameraPositions = [];
          
          // Reset the file input value
          event.target.value = '';

        } catch (error) {
          console.error('Error loading camera positions:', error);
          alert('Error loading camera positions file. Please check the file format.');
        }
      };

      reader.onerror = (error) => {
        console.error('Error reading file:', error);
        alert('Error reading file');
        // Reset the file input value on error too
        event.target.value = '';
      };

      reader.readAsText(file);
    },
    updateSphere(index) {
      let sphere = this.spheres[0][index];
      sphere.index = index;
      axios
        .post(`${this.apiAddress}/updateSphere`, sphere)
        .then((response) => {
          console.log(response.data);
        })
        .catch((error) => {
          console.error(error);
        });
    },

    GetSpheres() {
      axios
        .get(`${this.apiAddress}/getSpheres`)
        .then((response) => {
          console.log(response.data);
          this.spheres = [];
          this.spheres.push(response.data);
        })
        .catch((error) => {
          console.error(error);
        });
      axios
        .get(`${this.apiAddress}/getTypes`)
        .then((response) => {
          console.log(response.data);
          this.types = response.data;
        })
        .catch((error) => {
          console.error(error);
        });
    },
    getRemainingTime() {
      console.log("getting remaining Time")
      axios.get(`${this.apiAddress}/getRemainingTime`)
        .then((response) => {
          console.log(response.data);
          this.remainingImages = response.data.remainingFrames;
          this.remainingTime = response.data.remainingTime * 0.75 + this.remainingTime * 0.25;
          
        })
        .catch((error) => {
          console.error(error);
        });
    },

    GetRenderedImage() {
      this.SubmitRenderOptions();

      // Show loading indicator
      const canvas = this.$refs.currentImageCanvas;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = '#333';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#fff';
        ctx.font = '20px Arial';
        ctx.fillText('Rendering...', canvas.width / 2 - 60, canvas.height / 2);
      }

      // Start periodic status checks
      this.statusInterval = setInterval(() => {
        this.getRemainingTime();
        
        // Update the canvas with status information
        if (canvas) {
          const ctx = canvas.getContext("2d");
          
          // Draw background
          ctx.fillStyle = '#333';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // Draw rendering status
          ctx.fillStyle = '#fff';
          ctx.font = '20px Arial';
          ctx.fillText('Rendering...', canvas.width / 2 - 60, canvas.height / 2 - 30);
          
          // Draw remaining time info
          ctx.font = '16px Arial';
          ctx.fillText(`Remaining Frames: ${this.remainingImages.toFixed(2)}`, canvas.width / 2 - 80, canvas.height / 2 + 10);
          ctx.fillText(`Estimated Time: ${this.remainingTime.toFixed(2)} seconds`, canvas.width / 2 - 100, canvas.height / 2 + 40);
        }
      }, 500); // Check every 0.5 seconds

      setTimeout(() => {
        axios
          .get(`${this.apiAddress}/getCurrentImage`, {
            params: {
              frames: this.framesToAverage,
            },
            responseType: 'arraybuffer'  // This is critical for binary data
          })
          .then((response) => {
            // Stop periodic status checks
            clearInterval(this.statusInterval);
            
            // Convert arraybuffer to blob
            const blob = new Blob([response.data], { type: "image/png" });

            // Create object URL from blob
            const imageUrl = URL.createObjectURL(blob);

            // Get canvas and context
            if (!canvas) {
              console.error("Canvas element not found");
              return;
            }

            const ctx = canvas.getContext("2d");
            ctx.imageSmoothingEnabled = false;
            ctx.mozImageSmoothingEnabled = false;
            ctx.webkitImageSmoothingEnabled = false;
            ctx.msImageSmoothingEnabled = false;

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

              // Show error message on canvas
              ctx.fillStyle = '#333';
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              ctx.fillStyle = '#ff5555';
              ctx.font = '16px Arial';
              ctx.fillText('Error loading image', canvas.width / 2 - 70, canvas.height / 2);
            };

            image.src = imageUrl;
          })
          .catch((error) => {
            // Stop periodic status checks
            clearInterval(this.statusInterval);
            
            console.error("API error:", error);

            // Show error message on canvas
            if (canvas) {
              const ctx = canvas.getContext("2d");
              ctx.fillStyle = '#333';
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              ctx.fillStyle = '#ff5555';
              ctx.font = '16px Arial';
              ctx.fillText(`API Error: ${error.message}`, canvas.width / 2 - 100, canvas.height / 2);
            }
          });
      }, 1000);
    },

    // UpdateImage() {
    //   axios
    //     .get(`${this.apiAddress}/getCurrentImage`)
    //     .then((response) => {
    //       console.log(response.data);
    //     })
    //     .catch((error) => {
    //       console.error(error);
    //     });
    // },

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
      console.log("Submitting render options...", this.binaryOptions);
      const renderOptions = {
        depth: this.exponentialParams[0].actualValue,
        scatter: this.exponentialParams[1].actualValue,
        gamma: this.gamma,
        snapLight: this.binaryOptions[1].value,
        rayMarching: this.binaryOptions[2].value,
        performance: this.binaryOptions[3].value,
        resolution: this.resolution,
        version: this.renderVersion,
        mode: this.selectedMode,
        fov: this.FOV,
        lightIntensity: Number(this.sliders[0].value),
        r: Number(this.sliders[1].value),
        g: Number(this.sliders[2].value),
        b: Number(this.sliders[3].value),
        paintTexture: this.binaryOptions[0].value,
        rayMarchingVersion: this.RaymarchingVersion,
        volumeRenderingVersion: this.VolumeRenderingVersion,
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
    adjustPosition(sphere, property, amount, index) {
      sphere[property] += amount;
      this.updateSphere(index);
    },
    // Toggle camera selection
    toggleCameraSelection(cameraPosition) {
      const index = this.selectedCameraPositions.findIndex(
        pos => this.isSamePosition(pos, cameraPosition)
      );

      if (index === -1) {
        // Add to selection
        this.selectedCameraPositions.push(cameraPosition);
      } else {
        // Remove from selection
        this.selectedCameraPositions.splice(index, 1);
      }
    },

    // Check if a camera is currently selected
    isCameraSelected(cameraPosition) {
      return this.selectedCameraPositions.some(
        pos => this.isSamePosition(pos, cameraPosition)
      );
    },

    // Helper to compare camera positions
    isSamePosition(pos1, pos2) {
      return (
        pos1.x === pos2.x &&
        pos1.y === pos2.y &&
        pos1.z === pos2.z &&
        pos1.cameraX === pos2.cameraX &&
        pos1.cameraY === pos2.cameraY
      );
    },

    // Select all cameras
    selectAllCameras() {
      this.selectedCameraPositions = [...this.cameraPositions];
    },

    // Clear camera selection
    clearCameraSelection() {
      this.selectedCameraPositions = [];
    },

    // Remove camera position from the list
    removeCameraPosition(index) {
      // Remove from selection if it's there
      const removed = this.cameraPositions[index];
      const selIndex = this.selectedCameraPositions.findIndex(
        pos => this.isSamePosition(pos, removed)
      );

      if (selIndex !== -1) {
        this.selectedCameraPositions.splice(selIndex, 1);
      }

      // Remove from main list
      this.cameraPositions.splice(index, 1);
    },

    // Move to all selected positions in sequence
    moveToSelectedPositions() {
      if (this.selectedCameraPositions.length === 0) return;

      // Implementation options:
      // 1. Move to first selected position
      this.moveToPosition(this.selectedCameraPositions[0]);

      // OR 2. Move through all positions with some delay
      // this.moveToMultiplePositions(0);
    },

    // Optional: move through multiple positions in sequence
    moveToMultiplePositions(index) {
      if (index >= this.selectedCameraPositions.length) return;

      this.moveToPosition(this.selectedCameraPositions[index]);

      setTimeout(() => {
        this.moveToMultiplePositions(index + 1);
      }, 1000); // 1 second delay between moves
    },
    downloadBVH() {
      axios({
        url: `${this.apiAddress}/getCurrentBVH`,
        method: 'GET',
        responseType: 'blob'
      })
        .then((response) => {
          // Create blob link to download
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          
          // Create filename with timestamp
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          link.setAttribute('download', `bvh_${timestamp}.json`);
          
          // Append link, trigger download, and cleanup
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        })
        .catch((error) => {
          console.error('Error downloading BVH:', error);
          alert('Error downloading BVH file. Please try again.');
        });
    },
    downloadBVHLean() {
      axios({
        url: `${this.apiAddress}/getCurrentBVHLean`,
        method: 'GET',
        responseType: 'blob'
      })
        .then((response) => {
          // Create blob link to download
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          
          // Create filename with timestamp
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          link.setAttribute('download', `bvh_lean_${timestamp}.json`);
          
          // Append link, trigger download, and cleanup
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        })
        .catch((error) => {
          console.error('Error downloading Lean BVH:', error);
          alert('Error downloading Lean BVH file. Please try again.');
        });
    },
    uploadBVH(event) {
      const file = event.target.files?.[0];
      if (!file) return;
  
      const formData = new FormData();
      formData.append('bvhFile', file);
  
      axios.post(`${this.apiAddress}/submitBVH`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      .then(response => {
        console.log('BVH uploaded successfully:', response.data);
        // Show success message
        alert('BVH uploaded successfully');
      })
      .catch(error => {
        console.error('Error uploading BVH:', error);
        // Show error message
        alert('Error uploading BVH: ' + (error.response?.data?.error || error.message));
      })
      .finally(() => {
        // Reset file input
        event.target.value = '';
      });
    },
  
    uploadBVHLean(event) {
      const file = event.target.files?.[0];
      if (!file) return;
  
      const formData = new FormData();
      formData.append('bvhFile', file);
  
      axios.post(`${this.apiAddress}/submitBVHLean`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      .then(response => {
        console.log('BVH Lean uploaded successfully:', response.data);
        // Show success message
        alert('BVH Lean uploaded successfully');
      })
      .catch(error => {
        console.error('Error uploading BVH Lean:', error);
        // Show error message
        alert('Error uploading BVH Lean: ' + (error.response?.data?.error || error.message));
      })
      .finally(() => {
        // Reset file input
        event.target.value = '';
      });
    }
  }
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
  flex-direction: row;
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

/* Add these styles to your existing <style> block */
.sphere-editor {
  max-height: 70vh;
  overflow-y: auto;
}

.sphere-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-unit);
}

.sphere-item {
  background: var(--bg-secondary);
  border-radius: var(--border-radius);
  padding: var(--spacing-unit);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.2s ease;
}

.sphere-item:hover {
  border-color: var(--accent-primary);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.sphere-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-unit);
}

.sphere-title {
  font-size: 1rem;
  color: var (--accent-primary);
  margin: 0;
}

.sphere-color-preview {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.sphere-control-group {
  margin-bottom: var(--spacing-unit);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  padding-bottom: var(--spacing-unit);
}

.sphere-control-group:last-of-type {
  border-bottom: none;
}

.control-label {
  font-weight: 500;
  margin-bottom: 8px;
  color: var (--text-secondary);
}

.position-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.axis-control {
  flex: 1;
  min-width: 120px;
}

.color-controls {
  display: grid;
  gap: 8px;
}

.color-slider {
  display: grid;
  grid-template-columns: 20px 1fr;
  gap: 10px;
  align-items: center;
}

.sdf-select {
  width: 100%;
  padding: 8px;
  background: var(--bg-tertiary);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  color: var(--text-primary);
}

.sdf-select:focus {
  border-color: var(--accent-primary);
  outline: none;
}

.update-sphere-btn {
  width: 100%;
  background: linear-gradient(135deg, var(--accent-primary), #3a8eef);
  color: white;
  border: none;
  padding: 10px;
  border-radius: var(--border-radius);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.update-sphere-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(74, 158, 255, 0.2);
}

.position-input-group {
  display: flex;
  align-items: center;
  gap: 4px;
}

.position-btn {
  background: var(--bg-tertiary);
  border: 1px solid var(--accent-primary);
  color: var(--accent-primary);
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.position-btn:hover {
  background: var(--accent-primary);
  color: white;
}

.position-input {
  width: 60px;
  padding: 4px;
  background: var(--bg-secondary);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  color: var(--text-primary);
  text-align: right;
  font-family: "JetBrains Mono", monospace;
}

.radius-input-group {
  display: flex;
  align-items: center;
  gap: 4px;
}

.radius-input {
  width: 60px;
  padding: 4px;
  background: var(--bg-secondary);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  color: var(--text-primary);
  text-align: right;
  font-family: "JetBrains Mono", monospace;
}

.color-input-group {
  display: flex;
  align-items: center;
  gap: 4px;
}

.color-range {
  flex: 1;
}

.color-value {
  width: 60px;
  padding: 4px;
  background: var (--bg-secondary);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  color: var(--text-primary);
  text-align: right;
  font-family: "JetBrains Mono", monospace;
}

.color-label {
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-weight: 500;
}

/* Add these styles to the top of your existing <style> section */

.header-section {
  background: var(--bg-tertiary);
  border-radius: var(--border-radius);
  padding: var(--spacing-unit);
  margin-bottom: var(--spacing-unit);
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.controls-container {
  display: flex;
  flex-wrap: wrap;
  gap: calc(var(--spacing-unit) * 0.8);
  margin: var(--spacing-unit) 0;
}

.button-panel {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  background: var(--bg-secondary);
  padding: 8px;
  border-radius: calc(var(--border-radius) * 0.7);
  flex: 1;
  min-width: 280px;
}

.action-btn {
  padding: 8px 12px;
  border-radius: calc(var(--border-radius) * 0.7);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  justify-content: center;
  min-width: 90px;
  border: none;
  font-size: 0.9rem;
}

.primary-btn {
  background: linear-gradient(135deg, var(--accent-primary), #3a8eef);
  color: white;
}

.secondary-btn {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.toggle-btn {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--accent-primary);
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.primary-btn:hover {
  background: linear-gradient(135deg, #3a8eef, var(--accent-primary));
}

.secondary-btn:hover,
.toggle-btn:hover {
  background: var(--accent-primary);
  color: white;
}

.btn-icon {
  font-size: 1.1rem;
}

.frame-avg-control {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 12px;
  align-items: center;
  background: var(--bg-secondary);
  padding: 10px;
  border-radius: calc(var(--border-radius) * 0.7);
  margin-top: 12px;
}

.slider-with-number {
  display: flex;
  align-items: center;
  gap: 12px;
}

.frame-number-input {
  width: 50px;
  padding: 4px;
  background: var(--bg-tertiary);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  color: var(--text-primary);
  text-align: center;
  font-family: "JetBrains Mono", monospace;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .controls-container {
    flex-direction: column;
  }

  .button-panel {
    width: 100%;
  }

  .frame-avg-control {
    grid-template-columns: 1fr;
  }
}

/* Add these styles to your <style> section */
.camera-position-section {
  background: var(--bg-tertiary);
  border-radius: var(--border-radius);
  padding: var(--spacing-unit);
  margin: var(--spacing-unit) 0;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.camera-controls-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.camera-control-buttons {
  display: flex;
  gap: 8px;
}

.control-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.select-btn {
  background: var(--accent-primary);
  color: white;
}

.clear-btn {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.interpolate-btn {
  background: linear-gradient(135deg, var(--accent-primary), #3a8eef);
  color: white;
  border: none;
  width: 100%;
  justify-content: center;
  margin-bottom: 1rem;
}

.duration-control {
  background: var(--bg-secondary);
  padding: 12px;
  border-radius: var(--border-radius);
  margin-bottom: 1rem;
}

.duration-inputs {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 12px;
  align-items: center;
  margin-top: 8px;
}

.duration-slider {
  height: 4px;
  background: linear-gradient(90deg, var(--accent-primary), #3a8eef);
  border-radius: 2px;
  appearance: none;
}

.duration-input {
  width: 60px;
  padding: 4px 8px;
  background: var(--bg-tertiary);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  color: var(--text-primary);
  text-align: center;
  font-family: "JetBrains Mono", monospace;
}

.camera-positions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.camera-card {
  background: var (--bg-secondary);
  border-radius: var(--border-radius);
  padding: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.2s ease;
}

.camera-card.selected {
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 1px var(--accent-primary);
}

.camera-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.camera-index {
  font-weight: 600;
  color: var (--accent-primary);
}

.select-camera-btn {
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid var(--accent-primary);
  background: transparent;
  color: var(--accent-primary);
}

.select-camera-btn.selected {
  background: var(--accent-primary);
  color: white;
}

.camera-coordinates {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 1rem;
}

.coordinate-group {
  background: var(--bg-tertiary);
  padding: 8px;
  border-radius: 6px;
}

.coordinate-label {
  display: block;
  color: var(--text-secondary);
  font-size: 0.8rem;
  margin-bottom: 4px;
}

.coordinate-values {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.coordinate {
  background: var(--bg-secondary);
  padding: 4px 8px;
  border-radius: 4px;
  font-family: "JetBrains Mono", monospace;
  font-size: 0.9rem;
  color: var(--accent-primary);
}

.camera-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  flex: 1;
  padding: 8px;
  border-radius: 6px;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.move-btn {
  background: var(--accent-primary);
  color: white;
  border: none;
}

.delete-btn {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.delete-btn:hover {
  background: rgb(220, 53, 69);
  color: white;
  border-color: transparent;
}

.btn-icon {
  font-size: 1.1rem;
}

@media (max-width: 768px) {
  .camera-controls-header {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .camera-control-buttons {
    flex-direction: column;
  }

  .camera-positions-grid {
    grid-template-columns: 1fr;
  }
}
</style>
