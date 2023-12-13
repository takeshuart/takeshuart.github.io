<template>
  <div class="content-wrapper">
    <h1>List of works by Vincent van Gogh</h1>
    <!-- 搜索框内容 -->
    <div class="search-box">
      <select v-model="selectedYear" id="year-select">
        <option value="">时间</option>
        <option v-for="year in yearOptions" :key="year" :value="year">{{ year }}年</option>
      </select>
      <input type="text" id="search-input" v-model="searchText" @keyup.enter="handleEnter" placeholder="作品关键词">
      <button id="search-button" @click="filterData">搜索</button>
    </div>
    <div v-if="dataLoaded" class="grid-container">
      <figure v-for="artwork in paginatedData" :key="artwork.catNo" class="grid-item">
        <div class="image-figcaption-wrapper">
          <div class="image-container">
            <img v-if="artwork.imageUrl" :src="artwork.imageUrl" :alt="artwork.title">
          </div>
          <div class="figcaption-container">
            <figcaption>
              <div class="title">{{ artwork.title }}</div>
              <div class="year">{{ artwork.year }}</div>
            </figcaption>
          </div>
        </div>
      </figure>
    </div>
    <div v-else>Loading data...</div>
    <div class="pagination">
      <!-- 分页导航 -->
      <div class="pagination">
        <button @click="currentPage = 1">首页</button>
        <button v-for="page in pagesToShow" :key="page" :class="{ current: page === currentPage }"
          @click="currentPage = page">
          {{ page }}
        </button>
        <button @click="currentPage = totalPages">尾页</button>
      </div>
    </div>
  </div>
</template>


<script>
import axios from 'axios';

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
      searchText: '', // 搜索文本
    };
  },
  computed: {
    totalPages() {
      return Math.ceil(this.allData.length / this.itemsPerPage);
    },
    pagesToShow() {
      let pages = [];
      let startPage = Math.max(this.currentPage - 5, 1);
      let endPage = Math.min(startPage + 9, this.totalPages);
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
        return (this.selectedYear === '' || item.year === this.selectedYear) &&
          (!this.searchText || item.title.includes(this.searchText));
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
    }
  },
  created() {
    axios.get('/artworks.json')
      .then(response => {
        this.allData = response.data;
        this.filterData(); // 应用初始过滤
        this.dataLoaded = true;
        this.yearOptions = this.getUniqueYears(this.allData);

      })
      .catch(error => {
        console.error('Error reading the JSON file', error);
      });
  }
}
</script>

<style>
.content-wrapper {
  width: 66.67%;
  /* 页面宽度的 3/2 */
  margin: 0 auto;
  /* 水平居中 */

}

/* 媒体查询 - 在小屏幕下显示两列 */
@media only screen and (width: 375px) and (height: 812px) {
  .content-wrapper {
    width: 100%;
    /* 页面宽度为100%，适用于小屏幕 */
  }

  .grid-item {
    width: calc(50% - 10px);
    /* 移动端显示两列，减去间距 */
  }
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  /* 创建一个灵活的多列布局 */
  grid-gap: 10px;
  /* 网格间距 */
}

.image-figcaption-wrapper {
  display: flex;
  /* 应用 Flexbox 布局 */
  flex-direction: column;
  /* 垂直排列子元素 */
  min-height: 300px;
  /* 设置固定的最小高度 */
}

.image-container {
  flex-grow: 1;
  /* 允许图片容器填充可用空间 */
  display: flex;
  align-items: center;
  /* 垂直居中图片 */
  justify-content: center;
  /* 水平居中图片 */
  margin-bottom: 10px;
  /* 在图片容器底部添加间距 */

}

.grid-item img {
  max-width: 100%;
  /* 图片最大宽度 */
  max-height: 100%;
  /* 图片最大高度 */
  display: block;
}

.figcaption-container {
  flex-grow: 0;
  /* 防止文本部分占据额外空间 */
}

