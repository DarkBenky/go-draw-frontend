<template>
    <div>
        <div class="tools">
            <div class="brush-size-indicator">Brush: {{ brushSize }}</div>
            <label class="custom-file-upload tool-button">
                <input type="file" accept="image/*" @change="handleImageUpload" />
                📁 Choose File
            </label>
            <button @click="submitTextures" class="custom-file-upload tool-button">
                Submit Textures
            </button>
            <!-- Add normal map upload -->
            <label class="custom-file-upload tool-button">
                <input type="file" accept="image/*" @change="handleNormalMapUpload" ref="normalMapInput" />
                Upload Normals
            </label>
            <button @click="openNormalMapGenerator" class="custom-file-upload tool-button">
                No Normals?
            </button>
        </div>
        <div class="texture-editor">
            <div class="texture-list">
                <!-- Iterate over the textures array so only valid textures are listed -->
                <button v-for="(texture, index) in textures" :key="index"
                    :class="{ active: currentTextureIndex === index }" @click="selectTexture(index)">
                    {{ index + 1 }}
                </button>
            </div>

            <div class="canvas-container">
                <canvas ref="canvas" width="128" height="128" @mousedown="startDrawing" @mousemove="draw"
                    @mouseup="stopDrawing" @mouseleave="stopDrawing" @wheel="handleWheel"></canvas>
            </div>

            <!-- Add preview canvases -->
            <div class="canvas-container">
                <canvas ref="normalPreview" width="128" height="128" class="preview-canvas"></canvas>
            </div>

            <div class="material-properties">
                <div class="property-card">
                  <div class="property-label">Reflection</div>
                  <div class="property-value">{{ textureProperties[currentTextureIndex].reflection }}</div>
                </div>
                <div class="property-card">
                  <div class="property-label">Direct to Scatter</div>
                  <div class="property-value">{{ textureProperties[currentTextureIndex].directToScatter }}</div>
                </div>
                <div class="property-card">
                  <div class="property-label">Roughness</div>
                  <div class="property-value">{{ textureProperties[currentTextureIndex].roughness }}</div>
                </div>
                <div class="property-card">
                  <div class="property-label">Metallic</div>
                  <div class="property-value">{{ textureProperties[currentTextureIndex].metallic }}</div>
                </div>
                <div class="property-card">
                    <div class="property-label">Specular</div>
                    <div class="property-value">{{ textureProperties[currentTextureIndex].specular }}</div>
                  </div>
              </div>  
        </div>
    </div>
</template>

<script>
import axios from 'axios';


