<template>
    <div class="render-options">
        <h3>Render Options</h3>

        <button @click="SubmitRenderOptions" class="btn">Submit Render Options</button>

        <div class="options-grid">
            <!-- Main Parameters Section -->
            <div class="option-card">
                <h4>Main Parameters</h4>
                <div class="slider-group" v-for="param in exponentialParams" :key="param.name">
                    <div class="slider-with-input">
                        <label>{{ param.name }}</label>
                        <div class="controls">
                            <input type="range" v-model.number="param.value" :min="0" :max="6" step="1"
                                @input="updateExponentialValue(param)" />
                            <input type="number" v-model.number="param.actualValue" @input="updateSliderValue(param)"
                                class="number-input" />
                        </div>
                    </div>
                </div>

                <!-- Gamma Control -->
                <div class="slider-with-input">
                    <label>Gamma</label>
                    <div class="controls">
                        <input type="range" v-model.number="gamma" min="0" max="10" step="0.1" />
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

import axios from 'axios';
import { inject } from 'vue';

export default {
    name: 'RenderOptions',
    setup() {
        const apiAddress = inject('apiAddress')
        return { apiAddress }
    },

    data() {
        return {
            exponentialParams: [
                { name: 'Depth', value: 3, actualValue: 8 },
                { name: 'Scatter', value: 3, actualValue: 8 }
            ],
            binaryOptions: [
                { name: 'Snap Light to Camera', value: 'no' },
                { name: 'Raymarching', value: 'no' },
                { name: 'Performance Mode', value: 'no' }
            ],
            resolution: 'Native',
            resolutions: ['Native', '2x', '4x', '8x'],
            renderVersion: 'V2',
            renderVersions: ['V1', 'V2', 'V2-Log', 'V2-Linear'],
            gamma: 2.2
        }
    },
    methods: {
        updateExponentialValue(param) {
            param.actualValue = Math.pow(2, param.value)
        },
        updateSliderValue(param) {
            param.value = Math.log2(param.actualValue)
        },
        SubmitRenderOptions() {
            console.log('Submitting render options...')
            const renderOptions = {
                Depth: this.exponentialParams[0].actualValue,
                Scatter: this.exponentialParams[1].actualValue,
                Gamma: this.gamma,
                SnapLightToCamera: this.binaryOptions[0].value,
                Raymarching: this.binaryOptions[1].value,
                PerformanceMode: this.binaryOptions[2].value,
                Resolution: this.resolution,
                Version: this.renderVersion
            }
            axios.post(`${this.apiAddress}/render-options`, renderOptions)
                .then(response => {
                    console.log(response.data)
                })
        }
    }
}
</script>

<style scoped>

.color-picker, .render-options {
  background: #1a1a1a;
  border-radius: 12px;
  color: #e1e1e1;
  padding: 1rem;
  max-width: 900px;
  margin: 1rem auto;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}

/* Headings */
.color-picker h2, .render-options h3 {
  color: #ffffff;
  margin: 1rem 0;
  font-weight: 600;
  font-size: 1.2rem;
}

/* Cards and sections */
.option-card,
.channel-inputs,
.sliders {
  background: #2a2a2a;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

/* Labels */
label {
  font-size: 0.9rem;
  color: #a1a1a1;
}

/* Buttons */
button,
.btn {
  background: linear-gradient(135deg, #4a9eff, #3a8eef);
  color: #fff;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 3px 10px rgba(74, 158, 255, 0.2);
}
button:hover,
.btn:hover {
  background: linear-gradient(135deg, #5db1ff, #4a9eff);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(74, 158, 255, 0.3);
}
button:active,
.btn:active {
  transform: translateY(0);
  box-shadow: 0 3px 10px rgba(74, 158, 255, 0.2);
}

/* Sliders */
input[type="range"] {
  width: 100%;
  height: 4px;
  border-radius: 4px;
  background: #3a3a3a;
  appearance: none;
  margin: 0;
  cursor: pointer;
}
input[type="range"]::-webkit-slider-thumb {
  appearance: none;
  width: 14px;
  height: 14px;
  background: #4a9eff;
  border-radius: 50%;
  transition: transform 0.15s ease;
}
input[type="range"]::-webkit-slider-thumb:hover {
  transform: scale(1.2);
}

/* Numeric input */
.number-input {
  width: 80px;
  padding: 0.3rem;
  font-size: 0.9rem;
  text-align: right;
  border: 1px solid #3a3a3a;
  border-radius: 4px;
  background: #2a2a2a;
  color: #e1e1e1;
  font-family: 'JetBrains Mono', monospace;
}

/* Selects */
select {
  width: 100%;
  padding: 0.4rem;
  border: 1px solid #3a3a3a;
  border-radius: 4px;
  background: #2a2a2a;
  color: #e1e1e1;
  cursor: pointer;
  font-size: 0.9rem;
}
select:hover {
  border-color: #4a9eff;
}

/* Responsive grid tweaks */
.options-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
}
.options-flex {
  display: grid;
  gap: 1rem;
}

/* Adjusted scrollbar */
::-webkit-scrollbar {
  width: 5px;
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