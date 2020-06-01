import axios from 'axios'
import Cookies from 'js-cookie'

const STORAGE_KEY = 'vue-todolist'

export default class Storage {
  static fetch () {
    let todos = JSON.parse(localStorage.getItem(STORAGE_KEY + Storage.subTodoSetIdFromPath(window.location.pathname)) || '[]')
    if (todos.length <= 0) {
      alert('本地没有数据，尝试从服务端获取!')
      this.doOverrideLocalPromise(true)
    }
    todos.forEach((todo) => {
      todo['note'] = todo.note || ''
    })
    return todos
  }

  static save (todos) {
    localStorage.setItem(STORAGE_KEY + Storage.subTodoSetIdFromPath(window.location.pathname), JSON.stringify(todos))
  }

  static doOverrideRemotePromise (todos) {
    var todoData = JSON.stringify(todos)
    var path = window.location.pathname
    var todoSetId = Storage.subTodoSetIdFromPath(path)
    var json = {'todoSetId': todoSetId, 'todo': todoData}

    Storage.save(todos)
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
      if (saveResult) {
        alert('覆盖远端成功')
      } else {
        alert('覆盖远端失败')
      }
    })
  }

  static doOverrideLocalPromise (silent) {
    // let todos = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    // todos.forEach((todo) => {
    //   todo['note'] = todo.note || ''
    // })
    // return todos
    var instance = axios.create({
      headers: {'content-type': 'application/json', 'X-CSRFToken': Cookies.get('csrftoken')}
    })
    var path = window.location.pathname
    var todoSetId = Storage.subTodoSetIdFromPath(path)
    console.log('muxi todoSetId: ' + todoSetId)
    if (todoSetId === undefined) {
      alert('远端数据获取失败')
      return
    }
    var requestJson = {'todoSetId': todoSetId}
    instance.post('/todo_list/query_todo/', JSON.stringify(requestJson)).then(function (res) {
      var data = res.data
      console.log(data)
      if (data !== null) {
        var todoContent = data['todo_content']
        let todos = JSON.parse(todoContent)
        todos.forEach((todo) => {
          todo['note'] = todo.note || ''
        })
        Storage.save(todos)
        return true
      }
      return false
    }).catch(() => {
      if (!silent) {
        alert('远端数据获取失败')
      }
    }).then((fetchResult) => {
      if (fetchResult) {
        if (!silent) {
          alert('远端数据获取成功')
        }
        window.location.reload()
      } else {
        if (!silent) {
          alert('远端数据获取失败')
        }
      }
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
