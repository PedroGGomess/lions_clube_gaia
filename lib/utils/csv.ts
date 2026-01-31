/**
 * Convert data to CSV format
 * @param data - Array of objects to convert
 * @param headers - Array of header names
 * @returns CSV string
 */
export function convertToCSV(data: any[], headers: string[]): string {
  const rows = [headers]
  
  data.forEach(item => {
    const row = headers.map(header => {
      const value = item[header] ?? ''
      // Escape quotes and wrap in quotes if contains comma or quote
      if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
        return `"${value.replace(/"/g, '""')}"`
      }
      return value
    })
    rows.push(row)
  })
  
  return rows.map(row => row.join(',')).join('\n')
}

/**
 * Download CSV file in browser
 * @param csv - CSV string content
 * @param filename - Name of the file to download
 */
export function downloadCSV(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
