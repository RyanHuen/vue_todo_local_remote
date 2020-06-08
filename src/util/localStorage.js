import axios from 'axios'
import Cookies from 'js-cookie'

export default class Storage {
  // static fetch () {
  //   let todos = JSON.parse(localStorage.getItem(STORAGE_KEY + Storage.subTodoSetIdFromPath(window.location.pathname)) || '[]')
  //   if (todos.length <= 0) {
  //     alert('本地没有数据，尝试从服务端获取!')
  //     this.doOverrideLocalPromise(true)
  //   }
  //   todos.forEach((todo) => {
  //     todo['note'] = todo.note || ''
  //   })
  //   return todos
  // }

  static save (todos) {
    // localStorage.setItem(STORAGE_KEY + Storage.subTodoSetIdFromPath(window.location.pathname), JSON.stringify(todos))
    Storage.doOverrideRemotePromise(todos, true)
  }

  static doOverrideRemotePromise (todos, retry) {
    var todoData = JSON.stringify(todos)
    var path = window.location.pathname
    var todoSetId = Storage.subTodoSetIdFromPath(path)
    var json = {'todoSetId': todoSetId, 'todo': todoData}
    console.log('存储' + todoData)
    //
    // $.ajax({
    //   url: '/test_about_post',
    //   data: JSON.stringify(todos),
    //   type: 'POST',
    //   dataType: 'json',
    //   success: function () {
    //     // console.log("fingerprint report success: " + fingerprint);
    //   }
    // })

    // var qs = require('qs')
    var instance = axios.create({
      headers: {'content-type': 'application/json', 'X-CSRFToken': Cookies.get('csrftoken')}
    })
    instance.post('/todo_list/save_todo/', JSON.stringify(json)).then(function (res) {
      var data = res.data
      console.log(data)
      return true
    }).catch(function (err) {
      console.log(err)
      return false
    }).then((saveResult) => {
      if (!saveResult) {
        if (retry) {
          if (confirm('保存云端失败,是否重试？')) {
            this.doOverrideRemotePromise(todos, false)
          }
        } else {
          alert('经过重试仍旧无法保存到云，为防止数据丢失请不要关闭页面,稍后重试！！！')
        }
      }
    })
  }

  static fetchFromRemote (resolve, reject) {
    var instance = axios.create({
      headers: {'content-type': 'application/json', 'X-CSRFToken': Cookies.get('csrftoken')}
    })
    var path = window.location.pathname
    var todoSetId = Storage.subTodoSetIdFromPath(path)
    console.log('muxi todoSetId: ' + todoSetId)
    if (todoSetId === undefined) {
      reject()
    }
    var requestJson = {'todoSetId': todoSetId}
    instance.post('/todo_list/query_todo/', JSON.stringify(requestJson)).then(function (res) {
      var data = res.data
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
          todo['id'] = index + 1
        })
        resolve(result)
      } else {
        reject()
      }
    }).catch(() => {
      reject()
    })
  }

  static subTodoSetIdFromPath (path) {
    if (path === null || path === undefined || path === '') {
      return undefined
    }
    var arraySplit = path.split('/')
    for (const item of arraySplit) {
      if (item !== null && item !== undefined && item.length === 1) {
        var idResult = parseInt(item)
        if (idResult !== null && !isNaN(idResult)) {
          return idResult
        }
      }
    }
    return undefined
  }
}
