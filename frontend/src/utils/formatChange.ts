export const formatChange = (value: number, suffix = '%'): string =>
  `${value >= 0 ? '+' : ''}${value.toFixed(2)}${suffix}`

export const changeColor = (value: number): string =>
  value >= 0 ? 'text-green-400' : 'text-red-400'