export default {
    name: 'TextureCanvas',
    props: {
        selectedColor: {
            type: String,
            required: true
        },
        MaterialProperties: {
            type: Object,
            required: true
        },
        R: {
            type: Number,
            required: true
        },
        G: {
            type: Number,
            required: true
        },
        B: {
            type: Number,
            required: true
        },
        A: {
            type: Number,
            required: true
        },
    },
    data() {
        return {
            url: "http://localhost:5053",
            isDrawing: false,
            currentTextureIndex: 0,
            textures: Array(128).fill().map(() =>
                new ImageData(128, 128)
            ),
            texturesRGBA_Float32: Array(128).fill().map(() => ({
                data: new Float32Array(128 * 128 * 4)
            })),
            textureProperties: Array(128).fill().map(() => ({
                reflection: 0.5,
                directToScatter: 0.5,
                roughness: 0.5,
                metallic: 0.5,
                specular: 0.5
            })),
            normals: Array(128).fill().map(() => ({
                data: new Float32Array(128 * 128 * 4)
            })
            ),
            normalsImage: Array(128).fill().map(() =>
                new ImageData(128, 128)
            ),
            ctx: null,
            pixelSize: 4, // 512/128 = 4 pixels per grid cell
            brushSize: 1, // Add brush size
            minBrushSize: 1,
            maxBrushSize: 16
        };
    },
    mounted() {
        this.ctxNormal = this.$refs.normalPreview.getContext('2d');
        this.ctx = this.$refs.canvas.getContext('2d');
        this.drawGrid();
        this.loadTexture(0);
        // this.drawGrid();
        // this.loadTexture(0);

        console.log("ctx", this.ctx);
        console.log("ctxNormal", this.ctxNormal);
    },
    watch: {
        MaterialProperties: {
            handler(newVal) {
                console.log('Material Properties updated:', newVal);
                this.textureProperties[this.currentTextureIndex] = newVal;
            },
            deep: true
        },
    },
    methods: {

        async submitTextures() {
            console.log('Selected Textures:', this.texturesRGBA_Float32[this.currentTextureIndex].data);
            console.log('Selected Color:', this.MaterialProperties);
            // let texture = this.updateTextureMultiplayer();
            // console.log('Texture:', texture);
            const data = {
                textures: this.texturesRGBA_Float32[this.currentTextureIndex],
                normals: this.normals[this.currentTextureIndex],
                reflection: Number(this.MaterialProperties.reflection),
                directToScatter: Number(this.MaterialProperties.directToScatter),
                roughness: Number(this.MaterialProperties.roughness),
                metallic: Number(this.MaterialProperties.metallic),
                index: Number(this.currentTextureIndex),
                // normal : this.normalsImage[this.currentTextureIndex],
                specular : Number(this.MaterialProperties.specular),
                ColorR : Number(this.MaterialProperties.R),
                ColorG : Number(this.MaterialProperties.G),
                ColorB : Number(this.MaterialProperties.B),
                ColorA : Number(this.MaterialProperties.A)
            };

            console.log('Submitting Textures...', data);

            axios.post(`${this.url}/submitTextures`, data)
                .then((response) => {
                    console.log(response.data);
                })
                .catch((error) => {
                    console.error(error);
                });

            console.log('Textures submitted');
        },
        selectTexture(index) {
            if (index < 0 || index >= this.textures.length) {
                console.error('Invalid texture index');
                return;
            }
            this.currentTextureIndex = index;
            this.loadTexture(index);
        },
        loadTexture(index) {
            this.ctx.putImageData(this.textures[index], 0, 0);
            this.drawGrid();
            this.ctxNormal.putImageData(this.normalsImage[index], 0, 0);
            this.drawGrid();
        },
        drawGrid() {
            this.ctx.strokeStyle = '#333';
            this.ctx.lineWidth = 0.5;

            for (let i = 0; i <= 128; i++) {
                const pos = i * this.pixelSize;

                // Vertical lines
                this.ctx.beginPath();
                this.ctx.moveTo(pos, 0);
                this.ctx.lineTo(pos, 512);
                this.ctx.stroke();

                // Horizontal lines
                this.ctx.beginPath();
                this.ctx.moveTo(0, pos);
                this.ctx.lineTo(512, pos);
                this.ctx.stroke();
            }
        },
        startDrawing(e) {
            this.isDrawing = true;
            this.draw(e);
        },
        stopDrawing() {
            this.isDrawing = false;
        },
        handleWheel(e) {
            e.preventDefault();
            const delta = Math.sign(e.deltaY) * -1;
            this.brushSize = Math.max(
                this.minBrushSize,
                Math.min(this.maxBrushSize, this.brushSize + delta)
            );
        },
        draw(e) {
            if (!this.isDrawing) return;

            const rect = e.target.getBoundingClientRect();
            const x = Math.floor((e.clientX - rect.left) / this.pixelSize);
            const y = Math.floor((e.clientY - rect.top) / this.pixelSize);

            const x1 = Math.floor((e.clientX - rect.left) );
            const y1 = Math.floor((e.clientY - rect.top) );

            // set color in TextureFloat32Array
            for (let by = 0; by < this.brushSize; by++) {
                for (let bx = 0; bx < this.brushSize; bx++) {
                    const px = x1 + bx;
                    const py = y1 + by;
                    if (px >= 0 && px < 128 && py >= 0 && py < 128) {
                        const index = (py * 128 + px) * 4;
                        console.log('x:', x, 'y:', y, 'index:', index);
                        this.texturesRGBA_Float32[this.currentTextureIndex].data[index] = this.R;
                        this.texturesRGBA_Float32[this.currentTextureIndex].data[index + 2] = this.B;
                        this.texturesRGBA_Float32[this.currentTextureIndex].data[index + 1] = this.G;
                        this.texturesRGBA_Float32[this.currentTextureIndex].data[index + 3] = this.A;
                    }
                }
            }

            // Draw with brush size
            for (let by = 0; by < this.brushSize; by++) {
                for (let bx = 0; bx < this.brushSize; bx++) {
                    const px = x1 + bx;
                    const py = y1 + by;
                    if (px >= 0 && px < 128 && py >= 0 && py < 128) {
                        this.ctx.fillStyle = this.selectedColor;
                        this.ctx.fillRect(
                            px,
                            py,
                            this.pixelSize,
                            this.pixelSize
                        );
                    }
                }
            }

            // Update the texture data
            const imageData = this.ctx.getImageData(0, 0, 512, 512);
            this.textures[this.currentTextureIndex] = imageData;
        },
        async handleImageUpload(event) {
            const file = event.target.files[0];
            if (!file) return;

            const img = new Image();
            img.src = URL.createObjectURL(file);

            img.onload = () => {
                // Create temporary canvas for downscaling
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = 128;
                tempCanvas.height = 128;
                const tempCtx = tempCanvas.getContext('2d');

                // Draw and scale image
                tempCtx.drawImage(img, 0, 0, 128, 128);

                // Get scaled image data
                const imageData = tempCtx.getImageData(0, 0, 128, 128);

                // Update current texture
                this.textures[this.currentTextureIndex] = imageData;

                // copy image data to Float32Array
                for (let i = 0; i < imageData.data.length; i++) {
                    this.texturesRGBA_Float32[this.currentTextureIndex].data[i] = imageData.data[i];
                }

                this.loadTexture(this.currentTextureIndex);

                // Cleanup
                URL.revokeObjectURL(img.src);
            };
        },
        async handleNormalMapUpload(event) {
            const file = event.target.files[0];
            if (!file) return;

            const img = new Image();
            img.src = URL.createObjectURL(file);

            img.onload = () => {
                const previewCanvas = this.$refs.normalPreview;
                const ctx = previewCanvas.getContext('2d');

                // Draw and scale image
                ctx.drawImage(img, 0, 0, 128, 128);

                // Get image data
                const imageData = ctx.getImageData(0, 0, 128, 128);

                // Convert to normal map format and store
                for (let i = 0; i < imageData.data.length; i += 4) {
                    this.normals[this.currentTextureIndex].data[i] = imageData.data[i] / 127 - 1;     // R
                    this.normals[this.currentTextureIndex].data[i + 1] = imageData.data[i + 1] / 127 - 1; // G
                    this.normals[this.currentTextureIndex].data[i + 2] = imageData.data[i + 2] / 127 - 1; // B
                    this.normals[this.currentTextureIndex].data[i + 3] = imageData.data[i + 3] / 127 - 1; // A
                }

                // save image into noramlsImage
                this.normalsImage[this.currentTextureIndex] = imageData;

                URL.revokeObjectURL(img.src);
            };
        },
        openNormalMapGenerator() {
            window.open('https://cpetry.github.io/NormalMap-Online/', '_blank');
        }
    }
};
</script>

