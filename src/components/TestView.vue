<template>
  <div>
    <p style="margin-bottom: 16px;">
      <v-checkbox :indeterminate="indeterminate" v-model="allChecked" @click="checkAll">全选</v-checkbox>
      <v-checkbox-group :data="options" v-model="fruits" @change="setState"></v-checkbox-group>
    </p>
  </div>
</template>

<script>
export default {
  name: 'test-view',
  data () {
    return {
      indeterminate: true,
      allChecked: false,
      fruits: [0, 1],
      options: [
        {label: 'Todo', value: 0},
        {label: 'Doing', value: 1},
        {label: 'Done', value: 2}
      ],
      allFruits: [0, 1, 2]
    }
  },
  methods: {
    checkAll () {
      if (this.fruits.length === this.options.length) {
        this.fruits = []
        this.allChecked = false
        this.indeterminate = false
      } else {
        this.fruits = JSON.parse(JSON.stringify(this.allFruits))
        this.allChecked = true
        this.indeterminate = false
      }
    },
    setState () {
      this.indeterminate = this.fruits.length > 0 && this.fruits.length < this.options.length
      this.allChecked = this.fruits.length === this.options.length
    }
  }
}
</script>
