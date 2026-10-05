<script setup lang="ts">
import { ref, watch } from 'vue'
import { QrcodeStream, type DetectedBarcode, type EmittedError } from 'vue-qrcode-reader'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import Message from 'primevue/message'
import ProgressSpinner from 'primevue/progressspinner'

import { type InventoryItem, createDefault } from '../models/InventoryItem'
import { lookupProduct } from '@/services/productLookup'

const visible = defineModel<boolean>('visible', { required: true })

const emit = defineEmits<{
  scanned: [item: InventoryItem]
  manual: []
}>()

const cameraReady = ref(false)
const lookingUp = ref(false)
const error = ref<string | null>(null)

watch(visible, (isVisible) => {
  if (isVisible) {
    cameraReady.value = false
    lookingUp.value = false
    error.value = null
  }
})

async function onDetect(codes: DetectedBarcode[]) {
  const [code] = codes
  if (!code || lookingUp.value) return

  const item = createDefault()

  if (code.format === 'qr_code') {
    item.qr_code = code.rawValue
  } else {
    item.barcode = code.rawValue
    lookingUp.value = true
    const product = await lookupProduct(code.rawValue)
    lookingUp.value = false

    if (product) {
      item.name = product.name
      item.category = product.category ?? ''
      item.quantity = product.quantity ?? 0
      item.unit = product.unit ?? ''
    }
  }

  emit('scanned', item)
}

function onError(err: EmittedError) {
  switch (err.name) {
    case 'NotAllowedError':
      error.value = 'Du må gi tilgang til kameraet for å skanne.'
      break
    case 'NotFoundError':
      error.value = 'Fant ikke noe kamera på denne enheten.'
      break
    case 'NotReadableError':
      error.value = 'Kameraet er i bruk av en annen app.'
      break
    case 'InsecureContextError':
      error.value = 'Kameraet krever at siden åpnes over HTTPS.'
      break
    default:
      error.value = `Kunne ikke starte kameraet (${err.name}).`
  }
}
</script>

<template>
  <Dialog v-model:visible="visible" modal header="Skann vare" :style="{ width: '32rem' }"
    :breakpoints="{ '640px': '95vw' }">
    <Message v-if="error" severity="error" :text="error" />

    <template v-else>
      <div class="scanner">
        <QrcodeStream :paused="lookingUp"
          :formats="['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'qr_code']"
          :constraints="{ facingMode: 'environment' }" @camera-on="cameraReady = true" @detect="onDetect"
          @error="onError">
          <div v-if="!cameraReady || lookingUp" class="overlay">
            <ProgressSpinner style="width: 3rem; height: 3rem" />
            <span>{{ lookingUp ? 'Henter produktinfo…' : 'Starter kamera…' }}</span>
          </div>
        </QrcodeStream>
      </div>
      <p class="hint">Hold strekkoden eller QR-koden foran kameraet.</p>
    </template>

    <template #footer>
      <Button label="Legg inn manuelt" icon="pi pi-pencil" text @click="emit('manual')" />
    </template>
  </Dialog>
</template>

<style scoped>
.scanner {
  aspect-ratio: 4 / 3;
  width: 100%;
  overflow: hidden;
  border-radius: 0.5rem;
  background: #000;
}

.overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: #fff;
  background: rgba(0, 0, 0, 0.5);
}

.hint {
  margin-top: 0.5rem;
  text-align: center;
  font-size: 0.875rem;
}
</style>
