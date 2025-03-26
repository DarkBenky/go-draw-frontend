<template>
    <div class="shader-menu">
        <h3>Shader Menu</h3>

        <!-- Submit Button -->
        <button @click="SubmitShaderMenu" class="btn">Submit Shader Menu</button>

        <!-- Add Shader Dropdown -->
        <div class="add-shader">
            <select v-model="selectedType">
                <option v-for="(_, type) in shaderTypes" :key="type" :value="type">
                    {{ type.charAt(0).toUpperCase() + type.slice(1) }}
                </option>
            </select>
            <button @click="addShader">Add Shader</button>
        </div>

        <!-- Shader List -->
        <ul class="shader-list">
            <li v-for="(shader, index) in shaders" :key="shader.id"
                :class="{ selected: selectedShader?.id === shader.id }" @click="selectShader(shader)">
                <div class="shader-item">
                    <span class="shader-name">{{ shader.type }} #{{ shader.id }}</span>
                    <div class="shader-controls">
                        <button @click.stop="moveShaderUp(index)" :disabled="index === 0">
                            ↑
                        </button>
                        <button @click.stop="moveShaderDown(index)" :disabled="index === shaders.length - 1">
                            ↓
                        </button>
                        <button @click.stop="deleteShader(index)">×</button>
                    </div>
                </div>
            </li>
        </ul>

        <!-- Edit Panel -->
        <div v-if="selectedShader" class="shader-edit-panel">
            <h4>Edit {{ selectedShader.type }}</h4>

            <!-- Common Controls -->
            <div class="control-group">
                <label>Amount:</label>
                <input type="range" v-model.number="selectedShader.amount" min="0" max="1" step="0.1" />
                <span>{{ selectedShader.amount.toFixed(2) }}</span>
            </div>

            <div class="control-group">
                <label>Multipass:</label>
                <input type="number" v-model.number="selectedShader.multipass" min="1" max="10" />
            </div>

            <!-- Type Specific Controls -->
            <template v-if="selectedShader.type === 'contrast'">
                <div class="control-group">
                    <label>Contrast:</label>
                    <input type="range" v-model.number="selectedShader.Contrast" min="0" max="2" step="0.1" />
                    <span>{{ selectedShader.Contrast.toFixed(2) }}</span>
                </div>
            </template>

            <template v-if="selectedShader.type === 'tint'">
                <div class="control-group">
                    <label>Tint Color:</label>
                    <input type="color" :value="rgbToHex(selectedShader.TintColor)" @input="updateTintColor($event)" />
                </div>
                <div class="control-group">
                    <label>Tint Strength:</label>
                    <input type="range" v-model.number="selectedShader.TintStrength" min="0" max="1" step="0.1" />
                    <span>{{ selectedShader.TintStrength.toFixed(2) }}</span>
                </div>
            </template>

            <template v-if="selectedShader.type === 'bloom'">
                <div class="control-group">
                    <label>Threshold:</label>
                    <input type="range" v-model.number="selectedShader.BloomThreshold" min="0" max="1" step="0.01" />
                    <span>{{ selectedShader.BloomThreshold.toFixed(2) }}</span>
                </div>
                <div class="control-group">
                    <label>Intensity:</label>
                    <input type="range" v-model.number="selectedShader.BloomIntensity" min="0" max="2" step="0.1" />
                    <span>{{ selectedShader.BloomIntensity.toFixed(2) }}</span>
                </div>
            </template>

            <template v-if="selectedShader.type === 'bloomV2'">
                <div class="control-group">
                    <label>Threshold:</label>
                    <input type="range" v-model.number="selectedShader.BloomThreshold" min="0" max="1" step="0.01" />
                    <span>{{ selectedShader.BloomThreshold.toFixed(2) }}</span>
                </div>
                <div class="control-group">
                    <label>Intensity:</label>
                    <input type="range" v-model.number="selectedShader.BloomIntensity" min="0" max="2" step="0.1" />
                    <span>{{ selectedShader.BloomIntensity.toFixed(2) }}</span>
                </div>
                <div class="control-group">
                    <label>Spread:</label>
                    <input type="range" v-model.number="selectedShader.BloomSpread" min="0" max="3" step="0.01" />
                    <span>{{ selectedShader.BloomSpread.toFixed(2) }}</span>
                </div>
            </template>

            <template v-if="selectedShader.type === 'sharpen'">
                <div class="control-group">
                    <label>Sharpness:</label>
                    <input type="range" v-model.number="selectedShader.Sharpness" min="0" max="2" step="0.1" />
                    <span>{{ selectedShader.Sharpness.toFixed(2) }}</span>
                </div>
            </template>

            <template v-if="selectedShader.type === 'chromaticAberration'">
                <div class="control-group">
                    <label>Strength:</label>
                    <input type="range" v-model.number="selectedShader.Strength" min="0" max="1" step="0.01" />
                    <span>{{ selectedShader.Strength.toFixed(3) }}</span>
                </div>
            </template>

            <template v-if="selectedShader.type === 'edgeDetection'">
                <div class="control-group">
                    <label>Strength:</label>
                    <input type="range" v-model.number="selectedShader.Strength" min="0" max="1" step="0.01" />
                    <span>{{ selectedShader.Strength.toFixed(3) }}</span>
                </div>
                <div class="control-group">
                    <label>Color R:</label>
                    <input type="range" v-model.number="selectedShader.AlphaR" min="0" max="1" step="0.01" />
                    <span>{{ selectedShader.AlphaR.toFixed(4) }}</span>
                </div>
                <div class="control-group">
                    <label>Color G:</label>
                    <input type="range" v-model.number="selectedShader.AlphaG" min="0" max="1" step="0.01" />
                    <span>{{ selectedShader.AlphaG.toFixed(4) }}</span>
                </div>
                <div class="control-group">
                    <label>Color B:</label>
                    <input type="range" v-model.number="selectedShader.AlphaB" min="0" max="1" step="0.01" />
                    <span>{{ selectedShader.AlphaB.toFixed(4) }}</span>
                </div>
            </template>

            <template v-if="selectedShader.type === 'colorMapping'">
                <div class="control-group">
                    <label>Color R:</label>
                    <input type="number" v-model.number="selectedShader.ColorR" min="0" max="255" />
                </div>
                <div class="control-group">
                    <label>Color G:</label>
                    <input type="number" v-model.number="selectedShader.ColorG" min="0" max="255" />
                </div>
                <div class="control-group">
                    <label>Color B:</label>
                    <input type="number" v-model.number="selectedShader.ColorB" min="0" max="255" />
                </div>
            </template>

            <template v-if="selectedShader.type === 'colorMappingV2'">
                <div class="control-group">
                    <label>Color R:</label>
                    <input type="number" v-model.number="selectedShader.ColorR" min="0" max="255" />
                </div>
                <div class="control-group">
                    <label>Color G:</label>
                    <input type="number" v-model.number="selectedShader.ColorG" min="0" max="255" />
                </div>
                <div class="control-group">
                    <label>Color B:</label>
                    <input type="number" v-model.number="selectedShader.ColorB" min="0" max="255" />
                </div>
            </template>

            <template v-if="selectedShader.type === 'Lighten'">
                <div class="control-group">
                    <label>Lighten/Darken:</label>
                    <input type="range" v-model.number="selectedShader.Lighten" min="0" max="2.5" step="0.1" />
                    <span>{{ selectedShader.Lighten.toFixed(2) }}</span>
                </div>
            </template>

            <template v-if="selectedShader.type === 'CRT'">
                <div class="control-group">
                    <label>Base:</label>
                    <input type="range" v-model.number="selectedShader.Base" min="0" max="1" step="0.01" />
                    <span>{{ selectedShader.Base.toFixed(2) }}</span>
                </div>
                <div class="control-group">
                    <label>Glow:</label>
                    <input type="range" v-model.number="selectedShader.Glow" min="0" max="80" step="0.01" />
                    <span>{{ selectedShader.Glow.toFixed(2) }}</span>
                </div>
                <div class="control-group">
                    <label>Radius:</label>
                    <input type="range" v-model.number="selectedShader.Radius" min="0" max="100" step="1" />
                    <span>{{ selectedShader.Radius.toFixed(2) }}</span>
                </div>
            </template>

        </div>
    </div>
