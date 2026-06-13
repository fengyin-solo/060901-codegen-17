<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useRoom } from '@/composables/useRoom'
import { useExpire } from '@/composables/useExpire'
import { useNightMode } from '@/composables/useNightMode'
import RoomCard from '@/components/RoomCard.vue'
import { copyToClipboard } from '@/utils/helpers'

const router = useRouter()
const { activeRooms, createRoom, joinRoomByCode, error, loadRooms } = useRoom()
const { checkAndCleanExpiredRooms } = useExpire()
const { isNightMode, nightGreeting } = useNightMode()

const showCreateModal = ref(false)
const showJoinModal = ref(false)
const roomName = ref('')
const hostName = ref('')
const joinCode = ref('')
const joinName = ref('')
const copySuccess = ref(false)

onMounted(() => {
  loadRooms()
  checkAndCleanExpiredRooms()
})

const handleCreateRoom = () => {
  if (!roomName.value.trim() || !hostName.value.trim()) return
  
  const room = createRoom(roomName.value.trim(), hostName.value.trim())
  
  copyToClipboard(room.code).then(() => {
    copySuccess.value = true
    setTimeout(() => {
      copySuccess.value = false
    }, 2000)
  })
  
  showCreateModal.value = false
  router.push(`/room/${room.id}`)
}

const handleJoinRoom = () => {
  if (!joinCode.value.trim() || !joinName.value.trim()) return
  
  const room = joinRoomByCode(joinCode.value.trim(), joinName.value.trim())
  if (room) {
    showJoinModal.value = false
    router.push(`/room/${room.id}`)
  }
}

const goToRoom = (roomId: string) => {
  router.push(`/room/${roomId}`)
}

const closeModals = () => {
  showCreateModal.value = false
  showJoinModal.value = false
  error.value = null
  roomName.value = ''
  hostName.value = ''
  joinCode.value = ''
  joinName.value = ''
}
</script>

