/**
 * Copies tab-separated table data to the clipboard.
 */
export async function copyTable(columns, rows) {
  const header = columns.map((c) => c.label).join('\t');
  const body = rows
    .map((row) => columns.map((c) => String(row[c.key] ?? '')).join('\t'))
    .join('\n');
  await navigator.clipboard.writeText(`${header}\n${body}`);
}

/**
 * Downloads a CSV file (opens in Excel).
 * Includes a BOM so Excel reads UTF-8 correctly.
 */
export function exportCSV(filename, columns, rows) {
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const header = columns.map((c) => esc(c.label)).join(',');
  const body = rows.map((row) =>
    columns.map((c) => esc(row[c.key] ?? '')).join(',')
  );
  const csv = [header, ...body].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Opens a new window with an HTML table and triggers the print dialog.
 * When the user selects "Save as PDF" in the print dialog it becomes a PDF.
 */
export function openPrintWindow(title, columns, rows) {
  const headerHTML = columns.map((c) => `<th>${c.label}</th>`).join('');
  const bodyHTML = rows
    .map(
      (row) =>
        `<tr>${columns
          .map((c) => `<td>${row[c.key] ?? ''}</td>`)
          .join('')}</tr>`
    )
    .join('');

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>${title}</title>
  <style>
    body { font-family: Arial, sans-serif; font-size: 12px; margin: 20px; }
    h2 { margin-bottom: 4px; }
    p { margin: 0 0 12px; color: #666; font-size: 11px; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #f5f5f5; font-weight: bold; }
    th, td { border: 1px solid #ccc; padding: 6px 8px; text-align: left; }
    tr:nth-child(even) { background: #fafafa; }
    @media print { body { margin: 10mm; } }
  </style>
</head>
<body>
  <h2>${title}</h2>
  <p>Generated: ${new Date().toLocaleString()}</p>
  <table>
    <thead><tr>${headerHTML}</tr></thead>
    <tbody>${bodyHTML}</tbody>
  </table>
</body>
</html>`;

  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 400);
}
