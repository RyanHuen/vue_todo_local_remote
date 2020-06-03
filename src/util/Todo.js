export class Todo {
  constructor () {
    this.id = -1
    this.comment = ''
    this.state = 0
    this.note = ''
    this.createTimestamp = Date.parse(new Date())
    this.modifyTimestamp = Date.parse(new Date())
    this.notifyTimestamp = 0
  }
}