h1 {
  margin-bottom: 20px;
  /* 你可以根据需要调整间距大小 */
  align-items: center;
  /* 垂直居中 */
  justify-content: center;
  /* 水平居中 */
}

.title,
.year {
  text-align: center;
}

.title {
  font-size: 16px;
  /* 较大的字体大小 */
  font-family: 'Georgia', serif;
  /* 圆润的字体 */
  margin-bottom: 10px;
  /* 底部添加间距 */
  font-weight: bold;
  /* 加粗字体 */
}

.year {
  font-size: 14px;
  /* 较小的字体大小 */
  font-family: Arial, sans-serif;
  /* 标准字体 */
}

.pagination {
  margin-top: 30px;
  /* 与上面容器的间距 */
  display: flex;
  /* 使用 Flexbox 布局 */
  align-items: center;
  /* 垂直居中 */
  justify-content: center;
  /* 水平居中 */
}

.pagination button {
  align-items: center;
  background: transparent;
  border: 2px solid #666;
  /* 添加边框 */
  border-radius: 4px;
  color: #333;
  /* 根据需要调整颜色 */
  display: inline-flex;
  font-family: var(--met-sans), sans-serif;
  /* 使用备用字体 */
  font-size: 1em;
  font-weight: 500;
  justify-content: center;
  padding: 8px 12px;
  /* 添加一些内边距 */
  cursor: pointer;
  /* 鼠标悬停时显示指针 */
  margin-right: 6px;
  /* 添加按钮之间的间距 */
}

.pagination button.current {
  background-color: #666;
  /* 当前页面按钮的背景颜色 */
  color: white;
  border-color: #666;
  /* 当前页面按钮的边框颜色 */

}

.pagination button:hover {
  background-color: #ddd;
  /* 鼠标悬停时按钮的背景颜色 */
  border-color: #ddd;
  /* 鼠标悬停时按钮的边框颜色 */

}

.search-box {
  display: flex;
  align-items: center;
  background-color: #fff;
  /* Adjust the background color as needed */
  border: 1px solid #ccc;
  /* Adjust the border color as needed */
  border-radius: 4px;
  padding: 5px;
  /* Adjust the padding as needed */
  margin-bottom: 20px;
  /* Space below the search box */
  width: auto;
  /* Adjust the width as needed, or set a max-width */
  max-width: 600px;
  /* Example max-width */
  margin-left: auto;
  /* Centers the search box if within a container */
  margin-right: auto;
  /* Centers the search box if within a container */
}

#year-select {
  border: 1px solid #ccc;
  /* Give the dropdown a border */
  margin-right: 10px;
  /* Space between select and input */
  padding: 10px;
  border-radius: 4px;
  position: relative;
  background-size: 12px;
  /* Adjust size as needed */
  -moz-appearance: none;
  /* Remove default styling in Firefox */
  -webkit-appearance: none;
  /* Remove default styling in Chrome and Safari */
  appearance: none;
  cursor: pointer;
}

#search-input {
  flex-grow: 1;
  border: 1px solid #ccc;
  /* Give the input a border */
  padding: 10px;
  margin-right: 10px;
  /* Space between input and button */
  max-width: 300px;
  /* Set a max-width for the input field */
}

#search-button {
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  background-color: white;
  color: black;
  /* 默认文字颜色 */
  border: 1px solid #ccc;
}

/* Optional: add some hover effects */
#search-button:hover {
  background-color: #666;
  /* Darker shade for hover effect */
}

/* Hide the focus outline to match the styling in the image */
#year-select:focus,
#search-input:focus,
#search-button:focus {
  outline: none;
}

/* Responsive to the resizing of the window */
@media (max-width: 600px) {
  .search-box {
    flex-direction: column;
  }

  #year-select,
  #search-input,
  #search-button {
    margin-right: 0;
    margin-bottom: 10px;
    /* Space between elements when stacked */
  }
}</style>