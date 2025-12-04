
const FIELD_LABELS = {
  minute: 'minute',
  hour: 'hour',
  dayOfMonth: 'day of month',
  dayOfWeek: 'day of week',
  command: 'command'
};

const FIELD_ORDER = ['minute', 'hour', 'dayOfMonth', 'month', 'dayOfWeek', 'command'];

/**
 * Format the parsed cron expression for output
 * 
 * @param {Object} parsedCron - Parsed cron data from cronParser
 * @returns {string} - Formatted output string
 */
function formatCronOutput(parsedCron) {
  const lines = [];
  const COLUMN_WIDTH = 14;

  for (const fieldName of FIELD_ORDER) {
    if (fieldName === 'month' && fieldName in parsedCron) {
      const label = 'month'.padEnd(COLUMN_WIDTH);
      const values = parsedCron.month.join(' ');
      lines.push(`${label}${values}`);
    } else if (fieldName === 'command') {
      const label = FIELD_LABELS.command.padEnd(COLUMN_WIDTH);
      lines.push(`${label}${parsedCron.command}`);
    } else if (fieldName in parsedCron) {
      const label = FIELD_LABELS[fieldName].padEnd(COLUMN_WIDTH);
      const values = parsedCron[fieldName].join(' ');
      lines.push(`${label}${values}`);
    }
  }

  return lines.join('\n');
}

module.exports = {
  formatCronOutput,
  FIELD_LABELS,
  FIELD_ORDER
};
