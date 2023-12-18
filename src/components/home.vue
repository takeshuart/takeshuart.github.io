<template>
  <section class="section">
    <div class="container">

      <div class="">
        <p class="title">塔克鼠美术馆</p>
      </div>
      <!-- 搜索框 -->
      <div class="column is-full field  mb-1">
        <SearchComponent :eraOptions="eraOptions" :top20Tags="top20Tags" @era-changed="handleEraChange"
          @enter-keyup="handleEnter" @filter-data="doSearch" @checkbox-changed="handleCheckboxChange"
          @tag-query="handleTagQuery" />
      </div>
      <div v-if="dataLoaded && dataContent.length > 0" class="has-text-grey column mt-1 mb-2">
        找到 {{ dataContent.length }} 件艺术品
      </div>
    </div>
  </section>
  <!--内容-->
  <section class="section">
    <div class="container">
      <div v-if="dataLoaded" class="columns is-multiline  ">
        <div v-for="artwork in paginatedData" :key="artwork.title"
          class="column is-full-mobile is-4-tablet is-3-desktop ">
          <div class="card mt-4"> <!--mt-4 margin-top顶部边距-->
            <div class="card-image">
              <figure class="image">
                <a :href="artwork.bigImageUrl" data-fancybox="gallery"
                  :data-caption="artwork.title + '<br>' + artwork.dimension + '<br>' + artwork.location">
                  <img v-if="artwork.imageUrl" :src="artwork.imageUrl" :alt="artwork.title">
                </a>
              </figure>
            </div>
          </div>
          <div class="content mt-3">
            <h6>{{ artwork.title_zh || artwork.title }}</h6>
            <p class="subtitle is-6">{{ artwork.artist + ',' + artwork.year }}年</p>
            <p class="subtitle is-6">{{ artwork.museum }}</p>
          </div>
        </div>
      </div>
      <div v-else>em....世界名画被偷走了，追踪中...</div>
    </div>
  </section>
  <section class="section">
    <div class="column is-justify-content-center">
      <PaginationComponent v-if="totalPages > 1" :current-page="currentPage" :total-pages="totalPages"
        @page-changed="changePage" />
    </div>
  </section>
</template>
<script>
import axios from 'axios';
import nlp from 'compromise';
import 'bulma/css/bulma.css';
import { Fancybox } from "@fancyapps/ui";
import "@fancyapps/ui/dist/fancybox/fancybox.css";
import PaginationComponent from './Pagination.vue';
import SearchComponent from './Search.vue';


export default {
  name: 'MyComponent',
  components: {
    SearchComponent,
    PaginationComponent,
  },
  methods: {
    doSearch(query) {
      if (query) {
        this.dataContent = this.allData.filter(item => {
          return this.checkEra(item.year, query.eraSelected) &&
            (!query.searchText || String(item.title).toLowerCase().includes(query.searchText.toLowerCase()));
        });
      } else {
        this.dataContent = this.allData;
      }
    },
    handleCheckboxChange(isChecked) {
      if (isChecked) {
        this.dataContent = this.allData.filter(item => {
          return item.isHighlight == true;
        });
      } else {
        this.dataContent = this.allData;
      }
    },

    handleEraChange(eraSelected) {
      if (!eraSelected) {
        this.dataContent = this.allData
        return;
      }
      this.dataContent = this.allData.filter(item => {
        return this.checkEra(item.year, eraSelected);
      })
    },
    museumchange(museumSelected) {
      if (!museumSelected) {
        this.dataContent = this.allData
        return;
      }
      this.dataContent = this.allData.filter(item => {
        return this.checkEra(item.museum, museumSelected);
      })
    },
    handleTagQuery(tag) {
      // const tag = event.target.value;
      this.dataContent = this.allData.filter(item => {
        return String(item.title).toLowerCase().includes(tag.toLowerCase())
      })
    },
    checkEra(year, eraString) {
      if (!eraString) {
        return true
      }
      const [startYear, endYear] = eraString.split('-').map(Number);
      return year >= startYear && year <= endYear;
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
    handleEnter(query) {
      this.doSearch(query);
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
    calcTop20Tag() {
      //Tokenize the art names and then select the top 20 based on their frequency of occurrence.
      console.log('split word: ' + this.allArtWorkNames)
      const words = this.allArtWorkNames.split(/\s+/);
      const wordFrequency = {};
      words.forEach((word) => {
        if (word in wordFrequency) {
          wordFrequency[word]++;
        } else {
          wordFrequency[word] = 1;
        }
      })
      this.top20Tags = Object.entries(wordFrequency) //convert objects to array
        .sort((a, b) => b[1] - a[1])//sorted by second element
        .slice(0, 20) //top 20
        .map(entry => entry[0]);
      console.log(`top20tags:${this.top20Tags}`)
    },
    nplProcess() {
      let doc = nlp(this.allArtWorkNames);
      //merge n,verb,adj to one array
      let realWords = [...doc.nouns().out('array'), ...doc.verbs().out('array'), ...doc.adjectives().out('array')];

      let wordFrequency = realWords.reduce((acc, word) => {
        acc[word] = acc[word] ? acc[word] + 1 : 1;
        return acc;
      }, {});
      this.top20Tags = Object.entries(wordFrequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20)
        .map(entry => entry[0]);
    },
    calcEra(year) {
      if (!isNaN(year)) {
        //year interval select : 1600-1700(232)
        return `${Math.floor(year / 100) * 100}-${Math.floor(year / 100) * 100 + 100}`;
      }
      return null;
    }
  },
  computed: {
    totalPages() { //由dataContent的变更触发
      return Math.ceil(this.dataContent.length / this.itemsPerPage);
    },
    paginatedData() {//由currentPagede的变更触发
      const start = (this.currentPage - 1) * this.itemsPerPage;
      return this.dataContent.slice(start, start + this.itemsPerPage);
    },
  },
  data() {
    return {
      allData: [],
      dataContent: [],
      dataLoaded: false,
      currentPage: 1,
      itemsPerPage: 32,
      eraOptions: {},
      allArtWorkNames: '',
      top20Tags: [],
    };
  },
  created() {
    axios.get('translated_data.json')
      .then(response => {
        const shuffledArray = this.shuffleArray(response.data);//random item

        const eraList = {};
        const processedData = shuffledArray.filter(item => {
          if (!item.imageUrl) { return false }

          item.imageUrl = item.imageUrl.replace(/(100px|150px|200px|128px)(?=[^/]*$)/, "300px");
          item.bigImageUrl = item.imageUrl.replace(/(100px|150px|200px|128px)(?=[^/]*$)/, "1000px");

          const interval = this.calcEra(parseInt(item.year));
          if (interval) {
            eraList[interval] = (eraList[interval] || 0) + 1;
          }
          return true;
        });

        let filteredEraList = {};
        Object.keys(eraList).forEach(interval => {
          if (eraList[interval] >= 10) {
            filteredEraList[interval] = eraList[interval];
          }
        });
        this.eraOptions = filteredEraList;

        this.allData = processedData;
        this.doSearch(); // 应用初始过滤

        this.dataLoaded = true;

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

.card-image img {
  height: 350px;
  /* 固定高度 */
  width: 300px;
  /* 宽度自适应 */
  object-fit: scale-down;
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