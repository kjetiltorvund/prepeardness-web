<template>
  <div class="users">
    <h1>Brukere</h1>

    <form class="add-user" @submit.prevent="onAdd">
      <div class="field">
        <label for="user-email">E-post (Google-konto)</label>
        <InputText id="user-email" v-model="newUser.email" type="email" required fluid />
      </div>
      <div class="field">
        <label for="user-name">Navn</label>
        <InputText id="user-name" v-model="newUser.name" fluid />
      </div>
      <Button type="submit" label="Legg til bruker" icon="pi pi-user-plus" :loading="updating"
        :disabled="!newUser.email.trim()" />
    </form>

    <Message v-if="error" severity="error">{{ error }}</Message>

    <DataTable :value="users" :loading="loading" data-key="id" striped-rows>
      <template #empty>Ingen brukere funnet.</template>
      <Column field="name" header="Navn" />
      <Column field="email" header="E-post" />
      <Column field="role" header="Rolle" />
      <Column header="Status">
        <template #body="{ data }">
          <Tag :value="data.active ? 'Aktiv' : 'Inaktiv'" :severity="data.active ? 'success' : 'secondary'" />
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import Button from 'primevue/button'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import Tag from 'primevue/tag'
import { useToast } from 'primevue/usetoast'
import { createDefault, type User } from '@/models/User'
import { useUserStore } from '@/stores/users'

const userStore = useUserStore()
const { users, loading, updating, error } = storeToRefs(userStore)
const toast = useToast()

const newUser = ref<User>(createDefault())

onMounted(() => userStore.fetchUsers())

async function onAdd() {
  try {
    const saved = await userStore.createUser(newUser.value)
    newUser.value = createDefault()
    toast.add({
      severity: 'success',
      summary: 'Brukeren ble lagt til',
      detail: saved.email,
      life: 3000,
    })
  } catch (cause) {
    toast.add({
      severity: 'error',
      summary: 'Kunne ikke legge til brukeren',
      detail: cause instanceof Error ? cause.message : 'En ukjent feil oppstod.',
      life: 3000,
    })
  }
}
</script>

<style scoped>
.users {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.add-user {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 0.75rem;
}

.field {
  display: flex;
  flex: 1 1 14rem;
  flex-direction: column;
  gap: 0.25rem;
}
</style>
