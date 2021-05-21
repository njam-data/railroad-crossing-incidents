export function getRows (json) {
  const excludeColumns = [
    'rowid',
    'Latitude',
    'Longitude',
    'Active or Passive?',
    'geometry',
    'undefined'
  ]

  const orderColumns = [
    'CityName',
    'Street',
    'Number of accidents',
    'Total Killed',
    'Total injured',
    'Meets federal safety guidelines',
    'StateName',
    'CountyName',
    'Distance from highway (feet)',
    'Daily trains',
    'Max train speed',
    'Gates',
    'Lights',
    'Daily traffic',
    'Last time traffic counted',
    'School buses',
    'Bus count',
    'Railroad',
    'CrossingID'
  ]

  const columns = ['link', ...json.columns]

  let rows = json.rows.map((row) => {
    return columns.map((column, i) => {
      const exclude = excludeColumns.find((prop) => {
        return prop.includes(column)
      })

      if (!exclude) {
        if (column === 'link') {
          return {
            key: 'Map view',
            value: [row[12], row[11]]
          }
        }

        return {
          key: column,
          value: row[i - 1]
        }
      }
    })
    .filter((column) => !!column)
    .sort((a, b) => {
      return orderColumns.indexOf(a.key) - orderColumns.indexOf(b.key)
    })
  })

  return {
    rows,
    columns
  }
}
