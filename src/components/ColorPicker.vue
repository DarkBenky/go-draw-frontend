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
        <input
          type="range"
          :id="channel.name"
          v-model.number="channel.value"
          min="0"
          max="255"
        />
        <span>{{ channel.value }}</span>

        <label :for="channel.name - multiplier">Multiplier:</label>
        <input
          type="range"
          :id="`${channel.name}-multiplier`"
          v-model.number="channel.multiplier"
          min="1"
          max="100"
        />
        <span>{{ channel.multiplier }}</span>

        <span>Total {{channel.name}} : {{ channel.value * channel.multiplier }}</span>
      </div>
    </div>

    <!-- Color Preview -->
    <div class="color-preview" :style="{ backgroundColor: previewColor }"></div>

    <!-- Additional Settings -->
    <h3>Additional Settings</h3>
    <div class="sliders">
      <div v-for="slider in sliders" :key="slider.name" class="slider">
        <label :for="slider.name">{{ slider.name }}:</label>
        <input
          type="range"
          :id="slider.name"
          v-model.number="slider.value"
          min="0"
          max="1"
          step="0.01"
        />
        <span>{{ slider.value.toFixed(2) }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { inject } from "vue";
import axios from "axios";

export default {
  name: "ColorPicker",
  setup() {
    const apiAddress = inject("apiAddress");
    return { apiAddress };
  },
  data() {
    return {
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
      const a = this.rgbaChannels[3].value / 255;

      return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(
        b
      )}, ${a.toFixed(2)})`;
    },
  },
  methods: {
    submitColor() {
      const colorData = {
        r: this.rgbaChannels[0].value * this.rgbaChannels[0].multiplier,
        g: this.rgbaChannels[1].value * this.rgbaChannels[1].multiplier,
        b: this.rgbaChannels[2].value * this.rgbaChannels[2].multiplier,
        a: this.rgbaChannels[3].value * this.rgbaChannels[3].multiplier,
        reflection: this.sliders[0].value,
        directToScatter: this.sliders[1].value,
        roughness: this.sliders[2].value,
        metallic: this.sliders[3].value,
      };

      axios
        .post(`${this.apiAddress}/color`, colorData)
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
.color-picker {
  font-family: Arial, sans-serif;
  padding: 1rem;
}

.channel-inputs,
.sliders {
  margin-bottom: 1rem;
}

.channel,
.slider {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
}

label {
  width: 150px;
}

input[type="range"] {
  flex-grow: 1;
  margin: 0 0.5rem;
}

span {
  width: 50px;
  text-align: right;
}

.color-preview {
  width: 100%;
  height: 50px;
  margin: 1rem 0;
  border: 1px solid #ccc;
}
</style>
