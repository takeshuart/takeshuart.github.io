<template>
  <section class="section has-background-black pb-4 pt-5  py-1-mobile">
    <div class="container "><!-- container Automatic centering -->
      <div class="">
        <p class="title is-size-3 is-size-5-mobile has-text-white-ter mb-5">塔克鼠名画馆</p>
      </div>
    </div>
  </section>
  <section class="section is-medium pt-8 pb-10 py-0-mobile  has-background-white-bis	 ">
    <div class="columns ">
      <div class="column is-1" />
      <div class="column is-7">
        <figure class="image surpriseme-figure ">
          <a data-fancybox="gallery" :href="surpriseArtWork.bigImageUrl">
            <img class="surpriseme-image" @load="surpriseLoaded" :src="surpriseArtWork.bigImageUrl" />
          </a><!--优先展示有画框的作品-->
        </figure>
      </div>
      <div class="column is-3 py-0-mobile ">
        <div class="content has-text-left ">
          <p class="subtitle is-5 is-size-6-mobile has-text-weight-bold  mt-6 my-0-mobile">
            <span v-if="surpriseArtWork.title">{{ surpriseArtWork.title }}</span>
            <span v-if="surpriseArtWork.year"> （{{ surpriseArtWork.year }}）</span>
          </p>
          <p class="subtitle is-6 is-size-6-mobile " v-if="surpriseArtWork.artist">艺术家：{{ surpriseArtWork.artist }}</p>
          <p class="subtitle is-6 is-size-6-mobile">
            <span v-if="surpriseArtWork.museum">藏馆：{{ surpriseArtWork.museum }}</span>
            <span v-if="surpriseArtWork.location"> {{ surpriseArtWork.location }}</span>
          </p>
          <p>
            <span v-if="surpriseArtWork.shortDesc"> {{ surpriseArtWork.shortDesc }}</span>
          </p>
        </div>
      </div>
      <div class="column is-1">
        <a class="button is-large" @click="changeSurpriseArt">
          <span class="icon is-large">
            <i class="fa fa-dice-five"></i>
          </span>
        </a>
      </div>


    </div>
  </section>
  <div v-if="isSurpriseLoaded">
    <section class="section  pb-4"> <!--pt-5 padding-top size -->
      <div class="container pb-5 custom-border-bottom">
        <!-- 搜索框 -->
        <SearchComponent :eraOptions="eraOptions" :top20Tags="top20Tags" @era-changed="handleEraChange"
          @enter-keyup="handleEnter" @filter-data="doSearch" @checkbox-changed="handleCheckboxChange"
          @tag-query="handleTagQuery" />
      </div>
    </section>
    <!--内容-->
    <section class="section artbox pt-4">
      <div class="container">
        <div v-if="filtedData.length >= 0" class="has-text-grey  has-text-weight-bold mb-4">
          找到 {{ filtedData.length }} 件艺术品
        </div>
        <div v-if="dataLoaded" class="columns is-multiline is-mobile"><!--is-mobile make is-6-mobile work-->
          <div v-for="artwork in loadMoreData" :key="artwork.title" class="column is-6-mobile is-4-tablet is-4-desktop ">
            <!-- is-shadowless remove-->
            <div class="card mt-4 mt-3-tablet mt-0-mobile "> <!--mt-4 margin-top顶部边距，移动端无边距-->
              <div class="card-image	">
                <figure class="image has-background-white-bis	">
                  <a :href="artwork.bigImageUrl" data-fancybox="gallery"
                    :data-caption="artwork.title + '<br>' + artwork.dimension + '<br>' + artwork.location">
                    <img v-if="artwork.imageUrl" :src="artwork.imageUrl" :alt="artwork.title">
                  </a>
                </figure>
              </div>
            </div>
            <div class="content mt-3 mt-0-mobile">
              <p class="is-size-6 is-size-7-mobile has-text-weight-bold">
                <span>{{ artwork.title_zh || artwork.title }}</span>
                <span v-if="artwork.year">{{ ',' + artwork.year }}</span>
              </p>
              <p class="subtitle is-6 is-size-7-mobile m-1 m-0-mobile">{{ artwork.artist }}</p>
              <p class="subtitle is-6 is-size-7-mobile mt-0 hide-mobile">{{ artwork.museum }}</p>
            </div>
          </div>
        </div>
        <div v-else>哎呀，很抱歉。馆藏都被借走展览了。</div>

      </div>
    </section>
    <section class="section">
      <div>
        <div v-if="allDataLoaded" class="message">
          没有更多数据
        </div>
        <button v-else-if="showLoadMoreBtn" class="button is-medium" @click="handleLoadMoreClick">
          加载更多 ({{ currentPage }}/{{ pageCount }})
        </button>
      </div>
      <div class="mt-5">
        <a class="button" @click="scrollToTop">
          <span>返回顶部</span>
          <span class="icon is-large">
            <i class="fa-solid fa-up-long"></i>
          </span>
        </a>
      </div>
    </section>
  </div>
