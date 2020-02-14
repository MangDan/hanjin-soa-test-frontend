<template>
  <q-layout view="hHh lpR fFf">
    <Header />

    <q-page-container>
      <Main />
    </q-page-container>

    <Footer />
  </q-layout>
</template>

<script>
import Header from "./Header";
import Main from "../pages/Main";
import Footer from "./Footer";

export default {
  name: "MainLayout",

  components: { Header, Main, Footer },
  data: () => ({})
};
</script>
