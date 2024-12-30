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

            <template v-if="selectedShader.type === 'sharpen'">
                <div class="control-group">
                    <label>Sharpness:</label>
                    <input type="range" v-model.number="selectedShader.Sharpness" min="0" max="2" step="0.1" />
                    <span>{{ selectedShader.Sharpness.toFixed(2) }}</span>
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
                sharpen: {
                    Sharpness: 1.0,
                    amount: 0.1,
                    multipass: 1,
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
            console.log(shaderMenu);
            axios
                .post(`${this.apiAddress}/shader-menu`, shaderMenu)
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
    background: #1a1a1a;
    padding: 1rem;
    border-radius: 8px;
    color: #e1e1e1;
}

.add-shader {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
}

.shader-list {
    list-style: none;
    padding: 0;
    margin: 1rem 0;
}

.shader-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #2a2a2a;
    padding: 0.5rem;
    margin-bottom: 0.5rem;
    border-radius: 4px;
    transition: background-color 0.2s;
}

.shader-item:hover {
    background: #333;
}

.shader-item.selected {
    background: #4a9eff;
}

.shader-controls {
    display: flex;
    gap: 0.25rem;
}

.control-group {
    display: grid;
    grid-template-columns: 100px 1fr auto;
    gap: 0.5rem;
    align-items: center;
    margin-bottom: 0.5rem;
}

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

select,
input[type="number"] {
    background: #2a2a2a;
    border: 1px solid #3a3a3a;
    padding: 0.3rem;
    color: #e1e1e1;
    border-radius: 4px;
}

input[type="range"] {
    width: 100%;
}

.shader-edit-panel {
    background: #2a2a2a;
    padding: 1rem;
    margin-top: 1rem;
    border-radius: 4px;
}

h4 {
    margin: 0 0 1rem 0;
    color: #4a9eff;
}
</style>
