onmessage = event => {
  console.log('WORKER', event.data)
}

onerror = event => {
  console.error('WORKER', event.message)
}