<template>
  <div 
    class="home-page min-h-screen transition-colors duration-700"
    :class="isNightMode 
      ? 'bg-gradient-to-br from-slate-900 via-indigo-950 to-gray-900' 
      : 'bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50'"
  >
    <div class="max-w-6xl mx-auto px-4 py-8">
      <header class="text-center mb-12">
        <div class="inline-flex items-center gap-3 mb-4">
          <span class="text-5xl">{{ isNightMode ? '🌙' : '🎒' }}</span>
          <h1 
            class="text-4xl md:text-5xl font-bold bg-clip-text text-transparent transition-all duration-700"
            :class="isNightMode 
              ? 'bg-gradient-to-r from-blue-300 via-indigo-300 to-slate-300' 
              : 'bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500'"
          >
            聚会话题保鲜袋
          </h1>
        </div>
        <p 
          class="text-lg max-w-2xl mx-auto transition-colors duration-700"
          :class="isNightMode ? 'text-slate-400' : 'text-gray-600'"
        >
          <template v-if="isNightMode">
            夜深了，把话题轻轻放进保鲜袋，安静地聊一会儿吧～
            <br>
            <span class="text-sm text-slate-500">话题保留 7 天后自动过期消失哦～</span>
          </template>
          <template v-else>
            提前把话题丢进保鲜袋，聚会时轮流翻牌，再也不怕冷场啦！
            <br>
            <span class="text-sm text-gray-500">话题保留 7 天后自动过期消失哦～</span>
          </template>
        </p>
        <p 
          v-if="nightGreeting"
          class="mt-3 text-sm font-medium transition-all duration-700"
          :class="isNightMode ? 'text-indigo-300/80' : ''"
        >
          {{ nightGreeting }}
        </p>
      </header>

      <div class="flex flex-wrap justify-center gap-4 mb-10">
        <button 
          class="px-8 py-3 rounded-full font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all flex items-center gap-2"
          :class="isNightMode 
            ? 'bg-gradient-to-r from-indigo-600 to-blue-700 text-indigo-100' 
            : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'"
          @click="showCreateModal = true"
        >
          <span class="text-xl">{{ isNightMode ? '🌙' : '✨' }}</span>
          {{ isNightMode ? '开个夜聊房' : '创建新房间' }}
        </button>
        <button 
          class="px-8 py-3 rounded-full font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all flex items-center gap-2 border"
          :class="isNightMode 
            ? 'bg-slate-800 text-slate-300 border-slate-700' 
            : 'bg-white text-gray-700 border-gray-200'"
          @click="showJoinModal = true"
        >
          <span class="text-xl">🚪</span>
          加入房间
        </button>
      </div>

      <div v-if="activeRooms.length > 0" class="mb-8">
        <h2 
          class="text-xl font-bold mb-4 flex items-center gap-2 transition-colors duration-700"
          :class="isNightMode ? 'text-slate-300' : 'text-gray-800'"
        >
          <span>{{ isNightMode ? '📋' : '📋' }}</span> 我的房间
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <RoomCard 
            v-for="room in activeRooms" 
            :key="room.id" 
            :room="room"
            :night-mode="isNightMode"
            @click="goToRoom(room.id)"
          />
        </div>
      </div>

      <div v-else class="text-center py-16">
        <div class="text-6xl mb-4">{{ isNightMode ? '🌙' : '🎉' }}</div>
        <p 
          class="text-lg transition-colors duration-700"
          :class="isNightMode ? 'text-slate-500' : 'text-gray-500'"
        >
          {{ isNightMode ? '夜深了，来开一局安静的夜聊吧～' : '还没有房间，创建一个开始聚会吧！' }}
        </p>
      </div>

      <div class="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div 
          class="rounded-2xl p-6 shadow-md transition-colors duration-700"
          :class="isNightMode ? 'bg-slate-800/80' : 'bg-white'"
        >
          <div class="text-3xl mb-3">{{ isNightMode ? '📝' : '📝' }}</div>
          <h3 
            class="font-bold mb-2 transition-colors duration-700"
            :class="isNightMode ? 'text-slate-200' : 'text-gray-800'"
          >
            提前丢话题
          </h3>
          <p 
            class="text-sm transition-colors duration-700"
            :class="isNightMode ? 'text-slate-400' : 'text-gray-600'"
          >
            烦心事、安利的歌、八卦、求推荐...想聊什么丢什么
          </p>
        </div>
        <div 
          class="rounded-2xl p-6 shadow-md transition-colors duration-700"
          :class="isNightMode ? 'bg-slate-800/80' : 'bg-white'"
        >
          <div class="text-3xl mb-3">{{ isNightMode ? '🎴' : '🎴' }}</div>
          <h3 
            class="font-bold mb-2 transition-colors duration-700"
            :class="isNightMode ? 'text-slate-200' : 'text-gray-800'"
          >
            洗牌翻牌
          </h3>
          <p 
            class="text-sm transition-colors duration-700"
            :class="isNightMode ? 'text-slate-400' : 'text-gray-600'"
          >
            {{ isNightMode ? '安静地翻牌，轻声聊聊心里话' : '聚会开始随机洗牌，轮流翻牌，必须聊或真心话' }}
          </p>
        </div>
        <div 
          class="rounded-2xl p-6 shadow-md transition-colors duration-700"
          :class="isNightMode ? 'bg-slate-800/80' : 'bg-white'"
        >
          <div class="text-3xl mb-3">{{ isNightMode ? '🕯️' : '🆘' }}</div>
          <h3 
            class="font-bold mb-2 transition-colors duration-700"
            :class="isNightMode ? 'text-slate-200' : 'text-gray-800'"
          >
            {{ isNightMode ? '深夜救场' : '急救功能' }}
          </h3>
          <p 
            class="text-sm transition-colors duration-700"
            :class="isNightMode ? 'text-slate-400' : 'text-gray-600'"
          >
            {{ isNightMode ? '安静了？轻轻抽一个话题，让夜聊继续' : '冷场了？点急救，从没翻过的话题里抽一个救场' }}
          </p>
        </div>
      </div>
    </div>

    <div 
      v-if="showCreateModal || showJoinModal"
      class="fixed inset-0 flex items-center justify-center z-50 p-4 transition-colors duration-700"
      :class="isNightMode ? 'bg-black/70' : 'bg-black/50'"
      @click.self="closeModals"
    >
      <div 
        class="rounded-3xl p-8 w-full max-w-md shadow-2xl transform transition-all"
        :class="isNightMode ? 'bg-slate-800' : 'bg-white'"
      >
        <div v-if="showCreateModal">
          <h2 
            class="text-2xl font-bold mb-6 text-center transition-colors duration-700"
            :class="isNightMode ? 'text-slate-200' : 'text-gray-800'"
          >
            {{ isNightMode ? '🌙 开个夜聊房' : '✨ 创建新房间' }}
          </h2>
          
          <div class="space-y-4">
            <div>
              <label 
                class="block text-sm font-medium mb-2 transition-colors duration-700"
                :class="isNightMode ? 'text-slate-400' : 'text-gray-700'"
              >
                房间名称
              </label>
              <input 
                v-model="roomName"
                type="text" 
                :placeholder="isNightMode ? '比如：深夜树洞' : '比如：周末轰趴话题袋'"
                class="w-full px-4 py-3 rounded-xl border outline-none transition-all"
                :class="isNightMode 
                  ? 'bg-slate-700 border-slate-600 text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-800' 
                  : 'border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200'"
                @keyup.enter="handleCreateRoom"
              />
            </div>
            
            <div>
              <label 
                class="block text-sm font-medium mb-2 transition-colors duration-700"
                :class="isNightMode ? 'text-slate-400' : 'text-gray-700'"
              >
                你的名字
              </label>
              <input 
                v-model="hostName"
                type="text" 
                placeholder="输入你的昵称"
                class="w-full px-4 py-3 rounded-xl border outline-none transition-all"
                :class="isNightMode 
                  ? 'bg-slate-700 border-slate-600 text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-800' 
                  : 'border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200'"
                @keyup.enter="handleCreateRoom"
              />
            </div>
          </div>
          
          <div 
            v-if="error" 
            class="mt-4 p-3 rounded-lg text-sm"
            :class="isNightMode ? 'bg-red-900/50 text-red-300' : 'bg-red-50 text-red-600'"
          >
            {{ error }}
          </div>
          
          <div class="flex gap-3 mt-6">
            <button 
              class="flex-1 px-6 py-3 rounded-xl font-medium transition-colors"
              :class="isNightMode 
                ? 'bg-slate-700 text-slate-400 hover:bg-slate-600' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
              @click="closeModals"
            >
              取消
            </button>
            <button 
              class="flex-1 px-6 py-3 text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              :class="isNightMode 
                ? 'bg-gradient-to-r from-indigo-600 to-blue-700' 
                : 'bg-gradient-to-r from-purple-500 to-pink-500'"
              :disabled="!roomName.trim() || !hostName.trim()"
              @click="handleCreateRoom"
            >
              创建
            </button>
          </div>
        </div>

        <div v-if="showJoinModal">
          <h2 
            class="text-2xl font-bold mb-6 text-center transition-colors duration-700"
            :class="isNightMode ? 'text-slate-200' : 'text-gray-800'"
          >
            🚪 加入房间
          </h2>
          
          <div class="space-y-4">
            <div>
              <label 
                class="block text-sm font-medium mb-2 transition-colors duration-700"
                :class="isNightMode ? 'text-slate-400' : 'text-gray-700'"
              >
                房间邀请码
              </label>
              <input 
                v-model="joinCode"
                type="text" 
                placeholder="输入 6 位邀请码"
                maxlength="6"
                class="w-full px-4 py-3 rounded-xl border outline-none transition-all font-mono text-center text-xl tracking-widest uppercase"
                :class="isNightMode 
                  ? 'bg-slate-700 border-slate-600 text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-800' 
                  : 'border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200'"
                @keyup.enter="handleJoinRoom"
              />
            </div>
            
            <div>
              <label 
                class="block text-sm font-medium mb-2 transition-colors duration-700"
                :class="isNightMode ? 'text-slate-400' : 'text-gray-700'"
              >
                你的名字
              </label>
              <input 
                v-model="joinName"
                type="text" 
                placeholder="输入你的昵称"
                class="w-full px-4 py-3 rounded-xl border outline-none transition-all"
                :class="isNightMode 
                  ? 'bg-slate-700 border-slate-600 text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-800' 
                  : 'border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200'"
                @keyup.enter="handleJoinRoom"
              />
            </div>
          </div>
          
          <div 
            v-if="error" 
            class="mt-4 p-3 rounded-lg text-sm"
            :class="isNightMode ? 'bg-red-900/50 text-red-300' : 'bg-red-50 text-red-600'"
          >
            {{ error }}
          </div>
          
          <div class="flex gap-3 mt-6">
            <button 
              class="flex-1 px-6 py-3 rounded-xl font-medium transition-colors"
              :class="isNightMode 
                ? 'bg-slate-700 text-slate-400 hover:bg-slate-600' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
              @click="closeModals"
            >
              取消
            </button>
            <button 
              class="flex-1 px-6 py-3 text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              :class="isNightMode 
                ? 'bg-gradient-to-r from-indigo-600 to-blue-700' 
                : 'bg-gradient-to-r from-purple-500 to-pink-500'"
              :disabled="!joinCode.trim() || !joinName.trim()"
              @click="handleJoinRoom"
            >
              加入
            </button>
          </div>
        </div>
      </div>
    </div>

    <div 
      v-if="copySuccess"
      class="fixed top-8 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-full shadow-lg z-50 flex items-center gap-2"
      :class="isNightMode ? 'bg-indigo-600 text-indigo-100' : 'bg-green-500 text-white'"
    >
      <span>✓</span>
      <span>房间码已复制到剪贴板</span>
    </div>
  </div>
</template>
