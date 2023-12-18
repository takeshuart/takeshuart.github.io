<template>
    <div class="select">
        <select v-model='eraSelected' @change="$emit('era-changed', eraSelected)">
            <option value="">时间/时期</option>
            <option v-for="(count, interval) in eraOptions" :key="interval" :value="interval">
                {{ interval }} ({{ count }})
            </option>
        </select>
    </div>

    <div class="control">
        <input class="input" type="text" v-model="searchText"
            @keyup.enter="$emit('enter-keyup', { searchText, eraSelected })" placeholder="作品关键词">
    </div>
    <div class="control">
        <a class="button is-info" @click="$emit('filter-data', { searchText, eraSelected })">搜索</a>
    </div>
    <div class="column is-three-quarters">
        <label class="checkbox">
            <input type="checkbox" @change="$emit('checkbox-changed', isChecked)" v-model="isChecked">
            精选馆藏
        </label>
    </div>
    <!-- 根据作品名字，词频统计作为tag -->
    <!-- <div class="tags">
            <span v-for="(tag, index) in top20Tags" :key="index" class="tag is-info" @click="$emit('tag-query', tag)">
                {{ tag }}
            </span>
        </div> -->
</template>
  
<script>
export default {
    name: 'SearchComponent',
    props: ['eraOptions', ' '],
    data() {
        return {
            searchText: '',
            isChecked: false,
            eraSelected: '',//通过v-model设置默认选项，vue中selected属性无效
        };
    }
};
</script>
  