<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { addAsset, editAsset, listAssets, removeAsset, type Asset } from './api'

const assets = ref<Asset[]>([])
const loading = ref(false)
const message = ref('')
const error = ref('')

const empty = { asset_name: '', stock_quantity: 0, category: 'Consumable' }
const form = ref({ ...empty })
const editingId = ref<number | null>(null)

async function load() {
  loading.value = true
  error.value = ''
  try {
    assets.value = (await listAssets()).data
  } catch {
    error.value = 'Failed to load data.'
  } finally {
    loading.value = false
  }
}

async function save() {
  message.value = ''
  error.value = ''
  try {
    if (editingId.value) {
      await editAsset(editingId.value, form.value)
      message.value = 'Asset updated successfully.'
    } else {
      await addAsset(form.value)
      message.value = 'Asset added successfully.'
    }
    form.value = { ...empty }
    editingId.value = null
    await load()
  } catch (e) {
    const details = (e as { response?: { data?: { message?: unknown } } })?.response?.data?.message
    error.value = 'Failed to save asset'
  }
}

function edit(asset: Asset) {
  editingId.value = asset.asset_id
  form.value = { asset_name: asset.asset_name, stock_quantity: asset.stock_quantity, category: asset.category }
}

function cancelEdit() {
  editingId.value = null
  form.value = { ...empty }
}

async function remove(asset: Asset) {
  if (!confirm(`Are you sure you want to delete asset "${asset.asset_name}"?`)) return
  message.value = ''
  error.value = ''
  try {
    await removeAsset(asset.asset_id)
    message.value = 'Aset berhasil dihapus.'
    if (editingId.value === asset.asset_id) cancelEdit()
    await load()
  } catch {
    error.value = 'Gagal menghapus data.'
  }
}

onMounted(load)
</script>

<template>
  <main class="page">
    <h1>Manajemen Aset</h1>
    <p v-if="message" class="ok">{{ message }}</p>
    <p v-if="error" class="err">{{ error }}</p>

    <form class="asset-form" @submit.prevent="save">
      <h2>{{ editingId ? `Edit Aset #${editingId}` : 'Tambah Aset' }}</h2>
      <input v-model="form.asset_name" placeholder="Nama aset" required />
      <input v-model.number="form.stock_quantity" type="number" min="0" placeholder="Stok" required />
      <select v-model="form.category">
        <option>Consumable</option>
        <option>Non-Consumable</option>
      </select>
      <button type="submit">{{ editingId ? 'Simpan' : 'Tambah' }}</button>
      <button v-if="editingId" type="button" class="secondary" @click="cancelEdit">Batal</button>
    </form>

    <p v-if="loading">Memuat...</p>
    <table v-else class="asset-table">
      <thead>
        <tr>
          <th>ID</th><th>Nama</th><th>Stok</th><th>Kategori</th><th>Aksi</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="a in assets" :key="a.asset_id">
          <td>{{ a.asset_id }}</td>
          <td>{{ a.asset_name }}</td>
          <td>{{ a.stock_quantity }}</td>
          <td>{{ a.category }}</td>
          <td>
            <button @click="edit(a)">Edit</button>
            <button class="danger" @click="remove(a)">Hapus</button>
          </td>
        </tr>
        <tr v-if="assets.length === 0">
          <td colspan="5">Belum ada data</td>
        </tr>
      </tbody>
    </table>
  </main>
</template>

<style scoped>
.page {
  max-width: 700px;
  margin: 2rem auto;
  font-family: sans-serif;
}

.ok { color: green; }
.err { color: red; }

.asset-form input,
.asset-form select {
  margin-right: 0.5rem;
}

.asset-table {
  border-collapse: collapse;
  width: 100%;
}

.asset-table th,
.asset-table td {
  border: 1px solid #ccc;
  padding: 0.5rem;
  text-align: left;
}

.danger { margin-left: 0.25rem; }
</style>
