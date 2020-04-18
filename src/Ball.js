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
    this.timeQuarantined = 0
    this.hasMovement = hasMovement
    this.hasCollision = true
    this.survivor = false
    this.contacts = []
  }

  checkState () {
    if (!this.hasMovement) {
      if (((!RUN.filters.stayHome &&
        this.state !== STATES.infected && this.state !== STATES.diagnosed &&
        this.state !== STATES.death) || this.state === STATES.recovered) &&
        this.timeQuarantined > TICKS_OF_INCUBATION_PERIOD + TICKS_OF_ASYMPTOM_TRANSMISSION) {
        this.timeQuarantined = 0
        this.hasMovement = true
        RUN.results['concurrent-quarantined']--
      } else {
        this.timeQuarantined++
      }
    }
    if (this.state === STATES.infected) {
      if (this.timeInfected >= TICKS_OF_ASYMPTOM_TRANSMISSION &&
        this.sketch.random(100) < DIAGNOSED_RATE) {
        RUN.results[STATES.diagnosed]++
        if (this.hasMovement) {
          RUN.results['concurrent-quarantined']++
          this.hasMovement = false
        }
        this.state = STATES.diagnosed
        // contact tracing
        if (RUN.filters.contactTracing) {
          for (let i = 0; i < this.contacts.length; i++) {
            if (this.contacts[i].hasMovement) {
              this.contacts[i].hasMovement = false
              this.contacts[i].contacts = []
              RUN.results['concurrent-quarantined']++
            }
          }
          this.contacts = []
        }
      }
    }

    if (this.state === STATES.infected || this.state === STATES.diagnosed) {
      if (RUN.filters.death && !this.survivor &&
        this.timeInfected >= TICKS_OF_ASYMPTOM_TRANSMISSION + TICKS_TO_RECOVER / 2) {
        this.survivor = this.sketch.random(100) >= MORTALITY_PERCENTATGE
        if (!this.survivor) {
          if (this.hasMovement) {
            this.hasMovement = false
          } else {
            RUN.results['concurrent-quarantined']--
          }
          RUN.results[STATES.infected]--
          if (this.state === STATES.diagnosed) {
            RUN.results[STATES.diagnosed]--
          }
          RUN.results[STATES.death]++
          this.state = STATES.death
          return
        }
      }

      if (this.timeInfected >= TICKS_TO_RECOVER + TICKS_OF_ASYMPTOM_TRANSMISSION) {
        RUN.results[STATES.infected]--
        if (this.state === STATES.diagnosed) {
          RUN.results[STATES.diagnosed]--
        }
        RUN.results[STATES.recovered]++
        this.state = STATES.recovered
      } else {
        this.timeInfected++
      }
    }

    if (this.state === STATES.exposed) {
      if (this.timeExposed >= TICKS_OF_INCUBATION_PERIOD) {
        if (this.sketch.random(100) < INFECTION_RATE) {
          this.state = STATES.infected
          RUN.results[STATES.infected]++
          RUN.results[STATES.well]--
        } else {
          this.state = STATES.well
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
        this.contacts.push(otherBall)
        otherBall.contacts.push(this)
        // both has same state, so nothing to do
        if (this.state === state) return
        // if any is recovered, then nothing happens
        if (this.state === STATES.recovered || state === STATES.recovered) return
        // then, if some is infected, then we make both infected
        if (this.state === STATES.infected && state === STATES.well) {
          otherBall.state = STATES.exposed
        } else if (state === STATES.infected && this.state === STATES.well) {
          this.state = STATES.exposed
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