</template>

<script>
import axios from "axios";
import { inject } from "vue";

export default {
    name: "ShaderMenu",
    data() {
        return {
            shaderTypes: {
                contrast: {
                    Contrast: 1.0,
                    amount: 0.1,
                    multipass: 1,
                },
                tint: {
                    TintColor: [1.0, 1.0, 1.0],
                    TintStrength: 0.1,
                    amount: 0.1,
                    multipass: 1,
                },
                bloom: {
                    BloomThreshold: 0.05,
                    BloomIntensity: 1.1,
                    amount: 0.1,
                    multipass: 3,
                },
                bloomV2: {
                    BloomThreshold: 0.05,
                    BloomIntensity: 1.1,
                    BloomSpread: 0.7,
                    amount: 0.1,
                    multipass: 3,
                },
                sharpen: {
                    Sharpness: 1.0,
                    amount: 0.1,
                    multipass: 1,
                },
                colorMapping: {
                    ColorR :16,
                    ColorG :16,
                    ColorB :16,
                    amount: 0.1,
                    multipass: 1,
                },
                chromaticAberration :
                {   
                    Strength: 0.1,
                    amount: 0.1,
                    multipass: 1,
                },
                edgeDetection :
                {
                    amount: 0.1,
                    multipass: 1,
                    Strength: 0.1,
                    AlphaR: 1.0,
                    AlphaG: 1.0,
                    AlphaB: 1.0,
                },
                // colorMappingV2: {
                //     ColorR :2,
                //     ColorG :2,
                //     ColorB :2,
                //     amount: 0.1,
                //     multipass: 1,
                // },
                Lighten: {
                    Lighten: 0.1,
                    amount: 0.1,
                    multipass: 1,
                },
                CRT: {
                    amount: 0.1,
                    multipass: 1,
                    Base : 0.5,
                    Glow : 1.5,
                    Radius : 16.0,
                },
            },
            selectedType: "contrast",
            shaders: [],
            selectedShader: null,
            nextId: 1,
        };
    },

    setup() {
        const apiAddress = inject("apiAddress");
        return { apiAddress };
    },

    methods: {
        addShader() {
            const newShader = {
                id: this.nextId++,
                type: this.selectedType,
                ...JSON.parse(JSON.stringify(this.shaderTypes[this.selectedType])),
            };
            this.shaders.push(newShader);
            this.selectShader(newShader);
        },
        selectShader(shader) {
            this.selectedShader = shader;
        },
        moveShaderUp(index) {
            if (index > 0) {
                this.shaders.splice(index - 1, 0, this.shaders.splice(index, 1)[0]);
            }
        },
        moveShaderDown(index) {
            if (index < this.shaders.length - 1) {
                this.shaders.splice(index + 1, 0, this.shaders.splice(index, 1)[0]);
            }
        },
        deleteShader(index) {
            if (this.selectedShader === this.shaders[index]) {
                this.selectedShader = null;
            }
            this.shaders.splice(index, 1);
        },
        rgbToHex(rgb) {
            return (
                "#" +
                rgb
                    .map((x) =>
                        Math.round(x * 255)
                            .toString(16)
                            .padStart(2, "0")
                    )
                    .join("")
            );
        },
        updateTintColor(event) {
            const hex = event.target.value;
            const r = parseInt(hex.slice(1, 3), 16) / 255;
            const g = parseInt(hex.slice(3, 5), 16) / 255;
            const b = parseInt(hex.slice(5, 7), 16) / 255;
            this.selectedShader.TintColor = [r, g, b];
        },
        SubmitShaderMenu() {
            console.log("Submitting shader menu...");
            const shaderMenu = this.shaders.map((shader) => {
                const { type, ...params } = shader;
                // remove id from params
                delete params.id;
                return { type, params };
            });

            for (let i = 0; i < shaderMenu.length; i++) {
                if (shaderMenu[i].type === "chromaticAberration") {
                    shaderMenu[i].params.Strength = parseFloat(shaderMenu[i].params.Strength) / 1000;
                }
                if (shaderMenu[i].type === "edgeDetection") {
                    shaderMenu[i].params.AlphaR = parseFloat(shaderMenu[i].params.AlphaR);
                    shaderMenu[i].params.AlphaG = parseFloat(shaderMenu[i].params.AlphaG);
                    shaderMenu[i].params.AlphaB = parseFloat(shaderMenu[i].params.AlphaB);
                    shaderMenu[i].params.Strength = parseFloat(shaderMenu[i].params.Strength) / 1000;
                }
            }

            console.log(shaderMenu);
            axios
                .post(`${this.apiAddress}/submitShader`, shaderMenu)
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
.shader-menu {
  background: var(--bg-secondary);
  border-radius: var(--border-radius);
  padding: var(--spacing-unit);
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-unit);
  overflow-y: auto;
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
}

.add-shader {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: var(--spacing-unit);
  margin-bottom: var(--spacing-unit);
}

.shader-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing-unit) * 0.5);
}

