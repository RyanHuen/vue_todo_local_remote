import Vue from 'vue'
import Vuex from 'vuex'
import Storage from '@/util/localStorage'
import {Todo} from '@/util/Todo'
import {TaskState} from '@/util/TaskState'
import {Type} from './mutation-types'
import axios from 'axios'
import Cookies from 'js-cookie'
import {formatDate} from '@/util/DateFormat'

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
    },
    getTodoName: (state) => {
      return state.todoName
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
      todo.notifyTimestamp = formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss')

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
    },
    [Type.SYNC_ACTION] ({ commit }) {
      // return new Promise(Storage.fetchFromRemote).then(function (result) {
      //   console.log('SYNC成功被回调')
      //   commit(Type.SYNC_ACTION, {data: result})
      // }).catch(function (reason) {
      //   // var data = JSON.parse('{"name":"打卡TODO","todo_list":[{"createTimestamp":"2020-06-03 00:07:00","modifyTimestamp":"2020-06-03 00:07:00","notifyTimestamp":"2020-06-03 00:06:00","state":1,"comment":"Test_TITLE1","note":"TEST_CONTENT1"},{"createTimestamp":"2020-06-03 00:13:00","modifyTimestamp":"2020-06-03 00:13:00","notifyTimestamp":"2020-06-03 00:11:00","state":1,"comment":"TEST_TITLE2","note":"TEST_CONTENT2"}]}')
      //   // var todoList = data['todo_list']
      //   // var todoName = data['name']
      //   // let todos = todoList
      //   // var result = {
      //   //   todoName: todoName,
      //   //   todos: todos
      //   // }
      //   // commit(Type.SYNC_ACTION, {result: result})
      //   console.log('SYNC失败被回调')
      //
      //   commit(Type.SYNC_ACTION, {result: ''})
      // })

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
            todos.forEach((todo) => {
              todo['note'] = todo.note || ''
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
