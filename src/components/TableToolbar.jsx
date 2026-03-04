'use client';

import { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import { copyTable, exportCSV, openPrintWindow } from '@/lib/tableExport';

/**
 * Reusable toolbar for tables: Copy, Excel, PDF, Print, Columns.
 *
 * Props:
 *   title       – string used for the file/window title
 *   columns     – [{ key, label }]  all column definitions
 *   visibleCols – string[]          currently visible column keys
 *   onColsChange – (keys: string[]) => void
 *   getData     – () => object[]    returns current rows as flat objects keyed by column.key
 */
export default function TableToolbar({
  title,
  columns,
  visibleCols,
  onColsChange,
  getData,
}) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target))
        setShowMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const visible = columns.filter((c) => visibleCols.includes(c.key));

  const handleCopy = async () => {
    try {
      await copyTable(visible, getData());
      toast.success('Copied to clipboard');
    } catch {
      toast.error('Failed to copy — check clipboard permissions');
    }
  };

  const handleExcel = () => {
    exportCSV(title, visible, getData());
    toast.success('CSV download started');
  };

  const handlePDF = () => openPrintWindow(`${title} — PDF`, visible, getData());
  const handlePrint = () => openPrintWindow(title, visible, getData());

  const toggleCol = (key) => {
    const next = visibleCols.includes(key)
      ? visibleCols.filter((k) => k !== key)
      : [...visibleCols, key];
    if (next.length > 0) onColsChange(next);
  };

  const btnClass =
    'px-4 py-2 text-sm font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors min-w-[70px]';

  return (
    <div className="flex flex-wrap gap-2 w-full lg:w-auto justify-start lg:justify-end">
      <button onClick={handleCopy} className={btnClass}>Copy</button>
      <button onClick={handleExcel} className={btnClass}>Excel</button>
      <button onClick={handlePDF} className={btnClass}>PDF</button>
      <button onClick={handlePrint} className={btnClass}>Print</button>

      {/* Columns toggle dropdown */}
      <div className="relative" ref={menuRef}>
        <button onClick={() => setShowMenu((v) => !v)} className={btnClass}>
          Columns
        </button>
        {showMenu && (
          <div className="absolute right-0 mt-1 w-52 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl z-50 max-h-72 overflow-y-auto">
            <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700 flex justify-between">
              <button
                className="text-xs text-blue-600 hover:underline"
                onClick={() => onColsChange(columns.map((c) => c.key))}
              >
                Show all
              </button>
              <button
                className="text-xs text-red-500 hover:underline"
                onClick={() => onColsChange([columns[0].key])}
              >
                Hide all
              </button>
            </div>
            {columns.map((col) => (
              <label
                key={col.key}
                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer text-sm text-gray-700 dark:text-gray-200"
              >
                <input
                  type="checkbox"
                  checked={visibleCols.includes(col.key)}
                  onChange={() => toggleCol(col.key)}
                  className="rounded"
                />
                {col.label}
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