.shader-item {
  background: var(--bg-tertiary);
  padding: var(--spacing-unit);
  border-radius: var(--border-radius);
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.shader-item:hover {
  transform: translateX(4px);
  background: var(--bg-tertiary);
  border-color: var(--accent-primary);
}

.shader-item.selected {
  background: var(--accent-primary);
  color: white;
}

.shader-controls {
  display: flex;
  gap: calc(var(--spacing-unit) * 0.5);
}

.shader-controls button {
  padding: 0.3rem 0.6rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: calc(var(--border-radius) * 0.5);
}

.shader-edit-panel {
  background: var(--bg-tertiary);
  padding: var(--spacing-unit);
  border-radius: var(--border-radius);
  margin-top: var(--spacing-unit);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.control-group {
  display: grid;
  grid-template-columns: 120px 1fr auto;
  gap: calc(var(--spacing-unit) * 0.5);
  align-items: center;
  margin-bottom: calc(var(--spacing-unit) * 0.8);
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

input[type="number"], select {
  background: var(--bg-secondary);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
  padding: 0.4rem;
  border-radius: calc(var(--border-radius) * 0.5);
  width: 80px;
}

input[type="color"] {
  width: 60px;
  height: 30px;
  border: none;
  border-radius: calc(var(--border-radius) * 0.5);
  cursor: pointer;
}

h3, h4 {
  color: var(--text-primary);
  margin-bottom: var(--spacing-unit);
}

label {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

span {
  color: var(--text-secondary);
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .control-group {
    grid-template-columns: 100px 1fr auto;
  }
  
  .add-shader {
    grid-template-columns: 1fr;
  }
}
</style>

