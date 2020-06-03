<template>
  <div>
    <p style="margin-top: 50px;">
      <v-date-picker clearable show-time v-model="time1" @change="change"></v-date-picker>
    </p>
  </div>
</template>

<script>
export default {
  name: 'test-view',
  data: () => ({
    time1: '2015-12-06 23:12',
    rangeTime1: ['2015-12-06 23:12', '2016-12-06 23:12']
  }),
  methods: {
    change (time) {
      console.log('change:', time)
    }
  }
}
</script>
