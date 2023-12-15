<template>
  <div  class="content-wrapper">
      <div class="hero-body is-small">
        <p class="title">塔克鼠美术馆</p>
      </div>
    <h1></h1>
    <!-- 搜索框 -->
    <div class="field has-addons column is-two-thirds  is-offset-1   mb-1">
      <div class="control">
        <div class="select">
          <select v-model="selectedYear">
            <option value="">时间</option>
            <option v-for="year in yearOptions" :key="year" :value="year">{{ year }}年</option>
          </select>
        </div>
      </div>
      <div class="control">
        <div class="select"> 
          <select v-model="selectedArtist">
            <option value="">艺术家</option>
            <option v-for="at in artistOptions" :key="at" :value="at">{{ at }}</option>
          </select>
        </div>
      </div>
      <div class="control is-expanded">
        <input class="input" type="text" v-model="searchText" @keyup.enter="handleEnter" placeholder="作品关键词">
      </div>
      <div class="control">
        <button class="button is-info" @click="filterData">搜索</button>
      </div>
    </div>
    <div v-if="dataLoaded && dataContent.length > 0" class="has-text-grey column mt-1 mb-2">
      找到 {{ dataContent.length }} 件艺术品
    </div>

    <!--内容-->
    <div v-if="dataLoaded" class="columns is-multiline is-variable is-6">
      <div v-for="artwork in paginatedData" :key="artwork.catNo" class="column is-6-mobile is-4-tablet is-3-desktop">
        <div class="card">
          <div class="card-image">
            <figure class="image">
              <a :href="artwork.bigImageUrl" data-fancybox="gallery"
                :data-caption="artwork.title + '<br>' + artwork.dimension + '<br>' + artwork.location">
                <img v-if="artwork.imageUrl" :src="artwork.imageUrl" :alt="artwork.title">
              </a>
            </figure>
          </div>
        </div>

        <div class="content align-bottom">
          <h6>{{ artwork.title_zh || artwork.title }}</h6>
          <p class="subtitle is-6">{{ artwork.artist + ',' + artwork.year }}年</p>
        </div>
      </div>

    </div>
    <div v-else>em....世界名画被偷走了，追踪中...</div>
    <nav class="pagination is-rounded column is-half is-offset-one-quarter" role="navigation" aria-label="pagination"
      v-if="totalPages > 1">
      <ul class="pagination-list">
        <li><a class="pagination-link" @click="changePage(1)" :class="{ 'is-current': currentPage === 1 }"
            aria-label="Goto page 1">1</a></li>
        <li v-if="currentPage > 3"><span class="pagination-ellipsis">&hellip;</span></li>
        <li v-for="page in pagesToShow" :key="page">
          <a class="pagination-link" @click="changePage(page)" :class="{ 'is-current': page === currentPage }"
            :aria-label="'Goto page ' + page">{{ page }}</a>
        </li>
        <li v-if="currentPage < totalPages - 2"><span class="pagination-ellipsis">&hellip;</span></li>
        <li v-if="totalPages > 1"><a class="pagination-link" @click="changePage(totalPages)"
            :class="{ 'is-current': currentPage === totalPages }" :aria-label="'Goto page ' + totalPages">{{ totalPages
            }}</a></li>
      </ul>
    </nav>

  </div>
</template>


<script>
import axios from 'axios';
import 'bulma/css/bulma.css';
import { Fancybox } from "@fancyapps/ui";
import "@fancyapps/ui/dist/fancybox/fancybox.css";

export default {
  name: 'MyComponent',
  data() {
    return {
      allData: [],
      dataContent: [],
      dataLoaded: false,
      currentPage: 1,
      itemsPerPage: 20,
      yearOptions: [], // 年份选项
      selectedYear: '', // 选中的年份
      selectedArtist: '', // 默认选中
      searchText: '', // 搜索文本
    };
  },
  computed: {
    totalPages() {
      return Math.ceil(this.dataContent.length / this.itemsPerPage);
    },
    pagesToShow() {
      let pages = [];
      let startPage = Math.max(this.currentPage - 2, 2); // 从第2页开始显示
      let endPage = Math.min(startPage + 4, this.totalPages - 1); // 最多显示5个页码，不包括第1页和最后一页

      if (this.currentPage === 1) {
        startPage = 2; // 如果是第一页，从第2页开始显示
        endPage = Math.min(6, this.totalPages - 1); // 显示后面5个页码
      }

      if (this.currentPage === this.totalPages) {
        endPage = this.totalPages - 1; // 如果是最后一页，显示到倒数第二页
        startPage = Math.max(this.totalPages - 5, 2); // 显示前面5个页码
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      return pages;
    },
    paginatedData() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      return this.dataContent.slice(start, start + this.itemsPerPage);
    },
  },
  methods: {
    filterData() {
      this.dataContent = this.allData.filter(item => {
        item.title
        return (this.selectedYear === '' || item.year === this.selectedYear) &&
          (this.selectedArtist === '' || item.artist === this.selectedArtist) &&
          (!this.searchText || String(item.title).toLowerCase().includes(this.searchText.toLowerCase()));
      });
    },
    getUniqueYears(data) {
      const years = new Set();
      data.forEach(item => {
        if (item.year) {
          years.add(item.year);
        }
      });
      return Array.from(years);
    },
    handleEnter() {
      this.filterData();
    },
    changePage(newPage) {
      if (newPage >= 1 && newPage <= this.totalPages) {
        this.currentPage = newPage;
      }
    },
    shuffleArray(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    },

  },
  created() {
    axios.get('translated_data.json')
      .then(response => {
        const shuffledArray = this.shuffleArray(response.data);//random item
        const processedData = shuffledArray.map(item => {
          if (item.imageUrl) {
            item.imageUrl = item.imageUrl.replace(/100px(?=[^/]*$)/, "200px");
            item.bigImageUrl = item.imageUrl.replace(/(100px|150px|200px)(?=[^/]*$)/, "1000px");
          }
          return item;
        })
        this.allData = processedData;
        console.log(processedData)
        this.filterData(); // 应用初始过滤
        this.dataLoaded = true;

        const years = new Set();
        const artists = new Set();
        this.allData.forEach(item => {
          if (item.year) {
            years.add(item.year);
          }
          if(item.artist){
            artists.add(item.artist)
          }
        });

        this.yearOptions = years;
        this.artistOptions = artists;
        Fancybox.bind("[data-fancybox]", {
          Thumbs: {
            showOnStart: false, //hide thumbnails initially
          }
        });
        Fancybox.Thumbs = false;

      })
      .catch(error => {
        console.error('Error reading the JSON file', error);
      });
  }
}
</script>

<style>
.content-wrapper {
  width: 60%;
  margin: 0 auto;
}

.card {
  box-shadow: none;
  /* Use this to remove the shadow */
}

.column {
  display: flex;
  flex-wrap: wrap;
  /* 使卡片在一行放不下时换行 */
  justify-content: center;
  /* 水平居中 */
  align-items: center;
  /* 垂直居中 */
}

.align-bottom {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  /* 垂直对齐到底部 */
}


@media (max-width: 768px) {
  .column.is-6-mobile {
    flex: 0 0 50%;
    /* 在移动设备上占用50%的宽度 */
    max-width: 50%;
    /* 最大宽度为50% */
  }
}
</style>