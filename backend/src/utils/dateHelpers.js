const oneHourAgo       = () => new Date(Date.now() - 1 * 60 * 60 * 1000)
const sixHoursAgo      = () => new Date(Date.now() - 6 * 60 * 60 * 1000)
const twelveHoursAgo   = () => new Date(Date.now() - 12 * 60 * 60 * 1000)
const twentyFourHrsAgo = () => new Date(Date.now() - 24 * 60 * 60 * 1000)
const sevenDaysAgo     = () => new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
const startOfMonth     = () => { const d = new Date(); d.setDate(1); d.setHours(0, 0, 0, 0); return d }

module.exports = { oneHourAgo, sixHoursAgo, twelveHoursAgo, twentyFourHrsAgo, sevenDaysAgo, startOfMonth }