<style scoped>
.material-properties {
    display: grid;
    gap: 8px;
    padding: var(--spacing-unit);
    background: var(--bg-tertiary);
    border-radius: var(--border-radius);
    min-width: 200px;
  }
  
  .property-card {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    background: var(--bg-secondary);
    border-radius: calc(var(--border-radius) * 0.5);
    transition: transform 0.2s ease;
    border: 1px solid var(--border-color);
  }
  
  .property-card:hover {
    transform: translateX(4px);
    background: var(--bg-tertiary);
  }
  
  .property-label {
    color: var(--text-secondary);
    font-size: 0.9rem;
  }
  
  .property-value {
    background: linear-gradient(135deg, var(--accent-primary), #3a8eef);
    padding: 4px 8px;
    border-radius: calc(var(--border-radius) * 0.5);
    color: white;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.9rem;
    min-width: 50px;
    text-align: center;
  }

.texture-editor {
    display: flex;
    gap: var(--spacing-unit);
    align-items: center;
    max-height: 200px;
    justify-content: center;
    padding-right: var(--spacing-unit);
    margin: var(--spacing-unit) var(--spacing-unit);
}

.texture-list {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    gap: 4px;
    max-height: 200px;
    overflow-y: auto;
    padding-right: var(--spacing-unit);
}

.texture-list button {
    padding: 4px;
    background: var(--bg-tertiary);
    border: 1px solid var(--border-color);
    cursor: pointer;
}

.texture-list button.active {
    background: var(--accent-primary);
    color: white;
}

.canvas-container {
    position: relative;
    border: 1px solid var(--border-color);
    background: var(--bg-tertiary);
    width: 128px;
}

canvas {
    display: block;
    cursor: crosshair;
}

.brush-size-indicator {
    background: var(--bg-tertiary);
    color: white;
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 0.9rem;
    text-align: center;
    margin-bottom: px;
    font-weight: 500;
}

.tools {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
    z-index: 1;
}

.tool-button {
    min-width: 120px;
    text-align: center;
    white-space: nowrap;
    padding: 8px 12px;
}

.custom-file-upload {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    background: var(--bg-tertiary);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.9rem;
    color: var(--text-primary);
}

.custom-file-upload:hover {
    background: var(--accent-primary);
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    color: white;
}

.custom-file-upload input[type="file"] {
    display: none;
}

.image-upload,
.image-upload:hover,
.image-upload input[type="file"],
.image-upload::before {
    display: none;
}

.preview-canvas {
    border: 1px solid var(--border-color);
    background: var(--bg-tertiary);
}
</style>
