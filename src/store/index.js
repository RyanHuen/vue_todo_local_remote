import Vue from 'vue'
import Vuex from 'vuex'
import Storage from '@/util/localStorage'
import {Todo} from '@/util/Todo'
import {TaskState} from '@/util/TaskState'
import {Type} from './mutation-types'
import axios from 'axios'
import Cookies from 'js-cookie'
import {formatDate} from '@/util/DateFormat'
import global from '@/common/Common.js'

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
    todos: [],
    todoName: '正在获取',
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
    getTodoById: (state) => (sort) => {
      let index = state.todos.findIndex(v => v.sort === sort)
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
    },
    getTodoName: (state) => {
      return state.todoName
    }
  },
  // 状態の更新
  mutations: {
    [Type.ADD_TASK] (state, payload) {
      if (state.todos.length > 0) {
        state.lastUid = state.todos.reduce((a, b) => a.sort > b.sort ? a : b).sort
      }
      const todo = new Todo()
      todo.todo_item_id = payload.todo_item_id
      todo.comment = payload.data
      todo.state = TaskState[0].value
      todo.notifyTimestamp = formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss')

      state.todos.push(todo)
      Storage.save(state.todos)
    },
    [Type.REMOVE_TASK] (state, payload) {
      let index = state.todos.findIndex(v => v.sort === payload.data)
      state.todos.splice(index, 1)
      Storage.save(state.todos)

      // 編集中なら削除
      if (state.editingTodo !== null && state.editingTodo.sort === payload.data) {
        state.editingTodo = null
      }
    },
    [Type.CHANGE_STATE] (state, payload) {
      let index = state.todos.findIndex(v => v.sort === payload.data)
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

      if (state.editingTodo !== null && state.editingTodo.sort === payload.data) {
        state.editingTodo.state = item.state
      }
    },
    [Type.UPDATE_TASK] (state, payload) {
      let index = state.todos.findIndex(v => v.sort === payload.data.sort)
      if (index >= 0) {
        Object.assign(state.todos[index], payload.data)
        Storage.save(state.todos)
      }
    },
    [Type.CHANGE_ORDER] (state, payload) {
      let srcIndex = state.todos.findIndex(v => v.sort === payload.src.sort)
      let destIndex = state.todos.findIndex(v => v.sort === payload.dest.sort)
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
        let index = state.todos.findIndex(v => v.sort === state.editingTodo.sort)
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
        const index = state.todos.findIndex(v => v.sort === payload.sort)
        let todo = {}
        Object.assign(todo, state.todos[index]) // copy
        state.editingTodo = todo
      } else {
        state.editingTodo = null
      }
    },
    [Type.EDIT_OVERRIDE_REMOTE] (state, payload) {
      // Storage.save(state.todos)
      // Storage.doOverrideRemotePromise(state.todos)
    },
    [Type.EDIT_OVERRIDE_LOCAL] (state, payload) {
      // Storage.save(state.todos)
      // Storage.doOverrideLocalPromise(false)
    },
    [Type.CHANGE_FILTER] (state, payload) {
      state.selectedState = payload.data
    },
    [Type.SYNC_ACTION] (state, payload) {
      var result = payload.result
      if (result === '') {
        console.log('SYNC获取失败')
        state.todos = []
        state.todoName = '获取失败'
      } else {
        console.log('SYNC获取成功')
        state.todos = result.todos
        state.todoName = result.todoName
      }
    }
  },
  // データの加工、非同期処理
  actions: {
    [Type.ADD_TASK] ({commit}, title) {
      var instance = axios.create({
        headers: {'content-type': 'application/json', 'X-CSRFToken': Cookies.get('csrftoken')}
      })
      var todoSetId = global.todoSetId
      console.log('muxi todoSetId: ' + todoSetId)
      if (todoSetId === undefined) {
        alert('创建失败，请稍后重试')
        return
      }
      var requestJson = {'todoSetId': todoSetId, 'comment': title}
      return instance.post('/todo_list/create_new_item/', JSON.stringify(requestJson))
        .then(response => {
          var data = response.data
          console.log(data)
          if (data !== null) {
            var todoItemId = data['todo_item_id']
            commit(Type.ADD_TASK, {data: title, todo_item_id: todoItemId})
          } else {
            alert('创建失败，请稍后重试')
            console.log('数据非法')
          }
        })
        .catch(function (error) {
          console.log(error)
          alert('创建失败，请稍后重试')
        })
    },
    [Type.REMOVE_TASK] ({commit}, sort) {
      commit(Type.REMOVE_TASK, {data: sort})
    },
    [Type.CHANGE_STATE] ({commit}, sort) {
      commit(Type.CHANGE_STATE, {data: sort})
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
    [Type.EDIT_OVERRIDE_REMOTE] ({commit}, sort) {
      commit(Type.EDIT_OVERRIDE_REMOTE, {data: sort})
    },
    [Type.EDIT_OVERRIDE_LOCAL] ({commit}, sort) {
      commit(Type.EDIT_OVERRIDE_LOCAL, {data: sort})
    },
    [Type.SYNC_ACTION] ({commit}) {
      var instance = axios.create({
        headers: {'content-type': 'application/json', 'X-CSRFToken': Cookies.get('csrftoken')}
      })
      var path = window.location.pathname
      var todoSetId = Storage.subTodoSetIdFromPath(path)
      console.log('muxi todoSetId: ' + todoSetId)
      if (todoSetId === undefined) {
        commit(Type.SYNC_ACTION, {result: ''})
        return
      }
      var requestJson = {'todoSetId': todoSetId}
      return instance.post('/todo_list/query_todo/', JSON.stringify(requestJson))
        .then(response => {
          var data = response.data
          console.log(data)
          if (data !== null) {
            var todoList = data['todo_list']
            var todoName = data['name']
            let todos = todoList
            var result = {
              todoName: todoName,
              todos: todos
            }
            todos.forEach((todo, index) => {
              todo['note'] = todo.note || ''
              todo['sort'] = index
            })
            console.log('成功跑完' + result)
            commit(Type.SYNC_ACTION, {result: result})
          } else {
            console.log('数据非法')
            commit(Type.SYNC_ACTION, {result: ''})
          }
        })
        .catch(function (error) {
          console.log(error)
          commit(Type.SYNC_ACTION, {result: ''})
        })
    }
  }
})

// TODO:並び替え
