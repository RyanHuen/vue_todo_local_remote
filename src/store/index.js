import Vue from 'vue'
import Vuex from 'vuex'
import Storage from '@/util/localStorage'
import {Todo} from '@/util/Todo'
import {TaskState} from '@/util/TaskState'
import {Type} from './mutation-types'

Vue.use(Vuex)

function getFilteredArray (array, option, isAllSelected) {
  if (isAllSelected === false) {
    return array.filter(el => {
      return option.includes(el.state)
    })
  } else {
    return array.concat() // new array
  }
}

export default new Vuex.Store({
  state: {
    todos: Storage.fetch(),
    selectedState: [TaskState[0].value, TaskState[1].value],
    lastUid: 0,
    canRemove: false,
    editingTodo: null
  },
  getters: {
    // NOTE:引数あり=メソッドスタイルアクセスの場合、キャッシュされない
    // getFilteredTodos: (state) => (selectedState, isAllSelected) => {
    //   return getFilteredArray(state.todos, selectedState, isAllSelected)
    // },
    getFilteredTodos: (state) => {
      const selectedCount = state.selectedState.length
      const selectAll = Object.values(TaskState).length === selectedCount
      return getFilteredArray(
        state.todos,
        state.selectedState,
        selectAll
      )
    },
    getTodoById: (state) => (id) => {
      let index = state.todos.findIndex(v => v.id === id)
      return index >= 0 ? state.todos[index] : null
    },
    getTaskCount: (state) => (taskState) => {
      return state.todos.filter(el => {
        return taskState === -1 ? true : el.state === taskState
      }).length
    },
    getCanRemove: (state) => {
      return state.canRemove
    },
    getEditingValue: (state) => {
      return state.editingTodo
    },
    getSelectedState: (state) => {
      return state.selectedState
    }
  },
  // 状態の更新
  mutations: {
    [Type.ADD_TASK] (state, payload) {
      if (state.todos.length > 0) {
        state.lastUid = state.todos.reduce((a, b) => a.id > b.id ? a : b).id
      }
      const todo = new Todo()
      todo.id = state.lastUid + 1
      todo.comment = payload.data
      todo.state = TaskState[0].value

      state.todos.push(todo)
      Storage.save(state.todos)
    },
    [Type.REMOVE_TASK] (state, payload) {
      let index = state.todos.findIndex(v => v.id === payload.data)
      state.todos.splice(index, 1)
      Storage.save(state.todos)

      // 編集中なら削除
      if (state.editingTodo !== null && state.editingTodo.id === payload.data) {
        state.editingTodo = null
      }
    },
    [Type.CHANGE_STATE] (state, payload) {
      let index = state.todos.findIndex(v => v.id === payload.data)
      let item = state.todos[index]

      switch (item.state) {
        case TaskState[0].value:
          item.state = TaskState[1].value
          break
        case TaskState[1].value:
          item.state = TaskState[2].value
          break
        case TaskState[2].value:
          item.state = TaskState[0].value
          break
      }
      Storage.save(state.todos)

      if (state.editingTodo !== null && state.editingTodo.id === payload.data) {
        state.editingTodo.state = item.state
      }
    },
    [Type.UPDATE_TASK] (state, payload) {
      let index = state.todos.findIndex(v => v.id === payload.data.id)
      if (index >= 0) {
        Object.assign(state.todos[index], payload.data)
        Storage.save(state.todos)
      }
    },
    [Type.CHANGE_ORDER] (state, payload) {
      let srcIndex = state.todos.findIndex(v => v.id === payload.src.id)
      let destIndex = state.todos.findIndex(v => v.id === payload.dest.id)
      state.todos.splice(srcIndex, 1) // remove
      state.todos.splice(destIndex, 0, payload.src) // insert
      Storage.save(state.todos)
    },
    [Type.DELETE_DONE] (state) {
      let options = [TaskState[0].value, TaskState[1].value]
      state.todos = getFilteredArray(state.todos, options, false)
      Storage.save(state.todos)

      // 編集中なら削除
      if (state.editingTodo !== null) {
        let index = state.todos.findIndex(v => v.id === state.editingTodo.id)
        if (index < 0) {
          state.editingTodo = null
        }
      }
    },
    [Type.SWITCH_REMOVE_BTN] (state) {
      state.canRemove = !state.canRemove
    },
    [Type.EDIT_MODE] (state, payload) {
      if (payload !== null && payload.editing) {
        const index = state.todos.findIndex(v => v.id === payload.id)
        let todo = {}
        Object.assign(todo, state.todos[index]) // copy
        state.editingTodo = todo
      } else {
        state.editingTodo = null
      }
    },
    [Type.EDIT_OVERRIDE_REMOTE] (state, payload) {
      Storage.save(state.todos)
      Storage.doOverrideRemotePromise(state.todos)
    },
    [Type.EDIT_OVERRIDE_LOCAL] (state, payload) {
      Storage.save(state.todos)
      Storage.doOverrideLocalPromise(false)
    },
    [Type.CHANGE_FILTER] (state, payload) {
      state.selectedState = payload.data
    }
  },
  // データの加工、非同期処理
  actions: {
    [Type.ADD_TASK] ({commit}, title) {
      commit(Type.ADD_TASK, {data: title})
    },
    [Type.REMOVE_TASK] ({commit}, id) {
      commit(Type.REMOVE_TASK, {data: id})
    },
    [Type.CHANGE_STATE] ({commit}, id) {
      commit(Type.CHANGE_STATE, {data: id})
    },
    [Type.UPDATE_TASK] ({commit}, todo) {
      commit(Type.UPDATE_TASK, {data: todo})
    },
    [Type.CHANGE_ORDER] (context, params) {
      let filtered = context.getters.getFilteredTodos
      let origin = filtered[params.oldIndex]
      let dest = filtered[params.newIndex]
      context.commit(Type.CHANGE_ORDER, {src: origin, dest: dest})
    },
    [Type.DELETE_DONE] ({commit}) {
      commit(Type.DELETE_DONE)
    },
    [Type.SWITCH_REMOVE_BTN] ({commit}) {
      commit(Type.SWITCH_REMOVE_BTN)
    },
    [Type.EDIT_MODE] ({commit}, params) {
      commit(Type.EDIT_MODE, params)
    },
    [Type.CHANGE_FILTER] ({commit}, options) {
      commit(Type.CHANGE_FILTER, {data: options})
    },
    [Type.EDIT_OVERRIDE_REMOTE] ({commit}, id) {
      commit(Type.EDIT_OVERRIDE_REMOTE, {data: id})
    },
    [Type.EDIT_OVERRIDE_LOCAL] ({commit}, id) {
      commit(Type.EDIT_OVERRIDE_LOCAL, {data: id})
    }
  }
})

// TODO:並び替え
