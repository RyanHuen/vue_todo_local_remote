const todoSetId = subTodoSetIdFromPath(window.location.pathname)
export default
{
  todoSetId // setId
}

function subTodoSetIdFromPath (path) {
  if (path === null || path === undefined || path === '') {
    console.log('get SetId: ' + -1)
    return -1
  }
  const arraySplit = path.split('/')
  for (const item of arraySplit) {
    if (item !== null && item !== undefined && item.length === 1) {
      const idResult = parseInt(item)
      if (idResult !== null && !isNaN(idResult)) {
        console.log('get SetId: ' + idResult)
        return idResult
      }
    }
  }
  console.log('get SetId: ' + -1)
  return -1
}
