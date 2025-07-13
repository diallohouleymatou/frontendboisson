<script setup lang="ts">
import {onMounted, ref} from "vue";
import type {Boisson} from "../features/boissons/models/boisson.ts";
import {BoissonService} from "../features/boissons/services/boissonService.ts";

const boissons = ref<Boisson[]>([]);
onMounted(async()=>{
  boissons.value=await BoissonService.getAllBoissons();
})
</script>
<template>
  <table class="table table-striped table-bordered mt-4">
    <thead class="table-primary">
    <tr>
      <th>ID</th>
      <th>Nom</th>
      <th>Description</th>
      <th>Prix</th>
      <th>Volume</th>
      <th>Unité</th>
      <th>Seuil</th>
      <th>Actif</th>
    </tr>
    </thead>
    <tbody>
    <tr v-for="boisson in boissons":key="boisson.id">
      <td>{{boisson.id}}</td>
      <td>{{boisson.nom}}</td>
      <td>{{boisson.description}}</td>
      <td>{{boisson.prix}}</td>
      <td>{{boisson.volume}}</td>
      <td>{{boisson.unite}}</td>
      <td>{{boisson.seuil}}</td>
      <td>{{boisson.isActive}}</td>
    </tr>
    </tbody>
  </table>
</template>
<style scoped>
</style>