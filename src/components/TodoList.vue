<template>
  <div class="container">

    <div class="main-content">
      <div class="list-group">
        <draggable v-model="filteredTodos" @end="onDragEnd"
                  handle=".move-icon">
          <todo-item
            v-for="item in filteredTodos"
            :key="item.sort"
            :todo="item"
            @changeState="doChangeState"
            @edit="editComment"
            @remove="doRemove"></todo-item>
        </draggable>
      </div>
    </div>

    <modal-dialog v-if="isModal"
      @close="closeModal"
      v-bind:todo="editingItem"
      ></modal-dialog>
  </div>
</template>

<script>
import draggable from 'vuedraggable'
import TodoItem from './TodoItem.vue'
import ModalDialog from './ModalDialog.vue'
import { Type } from '@/store/mutation-types'

export default {
  name: 'TodoList',
  components: {
    draggable, TodoItem, ModalDialog
  },
  data () {
    return {
      isModal: false,
      editingItem: null
    }
  },
  methods: {
    /**
     * ステータスを変更する
     */
    doChangeState: function (sort) {
      this.$store.dispatch(Type.CHANGE_STATE, sort)
    },
    /**
     * 削除
     */
    doRemove: function (sort) {
      this.$store.dispatch(Type.REMOVE_TASK, sort)
    },
    /**
     * コメント編集
     */
    editComment: function (sort) {
      if (this.$isMobile()) {
        this.isModal = true
        this.editingItem = this.$store.getters.getTodoById(sort)
      } else {
        // サイドメニューに表示
        this.$store.dispatch(Type.EDIT_MODE, {sort: sort, editing: true})
      }
    },
    /**
     * モーダルを閉じる
     */
    closeModal: function () {
      this.isModal = false
      this.editingItem = null
    },
    /**
     * ドラッグ終了時
     */
    onDragEnd: function (ev) {
      // filteredTodosはすでに並び替えられている
      if (ev.oldIndex === ev.newIndex) {
        return
      }

      let params = {
        oldIndex: ev.oldIndex,
        newIndex: ev.newIndex,
        option: this.filterOption,
        isAllSelected: this.isAllSelected
      }
      this.$store.dispatch(Type.CHANGE_ORDER, params)
    }
  },
  computed: {
    filteredTodos: {
      get () {
        // return this.$store.getters.getFilteredTodos(this.filterOption, this.isAllSelected)
        return this.$store.getters.getFilteredTodos
      },
      // eslint-disable-next-line
      set(value) {
        // vuedraggable用
      }
    }
  }
}
</script>

<style scoped>
@import '../assets/common.css';

.container {
  width: 100%;
  max-width: 720px;
  padding: 0;
  margin: 0 auto;
}

.main-content {
  padding-top: 10px;
}

</style>
