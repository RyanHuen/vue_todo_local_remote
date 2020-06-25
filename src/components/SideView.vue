<template>
  <div class="sidenav">

      <div class="modal-body">
        <div class="status-labels">
          <label class="status-label" v-for="viewOp in options" v-bind:key="viewOp.value">
            <input type="radio" v-model="todo.state" v-bind:value="viewOp.value" :disabled="readonly">
            <span class="">{{ viewOp.label }}</span>
          </label>
        </div>
      </div>

      <div class="modal-body">
        <v-input class="input-text" v-model="todo.comment" :class="{'readonly': readonly}" :readonly="readonly" type="textarea" placeholder=""></v-input>

      </div>
      <div class="modal-body">
        <v-input class="note" v-model="todo.note" rows="20" :class="{'readonly': readonly}" :readonly="readonly" type="textarea" placeholder=""></v-input>
      </div>

      <div class="modal-footer">
        <div v-if="readonly">
          <v-button type="primary" @click="readonly = false" :disabled="!canEdit">
            Edit
          </v-button>
          <v-button type="primary" @click="deleteTodo" :disabled="!canEdit">
            Delete
          </v-button>
          <v-button type="primary" @click="clear">
            Clear
          </v-button>
        </div>
        <div v-if="!readonly">
          <p class="notify-date-picker">
            <v-tag color="blue">邮件提醒时间 </v-tag>
            <v-date-picker clearable show-time v-model="todo.notifyTimestamp" @change="onDateChange"></v-date-picker>
          </p>
          <v-button type="primary" @click="update">OK</v-button>
          <v-button type="primary" @click="cancel">Cancel</v-button>
        </div>
      </div>
  </div>
</template>

<script>
import { TaskState } from '@/util/TaskState'
import { Todo } from '@/util/Todo'
import { Type } from '@/store/mutation-types'

export default {
  name: 'SideView',
  data () {
    return {
      todo: Todo,
      options: Object.values(TaskState),
      readonly: true,
      canEdit: false,
      lastTodo: Todo
    }
  },
  methods: {
    update: function () {
      if (this.readonly) return

      if (this.todo !== null && this.todo.sort !== null) {
        // commentの改行コードを削除
        this.todo.comment = this.todo.comment.replace(/\r?\n/g, '')
        this.todo.modifyTimestamp = Date.parse(new Date())
        this.lastTodo = new Todo()
        this.$store.dispatch(Type.UPDATE_TASK, this.todo)
        this.readonly = true
      }
    },
    deleteTodo: function () {
      if (this.todo !== null && this.todo.sort !== null) {
        this.$store.dispatch(Type.REMOVE_TASK, this.todo.sort)
      }
    },
    /**
     * 編集モードを終了する
     */
    cancel: function () {
      this.todo = this.lastTodo
      this.lastTodo = new Todo()
      this.readonly = true
    },
    /**
     * 表示内容をクリアする
     */
    clear: function () {
      this.$store.dispatch(Type.EDIT_MODE, {sort: null, editing: false})
    },
    onDateChange (time) {
      var stringTime = time.toString()
      var date = new Date(stringTime.replace(/-/g, '/'))
      this.todo.notifyTimestamp = date.getTime()
      console.log('change:', time)
      console.log('change:', date.getTime())
      console.log('notifyTimestamp:', this.todo.notifyTimestamp)
    }
  },
  computed: {
    editingValue () {
      return this.$store.getters.getEditingValue
    }
  },
  watch: {
    // eslint-disable-next-line
    editingValue (newVal, oldVal) {
      if (newVal !== null) {
        console.log('start:' + newVal.sort)
        this.todo = newVal
        Object.assign(this.lastTodo, newVal)
        this.canEdit = true
        this.$emit('toggle', true)
      } else {
        console.log('end')
        this.todo = new Todo()
        this.lastTodo = new Todo()
        this.canEdit = false
        this.readonly = true
        this.$emit('toggle', false)
      }
    }
  }
}
</script>

<style scoped>

.sidenav {
  margin: 30px auto 0;
  padding: 20px 10px;
  background-color: #f9f4d6;
}

.radio-label {
  font-weight: bold;
}

.modal-body {
  margin: 10px 0;
}

.modal-footer {
  margin: 5px 0;
  height: 20px;
}

.input-text {
  width: 100%;
  line-height: 1.5;
  font-size: 14px;
  padding: 2px 5px;
  resize: none;
}

.note {
  width: 100%;
  resize: vertical;
  padding: 2px 5px;
  font-size: 14px;
  line-height: 1.5;
}

.modal-default-button {
  margin-left: 10px;
  float: right;
}

.modal-default-button[disabled="disabled"] {
  opacity: 0.3;
}

.status-label span {
  margin: 0 5px;
}

.status-labels {
  display: flex;
  justify-content: space-evenly;
}

.readonly {
  /*background-color: #575757;*/
  resize: none;
}

.readonly::selection {
  /*color: white;*/
  /*background-color: blue;*/
}

.left-20 {
  padding-left: 5px;
}

.notify-date-picker {
  margin-top: 10px;
  margin-bottom: 10px;
}
</style>
