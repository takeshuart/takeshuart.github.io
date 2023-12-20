<!--瀑布流页码不再使用-->
<template>
    <nav class="pagination is-centered" role="navigation" aria-label="pagination">
      <ul class="pagination-list">
        <li><a class="pagination-link" @click="changePage(1)" :class="{ 'is-current': currentPage === 1 }" aria-label="Goto page 1">1</a></li>
        <li v-if="currentPage > 3"><span class="pagination-ellipsis">&hellip;</span></li>
        <li v-for="page in pagesToShow" :key="page">
          <a class="pagination-link" @click="changePage(page)" :class="{ 'is-current': page === currentPage }" :aria-label="'Goto page ' + page">{{ page }}</a>
        </li>
        <li v-if="currentPage < totalPages - 2"><span class="pagination-ellipsis">&hellip;</span></li>
        <li v-if="totalPages > 1"><a class="pagination-link" @click="changePage(totalPages)" :class="{ 'is-current': currentPage === totalPages }" :aria-label="'Goto page ' + totalPages">{{ totalPages }}</a></li>
      </ul>
    </nav>
  </template>
  
  <script>
  export default {
    name: 'PaginationComponent',
    props: {
      currentPage: Number,
      totalPages: Number
    },
    methods: {
      changePage(page) {
        this.$emit('page-changed', page); //自定义事件‘page-changed’，并发生事件和数据page传递给父组件
      }
    },
    computed: {
      pagesToShow() {
        let pages = [];
        let startPage = Math.max(this.currentPage - 2, 2);
        let endPage = Math.min(startPage + 4, this.totalPages - 1);
  
        if (this.currentPage === 1) {
          startPage = 2;
          endPage = Math.min(6, this.totalPages - 1);
        }
  
        if (this.currentPage === this.totalPages) {
          endPage = this.totalPages - 1;
          startPage = Math.max(this.totalPages - 5, 2);
        }
  
        for (let i = startPage; i <= endPage; i++) {
          pages.push(i);
        }
  
        return pages;
      }
    }
  }
  </script>
  
  <style scoped>
  </style>
  