</template>
<script>
import axios from 'axios';
import nlp from 'compromise';
import 'bulma/css/bulma.css';
import { Fancybox } from "@fancyapps/ui"; //image gallery
import "@fancyapps/ui/dist/fancybox/fancybox.css";
//search icon: https://fontawesome.com/search
import '@fortawesome/fontawesome-free/css/all.css';
import SearchComponent from './Search.vue';


export default {
  name: 'MyComponent',
  components: {
    SearchComponent,
  },
  watch: {
    //`filtedData` has changed, maybe a search operation.
    //The function name in 'watch' must be the same as the name of the variable being watched.
    filtedData() {
      //reset some variable 
      this.autoLoadCount = 1;
      this.allDataLoaded = false
      this.currentPage = 0;
      this.pageCount = Math.ceil(this.filtedData.length / this.pageSize);
      this.loadMoreData = [];//清空页面内容，修改引用后触发vue加载新的结果集dataContent

      this.loadMore();
    },
  },

  mounted() {
    window.addEventListener('scroll', this.handleScroll);
  },
  methods: {

    //scroll to load next page
    handleScroll() {
      const scrollY = window.scrollY;//视窗以上已滑过的高度
      const windowHeight = window.innerHeight;//当前视窗高度
      const documentHeight = document.documentElement.scrollHeight; //整个文档的高度，包括下面不可见但已加载的内容
      // 当滚动到底部时，加载下一页
      const bottomOfWindow = scrollY + windowHeight >= documentHeight - 100;
      if (bottomOfWindow) {
        if (this.autoLoadCount < this.maxAutoLoad) {
          this.autoLoadCount++;
          this.loadMore();//auto load
        } else {
          this.showLoadMoreBtn = true;
        }
        // console.log(`autoLoadCount: ${this.autoLoadCount}, showLoadMoreButton:${this.showLoadMoreBtn},allDataLoaded:${this.allDataLoaded}`)
      }
    },
    doSearch(query) {
      if (query) {
        this.filtedData = this.allData.filter(item => {
          const text = `${item.year} ${item.title} ${item.museum} ${item.location} `
          return this.checkEra(item.year, query.eraSelected) &&
            (!query.searchText || text.toLowerCase().includes(query.searchText.toLowerCase()));
        });
      } else {
        this.filtedData = this.allData;
      }
    },
    handleCheckboxChange(isChecked) {
      if (isChecked) {
        this.filtedData = this.allData.filter(item => {
          return item.isHighlight == true;
        });
      } else {
        this.filtedData = this.allData;
      }
    },

    handleEraChange(eraSelected) {
      if (!eraSelected) {
        this.filtedData = this.allData
        return;
      }
      this.filtedData = this.allData.filter(item => {
        return this.checkEra(item.year, eraSelected);
      })
    },
    museumchange(museumSelected) {
      if (!museumSelected) {
        this.filtedData = this.allData
        return;
      }
      this.filtedData = this.allData.filter(item => {
        return this.checkEra(item.museum, museumSelected);
      })
    },
    handleTagQuery(tag) {
      // const tag = event.target.value;
      this.filtedData = this.allData.filter(item => {
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

    //点击一次load more,可以通过下滑页面自动加载2页。
    handleLoadMoreClick() {
      this.autoLoadCount = 1; // reset auto load
      this.showLoadMoreBtn = false;
      this.loadMore()
    },
    // changePage(newPage) {
    //   if (newPage >= 1 && newPage <= this.totalPages) {
    //     this.currentPage = newPage;
    //   }
    // }
    // ,
    loadMore() {
      const nextPage = this.currentPage + 1
      const start = (nextPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      const newItems = this.filtedData.slice(start, end);

      //页面不会重新渲染所有datacontent内容
      //vue基于虚拟DOM，根据一个dom元素的key判断是否已经加载，仅增加新内容
      this.loadMoreData = [...this.loadMoreData, ...newItems];
      this.currentPage = nextPage

      console.log(`loadMoreDataSize:${this.loadMoreData.length},allDataSize:${this.filtedData.length}`)

      if (this.loadMoreData.length >= this.filtedData.length) {
        this.allDataLoaded = true;
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
    },
    changeSurpriseArt() {
      const index = Math.floor(Math.random() * this.highlights.length);
      this.surpriseArtWork = this.highlights[index];
    },
    //surprise artwork has loaded ,then start to load content
    surpriseLoaded() {
      this.isSurpriseLoaded = true
    },
    scrollToTop() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  },
  computed: {
    totalPages() { //由dataContent的变更触发
      return Math.ceil(this.filtedData.length / this.pageSize);
    },
    // paginatedData() {//由currentPagede的变更触发
    //   const start = (this.currentPage - 1) * this.itemsPerPage;
    //   return this.dataContent.slice(start, start + this.itemsPerPage);
    // }

  },
  data() {
    return {
      allData: [],
      filtedData: [],
      loadMoreData: [],
      dataLoaded: false,
      currentPage: 1,
      pageSize: 15,
      pageCount: 0,
      eraOptions: {},
      allArtWorkNames: '',
      top20Tags: [],
      highlights: [],
      surpriseArtWork: {},
      isSurpriseLoaded: false,
      autoLoadCount: 1,
      maxAutoLoad: 3,
      showLoadMoreBtn: false,
      allDataLoaded: false
    };
  },
  created() {
    axios.get('artworks.json')
      .then(response => {
        const shuffledArray = this.shuffleArray(response.data);//random item

        const eraList = {};
        const highlights = []
        const processedData = shuffledArray.filter(item => {
          if (!item.imageUrl) { return false }

          item.imageUrl = item.imageUrl.replace(/(100px|150px|200px|128px)(?=[^/]*$)/, "300px");
          if (item.imageOriginal && item.museum.includes('Metropolitan')) {

            item.bigImageUrl = item.imageOriginal.replace(/web-large/, "orignal");//should be handled in the ELT phase.
          } else {
            item.bigImageUrl = item.imageUrl.replace(/(300px)(?=[^/]*$)/, "2000px");
          }
          //surprise me
          if (item.isHighlight) {
            highlights.push(item)
          }
          this.highlights = highlights;
          this.surpriseArtWork = highlights[0]

          //era options
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

        this.filtedData = this.allData = processedData;

        this.loadMore(); // 应用初始过滤
        this.pageCount = Math.ceil(this.allData.length / this.pageSize)
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
.custom-border-bottom {
  border-bottom: 1px solid #e3e1e1;
  /* 定义边框样式和颜色 */
}


.card-image img {
  height: 300px;
  /* 固定高度 */
  width: 350px;
  /* 宽度自适应 */
  object-fit: scale-down;
}

@media screen and (max-width: 768px) {
  .card-image img {
    height: 150px;
    width: 200px;
  }
}

@media screen and (max-width: 768px) {
  .hide-mobile {
    display: none;
  }
}


.surpriseme-figure {
  display: flex;
  justify-content: center;
  /* 水平居中 */
  align-items: center;
  /* 垂直居中 */
  overflow: hidden;
  /* 隐藏溢出的部分 */
}

.surpriseme-image {
  max-width: 100%;
  /* 图片最大宽度为其父容器宽度 */
  max-height: 600px;
  /* 只设置最大高度，让尺寸自适应父容器，这样可以避免宽图下面大块空白的问题*/
  width: auto;
  /* 宽度自适应 */
  height: auto;
  /* 高度自适应 */
  object-fit: contain;
  /* 保持图片原始长宽比 */
  object-position: center;
}

.artbox .column {
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

@media screen and (max-width: 768px) {

  /* bulma得is-*-mobile类好像只对文本有效 */
  .py-0-mobile {
    padding-top: 0 !important;
    padding-bottom: 0 !important;
  }

  .py-1-mobile {
    padding-top: 10px !important;
    padding-bottom: 5px !important;
  }

  .my-0-mobile {
    margin-top: 0 !important;
    margin-bottom: 0 !important;
  }
}
</style>