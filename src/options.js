const DEFAULT_FILTERS = {
  death: false,
  stayHome: false
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
  recovered: '#D88DBC',
  infected: '#5ABA4A',
  well: '#63C8F2',
  exposed: '#aaaaaa'
}

export const STATES = {
  infected: 'infected',
  well: 'well',
  recovered: 'recovered',
  death: 'death',
  exposed: 'exposed'
}

export const COUNTERS = {
  ...STATES,
  'max-concurrent-infected': 'max-concurrent-infected'
}

export const STARTING_BALLS = {
  [STATES.infected]: 0,
  [STATES.well]: 190,
  [STATES.recovered]: 0,
  [STATES.death]: 0,
  [STATES.exposed]: 10,
  'max-concurrent-infected': 0
}

export const RUN = {
  filters: { ...DEFAULT_FILTERS },
  results: { ...STARTING_BALLS },
  tick: 0
}

export const MORTALITY_PERCENTATGE = 5
export const SPEED = 3
export const TOTAL_TICKS = 1600
export const TICKS_TO_RECOVER = 500
export const STATIC_PEOPLE_PERCENTATGE = 25

export const QUARANTINE_DISTANCE = 5

export const INFECTION_RATE = 50
export const DIAGNOSED_RATE = 1

export const TICKS_OF_INCUBATION_PERIOD = 50
export const TICKS_OF_ASYMPTOM_TRANSMISSION = 350

export const resetRun = () => {
  RUN.results = { ...STARTING_BALLS }
  RUN.tick = 0
}
