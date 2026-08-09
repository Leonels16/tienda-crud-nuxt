// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  
  // Desactivar SSR para que se genere como Single Page Application pura
  ssr: false,

  app: {
    baseURL: '/tienda-crud-nuxt/'
  }
})