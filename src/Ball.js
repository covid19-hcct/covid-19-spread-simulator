import {
  BALL_RADIUS,
  COLORS,
  MORTALITY_PERCENTATGE,
  INFECTION_RATE,
  DIAGNOSED_RATE,
  TICKS_TO_RECOVER,
  RUN,
  SPEED,
  STATES,
  TICKS_OF_INCUBATION_PERIOD,
  TICKS_OF_ASYMPTOM_TRANSMISSION
} from './options.js'
import { checkDistance } from './collisions.js'

const diameter = BALL_RADIUS * 2

export class Ball {
  constructor ({ x, y, id, state, sketch, hasMovement }) {
    this.x = x
    this.y = y
    this.vx = sketch.random(-1, 1) * SPEED
    this.vy = sketch.random(-1, 1) * SPEED
    this.sketch = sketch
    this.id = id
    this.state = state
    this.timeInfected = 0
    this.timeExposed = 0
    this.hasMovement = hasMovement
    this.hasCollision = true
    this.survivor = false
  }

  checkState () {
    if (this.state === STATES.infected) {
      if (this.timeInfected >= TICKS_OF_ASYMPTOM_TRANSMISSION && this.hasMovement &&
        this.sketch.random(100) < DIAGNOSED_RATE) {
        this.hasMovement = false
      }

      if (RUN.filters.death && !this.survivor && this.timeInfected >= TICKS_TO_RECOVER / 2) {
        this.survivor = this.sketch.random(100) >= MORTALITY_PERCENTATGE
        if (!this.survivor) {
          this.hasMovement = false
          this.state = STATES.death
          RUN.results[STATES.infected]--
          RUN.results[STATES.death]++
          return
        }
      }

      if (this.timeInfected >= TICKS_TO_RECOVER + TICKS_OF_ASYMPTOM_TRANSMISSION) {
        this.state = STATES.recovered
        RUN.results[STATES.infected]--
        RUN.results[STATES.recovered]++
      } else {
        this.timeInfected++
      }
    }
    if (this.state === STATES.exposed) {
      if (this.timeExposed >= TICKS_OF_INCUBATION_PERIOD) {
        if (this.sketch.random(100) < INFECTION_RATE) {
          this.state = STATES.infected
          RUN.results[STATES.infected]++
          RUN.results[STATES.exposed]--
        } else {
          this.state = STATES.well
          RUN.results[STATES.well]++
          RUN.results[STATES.exposed]--
        }
        // test whether convert exposed ppl to infected
      } else {
        this.timeExposed++
      }
    }
  }

  checkCollisions ({ others }) {
    if (this.state === STATES.death) return
    if (!this.hasMovement) return

    for (let i = this.id + 1; i < others.length; i++) {
      const otherBall = others[i]
      const { state, x, y, hasMovement } = otherBall
      if (state === STATES.death) continue
      if (!hasMovement) continue

      const dx = x - this.x
      const dy = y - this.y

      if (checkDistance({ dx, dy, diameter: BALL_RADIUS * 2 })) {
        // both has same state, so nothing to do
        if (this.state === state) return
        // if any is recovered, then nothing happens
        if (this.state === STATES.recovered || state === STATES.recovered) return
        // then, if some is infected, then we make both infected
        if (this.state === STATES.infected && state === STATES.well) {
          otherBall.state = STATES.exposed
          RUN.results[STATES.exposed]++
          RUN.results[STATES.well]--
        } else if (state === STATES.infected && this.state === STATES.well) {
          this.state = STATES.exposed
          RUN.results[STATES.exposed]++
          RUN.results[STATES.well]--
        }
      }
    }
  }

  move () {
    if (!this.hasMovement) return

    this.x += this.vx
    this.y += this.vy

    // check horizontal walls
    if (
      (this.x + BALL_RADIUS > this.sketch.width && this.vx > 0) ||
      (this.x - BALL_RADIUS < 0 && this.vx < 0)) {
      this.vx *= -1
    }

    // check vertical walls
    if (
      (this.y + BALL_RADIUS > this.sketch.height && this.vy > 0) ||
      (this.y - BALL_RADIUS < 0 && this.vy < 0)) {
      this.vy *= -1
    }
  }

  render () {
    const color = COLORS[this.state]
    this.sketch.noStroke()
    this.sketch.fill(color)
    this.sketch.ellipse(this.x, this.y, diameter, diameter)
  }
}
