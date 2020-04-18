const DEFAULT_FILTERS = {
  death: false,
  stayHome: false,
  contactTracing: false
}

export const CANVAS_SIZE = {
  height: 880,
  width: 360
}

export const DESKTOP_CANVAS_SIZE = {
  height: 400,
  width: 800
}

export const BALL_RADIUS = 5
export const COLORS = {
  death: '#c50000',
  recovered: '#5ABA4A',
  infected: '#ffc163',
  well: '#63C8F2',
  exposed: '#63C8F2',
  diagnosed: '#ff637a'
}

export const STATES = {
  infected: 'infected',
  well: 'well',
  recovered: 'recovered',
  death: 'death',
  exposed: 'exposed',
  diagnosed: 'diagnosed'
}

export const COUNTERS = {
  ...STATES,
  'max-concurrent-infected': 'max-concurrent-infected',
  'concurrent-quarantined': 'concurrent-quarantined',
  'max-concurrent-quarantined': 'max-concurrent-quarantined'
}

export const STARTING_BALLS = {
  [STATES.infected]: 5,
  [STATES.well]: 195,
  [STATES.recovered]: 0,
  [STATES.death]: 0,
  [STATES.exposed]: 0,
  [STATES.diagnosed]: 0,
  'max-concurrent-infected': 0,
  'concurrent-quarantined': 0,
  'max-concurrent-quarantined': 0
}

export const RUN = {
  filters: { ...DEFAULT_FILTERS },
  results: { ...STARTING_BALLS },
  tick: 0
}

export const MORTALITY_PERCENTATGE = 5
export const SPEED = 2
export const TOTAL_TICKS = 1600
export const TICKS_TO_RECOVER = 500
export const STATIC_PEOPLE_PERCENTATGE = 75

export const INFECTION_RATE = 80
export const DIAGNOSED_RATE = 1

export const TICKS_OF_INCUBATION_PERIOD = 150
export const TICKS_OF_ASYMPTOM_TRANSMISSION = 50

export const resetRun = () => {
  RUN.results = { ...STARTING_BALLS }
  RUN.tick = 0
}
