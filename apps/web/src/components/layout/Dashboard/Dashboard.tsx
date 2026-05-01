import { Responsive, useContainerWidth } from 'react-grid-layout'
import type { LayoutItem, ResponsiveLayouts } from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import type { GridItem, ThemeId, PositionUpdate } from '@focal/logic'
import { BREAKPOINTS, COLS, ROW_HEIGHT, MARGIN, CONTAINER_PADDING, MODULE_REGISTRY } from '@focal/logic'
import { ModuleWrapper } from '../ModuleWrapper/ModuleWrapper'
import { CountdownTimer } from '../../modules/CountdownTimer/CountdownTimer'
import { TodoList } from '../../modules/TodoList/TodoList'
import { NotePad } from '../../modules/NotePad/NotePad'
import { ProjectTracker } from '../../modules/ProjectTracker/ProjectTracker'
import { LavaLamp } from '../../modules/LavaLamp/LavaLamp'
import { Kaleidoscope } from '../../modules/Kaleidoscope/Kaleidoscope'
import { DateDisplay } from '../../modules/DateDisplay/DateDisplay'
import { WaveBox } from '../../modules/WaveBox/WaveBox'
import { HabitTracker } from '../../modules/HabitTracker/HabitTracker'
import { PomodoroTimer } from '../../modules/PomodoroTimer/PomodoroTimer'
import { QuickLinks } from '../../modules/QuickLinks/QuickLinks'
import { MiniCalendar } from '../../modules/MiniCalendar/MiniCalendar'
import { StickyNotes } from '../../modules/StickyNotes/StickyNotes'
import styles from './Dashboard.module.scss'

interface DashboardProps {
  items: GridItem[]
  onLayoutChange: (positions: PositionUpdate[]) => void
  onRemove: (id: string) => void
  onThemeChange: (id: string, themeId: ThemeId) => void
}

function renderModule(item: GridItem) {
  switch (item.kind) {
    case 'countdown-timer': return <CountdownTimer moduleId={item.i} />
    case 'todo-list':       return <TodoList moduleId={item.i} />
    case 'note-pad':        return <NotePad moduleId={item.i} />
    case 'project-tracker': return <ProjectTracker moduleId={item.i} />
    case 'lava-lamp':       return <LavaLamp themeId={item.themeId} />
    case 'kaleidoscope':    return <Kaleidoscope themeId={item.themeId} />
    case 'date-display':    return <DateDisplay />
    case 'wave-box':        return <WaveBox themeId={item.themeId} />
    case 'habit-tracker':   return <HabitTracker moduleId={item.i} />
    case 'pomodoro-timer':  return <PomodoroTimer />
    case 'quick-links':     return <QuickLinks moduleId={item.i} />
    case 'mini-calendar':   return <MiniCalendar moduleId={item.i} />
    case 'sticky-notes':   return <StickyNotes moduleId={item.i} />
  }
}

export function Dashboard({ items, onLayoutChange, onRemove, onThemeChange }: DashboardProps) {
  const { width, containerRef } = useContainerWidth()

  const layouts: ResponsiveLayouts = { lg: items, md: items, sm: items }

  const handleLayoutChange = (_layout: readonly LayoutItem[], allLayouts: ResponsiveLayouts) => {
    const lg = allLayouts.lg ?? []
    const positions: PositionUpdate[] = lg.map((l) => ({
      i: l.i, x: l.x, y: l.y, w: l.w, h: l.h,
    }))
    onLayoutChange(positions)
  }

  return (
    <div ref={containerRef} className={styles.container}>
      <Responsive
        className={styles.grid}
        width={width}
        layouts={layouts}
        breakpoints={BREAKPOINTS}
        cols={COLS}
        rowHeight={ROW_HEIGHT}
        margin={MARGIN}
        containerPadding={CONTAINER_PADDING}
        onLayoutChange={handleLayoutChange}
        dragConfig={{ handle: '.dragHandle', enabled: true, bounded: false, threshold: 3 }}
        resizeConfig={{ enabled: true, handles: ['se'] }}
      >
        {items.map((item) => (
          <div key={item.i}>
            <ModuleWrapper
              moduleId={item.i}
              title={MODULE_REGISTRY[item.kind].label}
              themeId={item.themeId}
              onThemeChange={(themeId) => onThemeChange(item.i, themeId)}
              onRemove={() => onRemove(item.i)}
            >
              {renderModule(item)}
            </ModuleWrapper>
          </div>
        ))}
      </Responsive>
    </div>
  )
}
