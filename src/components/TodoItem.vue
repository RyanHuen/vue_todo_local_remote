<template>
<div>
  <v-card  :bordered="false" :body-style="{padding:0}" class="todo-item-card" >
  <div :class="[{'flex-container__selected' : selected}, 'flex-container']">
    <div class="move-icon">
      <font-awesome-icon icon="ellipsis-v" size="xs"/>
    </div>
    <div class=""  @click="changeEventHandler">
      <span class="circle-button pointer" v-bind:class="badgeColor(todo.state)"></span>
    </div>
    <div class="flex-grow-1 no-wrap todo-text" v-bind:title="todo.comment" @click="editEventHandler">
      {{ todo.comment }}
    </div>
    <div class="" @click="editEventHandler">
      <font-awesome-icon icon="edit" size="xs" class="pointer"/>
    </div>
    <transition name="slide-fade">
      <div class="" @click="removeEventHandler" v-show="canRemove">
        <span class="pointer">×</span>
      </div>
    </transition>
  </div>
  </v-card>
</div>
</template>

<script>
import { getStateColor } from '@/util/StateColor'

export default {
  name: 'TodoItem',
  props: {
    todo: Object
  },
  data () {
    return {
    }
  },
  methods: {
    changeEventHandler: function () {
      this.$emit('changeState', this.todo.sort)
    },
    badgeColor: function (state) {
      return getStateColor(state)
    },
    editEventHandler: function () {
      this.$emit('edit', this.todo.sort)
    },
    removeEventHandler: function () {
      this.$emit('remove', this.todo.sort)
    }
  },
  computed: {
    canRemove () {
      return this.$store.getters.getCanRemove
    },
    selected () {
      return (
        this.$store.getters.getEditingValue !== null &&
        this.$store.getters.getEditingValue.sort === this.todo.sort
      )
    }
  }
}
</script>

<style>
@import '../assets/common.css';

.flex-container {
  width: 100%;
  height: auto;
  display: flex;
  padding: 0.25rem 0.5rem;
  background-color: #faf9f9;
}

.flex-container__selected {
  background-color: #108ee9bd;
}

.flex-container div {
  padding: .25rem;
}

.move-icon {
  cursor: move;
}

.todo-text {
  text-align: left;
}

.pointer {
  cursor: pointer;
}

.no-wrap {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* transition:slide-face */
.slide-fade-enter-active, .slide-fade-leave-active {
  transition: all .3s ease;
}

.slide-fade-enter, .slide-fade-leave-to {
  transform: translateX(10px);
  opacity: 0;
}

.todo-item-card {
  margin-bottom: 1em;
}
</style>
