<script setup lang="ts">
import { RouterView } from 'vue-router'
import { onMounted } from 'vue'
import { useExpire } from './composables/useExpire'
import { useNightMode } from './composables/useNightMode'

const { checkAndCleanExpiredRooms } = useExpire()
const { isNightMode } = useNightMode()

onMounted(() => {
  checkAndCleanExpiredRooms()
  
  const container = document.getElementById('emojiRain')
  if (!container) return

  const dayEmojis = ['🎉', '🎊', '✨', '🌟', '💫', '🎈', '🎁', '🍻', '🥳', '🎒']
  const nightEmojis = ['🌙', '⭐', '✨', '🕯️', '🍂', '🍃', '☁️', '🦉', '🌃', '💫']

  const emojis = isNightMode.value ? nightEmojis : dayEmojis
  const count = isNightMode.value ? 8 : 15

  for (let i = 0; i < count; i++) {
    const emoji = document.createElement('div')
    emoji.className = 'emoji-drop'
    emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)]
    emoji.style.left = Math.random() * 100 + '%'
    emoji.style.animationDelay = Math.random() * 3 + 's'
    emoji.style.animationDuration = isNightMode.value 
      ? (5 + Math.random() * 4) + 's' 
      : (3 + Math.random() * 2) + 's'
    if (isNightMode.value) {
      emoji.style.opacity = '0.3'
    }
    container.appendChild(emoji)
  }
})
</script>

<template>
  <div 
    class="min-h-screen relative transition-colors duration-700"
    :class="isNightMode ? 'night-mode' : ''"
  >
    <div class="emoji-rain" id="emojiRain"></div>
    <div class="relative z-10">
      <RouterView />
    </div>
  </div>
</template>
