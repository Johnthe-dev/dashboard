import type { ModuleKind, ModuleMeta } from '../types/modules'

export const MODULE_REGISTRY: Record<ModuleKind, ModuleMeta> = {
  'countdown-timer': {
    kind: 'countdown-timer',
    label: 'Countdown Timer',
    description: 'Visual ring timer, Time Timer style',
    defaultW: 3, defaultH: 4, minW: 2, minH: 3, maxW: 5, maxH: 6,
  },
  'todo-list': {
    kind: 'todo-list',
    label: 'To-Do List',
    description: 'Simple task checklist',
    defaultW: 3, defaultH: 4, minW: 2, minH: 3, maxW: 5, maxH: 8,
  },
  'note-pad': {
    kind: 'note-pad',
    label: 'Note Pad',
    description: 'Freeform text notes',
    defaultW: 3, defaultH: 4, minW: 2, minH: 3, maxW: 8, maxH: 8,
  },
  'project-tracker': {
    kind: 'project-tracker',
    label: 'Time Tracker',
    description: 'Concurrent project timers',
    defaultW: 3, defaultH: 5, minW: 2, minH: 3, maxW: 5, maxH: 8,
  },
  'lava-lamp': {
    kind: 'lava-lamp',
    label: 'Lava Lamp',
    description: 'Relaxing metaball animation',
    defaultW: 2, defaultH: 4, minW: 2, minH: 3, maxW: 4, maxH: 6,
  },
  kaleidoscope: {
    kind: 'kaleidoscope',
    label: 'Kaleidoscope',
    description: 'Geometric pattern visualizer',
    defaultW: 3, defaultH: 3, minW: 2, minH: 2, maxW: 5, maxH: 5,
  },
  'date-display': {
    kind: 'date-display',
    label: 'Date',
    description: 'Day, date, and month at a glance',
    defaultW: 2, defaultH: 3, minW: 2, minH: 2, maxW: 4, maxH: 4,
  },
  'wave-box': {
    kind: 'wave-box',
    label: 'Wave Box',
    description: 'Animated waves — peaceful ripples or crashing surf',
    defaultW: 3, defaultH: 3, minW: 2, minH: 2, maxW: 6, maxH: 6,
  },
  'habit-tracker': {
    kind: 'habit-tracker',
    label: 'Habit Tracker',
    description: 'Daily habit grid — track streaks',
    defaultW: 3, defaultH: 4, minW: 2, minH: 3, maxW: 6, maxH: 8,
  },
  'pomodoro-timer': {
    kind: 'pomodoro-timer',
    label: 'Pomodoro',
    description: '25/5 focus–break cycle timer',
    defaultW: 2, defaultH: 3, minW: 2, minH: 3, maxW: 4, maxH: 5,
  },
  'quick-links': {
    kind: 'quick-links',
    label: 'Quick Links',
    description: 'Pinboard of named bookmarks',
    defaultW: 2, defaultH: 3, minW: 2, minH: 2, maxW: 4, maxH: 8,
  },
  'mini-calendar': {
    kind: 'mini-calendar',
    label: 'Mini Calendar',
    description: 'Month-at-a-glance with markable dates',
    defaultW: 3, defaultH: 5, minW: 2, minH: 4, maxW: 5, maxH: 8,
  },
  'sticky-notes': {
    kind: 'sticky-notes',
    label: 'Sticky Notes',
    description: 'A pinboard of independent sticky notes',
    defaultW: 3, defaultH: 4, minW: 2, minH: 2, maxW: 8, maxH: 8,
  },
}
