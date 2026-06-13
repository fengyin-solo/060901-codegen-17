import { ref, computed, onMounted, onUnmounted } from 'vue'

const NIGHT_START = 22
const NIGHT_END = 6

const isNightMode = ref(false)
let timer: ReturnType<typeof setInterval> | null = null
let dependencyCount = 0

function checkNightMode() {
  const hour = new Date().getHours()
  isNightMode.value = hour >= NIGHT_START || hour < NIGHT_END
}

export function useNightMode() {
  const nightGreeting = computed(() => {
    if (!isNightMode.value) return ''
    const hour = new Date().getHours()
    if (hour >= 22 && hour < 24) return '夜深了，放慢脚步，享受安静的夜聊时光 🌙'
    if (hour >= 0 && hour < 3) return '凌晨了，还在聊呀，注意休息哦 🌜'
    if (hour >= 3 && hour < 6) return '天快亮了，珍惜这段深夜的陪伴 🌄'
    return ''
  })

  const nightHint = computed(() => {
    if (!isNightMode.value) return ''
    const hour = new Date().getHours()
    if (hour >= 22 && hour < 24) return '夜深了，轻声聊聊吧～'
    if (hour >= 0 && hour < 3) return '夜深人静，小声一点哦～'
    if (hour >= 3 && hour < 6) return '凌晨时分，温柔一点吧～'
    return ''
  })

  onMounted(() => {
    dependencyCount++
    if (!timer) {
      checkNightMode()
      timer = setInterval(checkNightMode, 60_000)
    }
  })

  onUnmounted(() => {
    dependencyCount--
    if (dependencyCount <= 0 && timer) {
      clearInterval(timer)
      timer = null
      dependencyCount = 0
    }
  })

  return {
    isNightMode,
    nightGreeting,
    nightHint,
  }
}
