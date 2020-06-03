
export function getUnixTimestampMilles () {
  const dateTime = +new Date()
  return Math.floor(dateTime)
}
