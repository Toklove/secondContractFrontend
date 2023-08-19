<script setup>
function parse(query) {
  const qs = {}
  const i = query.indexOf('?')
  if (i < 0 && !query.includes('='))
    return qs
  else if (i >= 0)
    query = query.substring(i + 1)

  const parts = query.split('&')
  for (let n = 0; n < parts.length; n++) {
    const part = parts[n]
    let key = part.split('=')[0]
    const val = part.split('=')[1]
    key = key.toLowerCase()
    if (typeof qs[key] === 'undefined') {
      qs[key] = decodeURIComponent(val)
    } else if (typeof qs[key] === 'string') {
      const arr = [qs[key], decodeURIComponent(val)]
      qs[key] = arr
    } else {
      qs[key].push(decodeURIComponent(val))
    }
  }
  return qs
}
function init() {
  (function (m, ei, q, i, a, j, s) {
    m[i]
      = m[i]
      || function () {
        (m[i].a = m[i].a || []).push(arguments)
      };
    (j = ei.createElement(q)), (s = ei.getElementsByTagName(q)[0])
    j.async = true
    j.charset = 'UTF-8'
    j.src = 'https://static.meiqia.com/widget/loader.js'
    s.parentNode.insertBefore(j, s)
  })(window, document, 'script', '_MEIQIA')
  const data = parse(window.location.search)
  let entId = data.entid || data.eid
  if (Object.prototype.toString.call(entId) === '[object Array]')
    entId = +entId[0]
  else
    entId = +entId

  _MEIQIA('entId', '8a178455b9bb5ec46e361420768ea1e7' || entId)
  _MEIQIA('standalone', (config) => {
    if (config.color)
      document.body.style['background-color'] = `#${config.color}`

    if (config.url) {
      document.body.style['background-image'] = `url(${config.url})`
      document.body.style['background-repeat'] = 'no-repeat'
      document.body.style['background-size'] = '100% 100%'
    }
  })
  _MEIQIA('withoutBtn')
  if (data.metadata) {
    try {
      const metadata = JSON.parse(data.metadata)
      _MEIQIA('metadata', metadata)
    } catch (e) { }
  }
  if (data.encryptedmetadata)
    _MEIQIA('encryptedmetadata', data.encryptedmetadata)

  if (data.requestperms)
    localStorage.setItem('requestperms', data.requestperms)

  if (data.language) {
    if (data.languagelocal !== 'true')
      _MEIQIA('language', data.language)
  }
  if (data.languagelocal === 'true')
    _MEIQIA('languageLocal', true)

  if (data.subsource)
    _MEIQIA('subSource', data.subsource)

  if (data.fallback)
    _MEIQIA('fallback', +data.fallback)

  if (data.clientid)
    _MEIQIA('clientId', data.clientid)

  if (data.agentid || data.groupid)
    _MEIQIA('assign', { agentToken: data.agentid || null, groupToken: data.groupid || null })

  _MEIQIA('showPanel', {
    greeting: data.greeting || '',
    agentToken: data.agentid || null,
    groupToken: data.groupid || null,
  })
}
onBeforeMount(() => init())
</script>

<template>
</template>

<style scoped lang="scss">

</style>
