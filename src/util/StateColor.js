import { TaskState } from './TaskState'

export function getStateColor (state) {
  switch (state) {
    case TaskState[0].value:
      return 'badge-light circle-button-border'
    case TaskState[1].value:
      return 'badge-warning'
    case TaskState[2].value:
      return 'badge-success'
    default:
      return 'badge-info'
  }
}
