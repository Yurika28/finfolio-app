const { oneHourAgo, sixHoursAgo, twelveHoursAgo, twentyFourHrsAgo } = require('../utils/dateHelpers')

const isStale = (insertedAt, ttlFn) => {
  if (!insertedAt) return true
  return new Date(insertedAt) < ttlFn()
}

const isStaleOneHour    = (d) => isStale(d, oneHourAgo)
const isStaleSixHours   = (d) => isStale(d, sixHoursAgo)
const isTwelveHours     = (d) => isStale(d, twelveHoursAgo)
const isStaleTwentyFour = (d) => isStale(d, twentyFourHrsAgo)

module.exports = { isStale, isStaleOneHour, isStaleSixHours, isTwelveHours, isStaleTwentyFour }
