import {
  BALL_RADIUS,
  CANVAS_SIZE,
  DESKTOP_CANVAS_SIZE,
  STARTING_BALLS,
  RUN,
  STATIC_PEOPLE_PERCENTATGE,
  INSTALL_RATE,
  STATES
} from './options.js'

import {
  replayButton,
  stayHomeFilter,
  contactTracingFilter,
  partialContactTracingFilter
} from './dom.js'

import { Ball } from './Ball.js'

import {
  resetValues,
  updateCount
} from './results.js'

let balls = []
const matchMedia = window.matchMedia('(min-width: 800px)')

let isDesktop = matchMedia.matches

export const canvas = new window.p5(sketch => { // eslint-disable-line
  const startBalls = () => {
    let id = 0
    balls = []
    Object.keys(STARTING_BALLS).forEach(state => {
      Array.from({ length: STARTING_BALLS[state] }, () => {
        const hasMovement = RUN.filters.stayHome
          ? sketch.random(0, 100) < (100 - STATIC_PEOPLE_PERCENTATGE) || state === STATES.infected
          : true
        if (!hasMovement) {
          RUN.results['concurrent-quarantined']++
          RUN.results['max-concurrent-quarantined']++
        }

        const installedTracingApp = RUN.filters.contactTracing &&
          (!RUN.filters.partialContactTracing || sketch.random(0, 100) < INSTALL_RATE)

        balls[id] = new Ball({
          id,
          sketch,
          state,
          hasMovement,
          installedTracingApp,
          x: sketch.random(BALL_RADIUS, sketch.width - BALL_RADIUS),
          y: sketch.random(BALL_RADIUS, sketch.height - BALL_RADIUS)
        })
        id++
      })
    })
  }

  const createCanvas = () => {
    const { height, width } = isDesktop
      ? DESKTOP_CANVAS_SIZE
      : CANVAS_SIZE

    sketch.createCanvas(width, height)
  }

  sketch.setup = () => {
    createCanvas()
    startBalls()

    matchMedia.addListener(e => {
      isDesktop = e.matches
      createCanvas()
      resetValues()
      startBalls()
    })

    replayButton.onclick = () => {
      resetValues()
      startBalls()
    }

    stayHomeFilter.onchange = () => {
      RUN.filters.stayHome = !RUN.filters.stayHome
      resetValues()
      startBalls()
    }

    contactTracingFilter.onchange = () => {
      RUN.filters.contactTracing = !RUN.filters.contactTracing
      resetValues()
      startBalls()
    }

    partialContactTracingFilter.onchange = () => {
      RUN.filters.partialContactTracing = !RUN.filters.partialContactTracing
      resetValues()
      startBalls()
    }
  }

  sketch.draw = () => {
    sketch.background('white')
    balls.forEach(ball => {
      ball.checkState()
      ball.checkCollisions({ others: balls })
      ball.move()
      ball.render()
    })
    updateCount()
  }
}, document.getElementById('canvas'))
