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
      <div class="field field-role">
        <label for="user-role">Rolle</label>
        <Select input-id="user-role" v-model="newUser.role" :options="[...USER_ROLES]" fluid />
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
      <Column header="" style="width: 7rem">
        <template #body="{ data }">
          <div class="row-actions">
            <Button icon="pi pi-pencil" text rounded aria-label="Rediger bruker" :disabled="updating"
              @click="openEditor(data)" />
            <Button icon="pi pi-trash" severity="danger" text rounded aria-label="Slett bruker"
              :disabled="updating || data.email === authUser?.email" @click="onDelete(data)" />
          </div>
        </template>
      </Column>
    </DataTable>

    <Dialog v-model:visible="editorVisible" header="Rediger bruker" modal :style="{ width: '28rem' }"
      :breakpoints="{ '575px': '95vw' }">
      <form v-if="editedUser" class="edit-user" @submit.prevent="onUpdate">
        <div class="field">
          <label for="edit-email">E-post (Google-konto)</label>
          <InputText id="edit-email" v-model="editedUser.email" type="email" required fluid />
        </div>
        <div class="field">
          <label for="edit-name">Navn</label>
          <InputText id="edit-name" v-model="editedUser.name" fluid />
        </div>
        <div class="field">
          <label for="edit-role">Rolle</label>
          <Select input-id="edit-role" v-model="editedUser.role" :options="[...USER_ROLES]" fluid />
        </div>
        <div class="toggle">
          <ToggleSwitch input-id="edit-active" v-model="editedUser.active" />
          <label for="edit-active">Aktiv</label>
        </div>
        <div class="dialog-actions">
          <Button type="button" label="Avbryt" severity="secondary" outlined @click="editorVisible = false" />
          <Button type="submit" label="Lagre" icon="pi pi-check" :loading="updating"
            :disabled="!editedUser.email.trim()" />
        </div>
      </form>
    </Dialog>

    <ConfirmDialog />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import Button from 'primevue/button'
import Column from 'primevue/column'
import ConfirmDialog from 'primevue/confirmdialog'
import DataTable from 'primevue/datatable'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import Select from 'primevue/select'
import Tag from 'primevue/tag'
import ToggleSwitch from 'primevue/toggleswitch'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import { createDefault, USER_ROLES, type User } from '@/models/User'
import { useAuthStore } from '@/stores/auth'
import { useUserStore } from '@/stores/users'

const userStore = useUserStore()
const { users, loading, updating, error } = storeToRefs(userStore)
const { user: authUser } = storeToRefs(useAuthStore())
const toast = useToast()
const confirm = useConfirm()

const newUser = ref<User>(createDefault())
const editedUser = ref<User | null>(null)
const editorVisible = ref(false)

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

function openEditor(user: User) {
  // Edit a copy so the table doesn't change until the save succeeds
  editedUser.value = { ...user }
  editorVisible.value = true
}

async function onUpdate() {
  if (!editedUser.value) return

  try {
    const saved = await userStore.updateUser(editedUser.value)
    editorVisible.value = false
    toast.add({ severity: 'success', summary: 'Brukeren ble oppdatert', detail: saved.email, life: 3000 })
  } catch (cause) {
    toast.add({
      severity: 'error',
      summary: 'Kunne ikke oppdatere brukeren',
      detail: cause instanceof Error ? cause.message : 'En ukjent feil oppstod.',
      life: 3000,
    })
  }
}

function onDelete(user: User) {
  confirm.require({
    header: 'Slett bruker',
    message: `Vil du slette ${user.name ?? user.email}?`,
    icon: 'pi pi-exclamation-triangle',
    rejectProps: { label: 'Avbryt', severity: 'secondary', outlined: true },
    acceptProps: { label: 'Slett', severity: 'danger' },
    accept: async () => {
      try {
        await userStore.deleteUser(user.id!)
        toast.add({ severity: 'success', summary: 'Brukeren ble slettet', detail: user.email, life: 3000 })
      } catch (cause) {
        toast.add({
          severity: 'error',
          summary: 'Kunne ikke slette brukeren',
          detail: cause instanceof Error ? cause.message : 'En ukjent feil oppstod.',
          life: 3000,
        })
      }
    },
  })
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
  flex-direction: column;
  gap: 0.25rem;
}

/* Flex basis sets widths in the horizontal add form only */
.add-user .field {
  flex: 1 1 14rem;
}

.add-user .field-role {
  flex: 0 1 10rem;
}

.row-actions {
  display: flex;
  gap: 0.25rem;
}

.edit-user {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}
</style>
