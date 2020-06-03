<template>
  <div class="header-container">
      <!-- 登録フォーム -->

    <v-button type="success" @click="doOverrideRemotePromise">本地覆盖服务端数据</v-button>
    <v-button type="success" @click="doOverrideLocalPromise">服务端覆盖本地数据</v-button>
    <v-form direction="horizontal" class="input-form" @submit.prevent="doAdd">
      <v-tag color="blue-inverse" class="form-label" for="aa">Todo</v-tag>
      <v-input type="text" placeholder="输入ToDo项" size="large" class="input-comment flex-grow-1" id="comment" ref="comment"></v-input>
      <v-button html-type="submit" size="large" type="submit" @click="doAdd">确定</v-button>
    </v-form>

      <div class="status-boxes">
        <v-checkbox :indeterminate="indeterminate" v-model="isAllSelected" @click="checkAll">
          <span class="status-label">权限</span>
          <span class="badge" v-bind:class="badgeColor(-1)">
            {{ todoCounts(-1) }}
          </span>
        </v-checkbox>

        <v-checkbox-group :data="options" v-model="filterOption" @change="setState"></v-checkbox-group>

        <v-button v-if="!$isMobile()" type="danger" class="todo-edit" @click="deleteDone">清除完成</v-button>
        <v-button v-if="!$isMobile()" type="primary" class="todo-edit" :class="{'switch-on': canRemove}" @click="switchRemoveButton">编辑</v-button>
      </div>
    </div>
</template>

<script>
import { TaskState, TaskStateValue } from '@/util/TaskState'

import { Type } from '@/store/mutation-types'
import { getStateColor } from '@/util/StateColor'

export default {
  name: 'HeaderView',
  data () {
    return {
      indeterminate: true,
      options: Object.values(TaskState),
      allOptionsValue: Object.values(TaskStateValue),
      filterOption: this.$store.getters.getSelectedState,
      isAllSelected: false,
      needFetchRemote: false
    }
  },
  methods: {
    /**
     * todoを追加する
     */
    // eslint-disable-next-line
    doAdd: function (event, value) {
      let comment = this.$refs.comment
      if (!comment.innerValue.length) return

      this.$store.dispatch(Type.ADD_TASK, comment.innerValue)

      comment.innerValue = ''
    },
    /**
     * 各ステータスのタスク数
     */
    todoCounts: function (state) {
      return this.$store.getters.getTaskCount(state)
    },
    /**
     * ステータスの色
     */
    badgeColor: function (state) {
      return getStateColor(state)
    },
    /**
     * すべて表示
     */
    selectAll: function () {
      if (!this.isAllSelected) {
        this.filterOption = []
        this.options.forEach((op) => {
          this.filterOption.push(op)
        })
      } else {
        this.filterOption = []
      }
      this.$store.dispatch(Type.CHANGE_FILTER, this.filterOption)
    },
    // filterChanged: function () {
    //   this.isAllSelected = this.options.length === this.filterOption.length
    //   this.$store.dispatch(Type.CHANGE_FILTER, this.filterOption)
    // },
    /**
     * 完了済みのタスクを削除
     */
    deleteDone: function () {
      this.$store.dispatch(Type.DELETE_DONE)
    },
    switchRemoveButton: function () {
      this.$store.dispatch(Type.SWITCH_REMOVE_BTN)
    },
    doOverrideRemotePromise: function () {
      if (confirm('是否用 "本地数据" 覆盖 "云端" ???')) { this.$store.dispatch(Type.EDIT_OVERRIDE_REMOTE) }
    },
    doOverrideLocalPromise: function () {
      if (confirm('是否用 "云端" 覆盖 "本地数据" ???')) { this.$store.dispatch(Type.EDIT_OVERRIDE_LOCAL) }
    },
    onChange (value) {
      this.filterOption = value
      this.isAllSelected = this.options.length === this.filterOption.length
      this.$store.dispatch(Type.CHANGE_FILTER, this.filterOption)
    },
    checkAll () {
      if (this.filterOption.length === this.options.length) {
        this.filterOption = []
        this.isAllSelected = false
        this.indeterminate = true
      } else {
        this.filterOption = this.allOptionsValue
        this.isAllSelected = true
        this.indeterminate = false
      }
      this.$store.dispatch(Type.CHANGE_FILTER, this.filterOption)
    },
    setState () {
      this.indeterminate = this.filterOption.length > 0 && this.filterOption.length < this.options.length
      this.isAllSelected = this.filterOption.length === this.options.length
      this.$store.dispatch(Type.CHANGE_FILTER, this.filterOption)
    }
  },
  computed: {
    canRemove () {
      return this.$store.getters.getCanRemove
    }
  },
  mounted: function () {
    this.$store.dispatch(Type.SYNC_ACTION, this.filterOption)
  }

}
</script>

<style>
@import '../assets/common.css';

.header-container {
  padding: 0 15px;
  text-align: center;
  background: white;
}

.input-form {
  display: flex;
  width: 100%;
  padding: 15px 15px 5px 15px;
  max-width: 720px;
  margin: 0 auto;
}

.form-label {
  display: flex;
  font-size: 1rem;
  line-height: 1.5;
  height: auto;
  padding: .25rem .5rem;
  text-align: center;
  vertical-align: baseline;
}

.badge {
  display: inline-block;
  padding: 2px 5px;
  text-align: center;
  border-radius: .25rem;
  vertical-align: baseline;
  font-size: 75%;
  white-space: nowrap;
  font-weight: bold;
}

.status-boxes {
  display: flex;
  justify-content: center;
}

.status-boxes label {
  padding: .5rem;
}

/* ステータスラベル */
.status-label {
  margin: 0 5px;
}

.btn-switch-green {
  color: green;
  border-color: green;
  background-color: #fff;
  margin: .25rem;
  padding: 2px 4px;
  outline: none;
}

.switch-on {
  color: #fff;
  background-color: green;
}

.btn-red {
  color: #dc3545;
  border-color: #dc3545;
  background-color: #fff;
  margin: .25rem;
  padding: 2px 4px;
  outline: none;
}

.btn-red:hover {
  color: #fff;
  background-color: #dc3545;
}

.btn-sync {
  color:  #fff;
  border-color: #dc3545;
  background-color: #0d0e17;
  margin: .25rem;
  padding: 10px 4px;
  outline: none;
}

.btn-sync:hover {
  color: #fff;
  background-color: #dc3545;
}

.todo-edit {
  margin-right: 1em;
}
</style>
