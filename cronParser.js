
const FIELD_CONSTRAINTS = {
  minute: { min: 0, max: 59 },
  hour: { min: 0, max: 23 },
  dayOfMonth: { min: 1, max: 31 },
  month: { min: 1, max: 12 },
  dayOfWeek: { min: 0, max: 7 }
};

const FIELD_NAMES = ['minute', 'hour', 'dayOfMonth', 'month', 'dayOfWeek'];

function parseField(expression, fieldName) {
  const { min, max } = FIELD_CONSTRAINTS[fieldName];
  const values = new Set();

  const parts = expression.split(',');

  for (const part of parts) {
    if (part.includes('/')) {
      const [rangePart, step] = part.split('/');
      const stepValue = parseInt(step);

      if (isNaN(stepValue) || stepValue <= 0) {
        throw new Error(`Invalid step value in expression: ${part}`);
      }

      if (rangePart === '*') {
        for (let i = min; i <= max; i += stepValue) {
          values.add(i);
        }
      } else if (rangePart.includes('-')) {
        const [start, end] = rangePart.split('-').map(Number);
        if (isNaN(start) || isNaN(end)) {
          throw new Error(`Invalid range in expression: ${rangePart}`);
        }
        for (let i = start; i <= end; i += stepValue) {
          if (i >= min && i <= max) {
            values.add(i);
          }
        }
      } else {
        throw new Error(`Invalid step expression: ${part}`);
      }
    } else if (part === '*') {
      for (let i = min; i <= max; i++) {
        values.add(i);
      }
    } else if (part.includes('-')) {
      const [start, end] = part.split('-').map(Number);
      if (isNaN(start) || isNaN(end)) {
        throw new Error(`Invalid range in expression: ${part}`);
      }
      for (let i = start; i <= end; i++) {
        if (i >= min && i <= max) {
          values.add(i);
        }
      }
    } else {
      const value = parseInt(part);
      if (isNaN(value)) {
        throw new Error(`Invalid value in expression: ${part}`);
      }
      if (fieldName === 'dayOfWeek' && value === 7) {
        values.add(0);
      } else if (value >= min && value <= max) {
        values.add(value);
      } else {
        throw new Error(
          `Value ${value} is out of range [${min}, ${max}] for field ${fieldName}`
        );
      }
    }
  }

  if (values.size === 0) {
    throw new Error(`No valid values found for field: ${fieldName}`);
  }

  return Array.from(values).sort((a, b) => a - b);
}

function parseCronExpression(cronExpression) {
  const parts = cronExpression.trim().split(/\s+/);

  if (parts.length < 6) {
    throw new Error(
      `Invalid cron expression. Expected 6 parts, got ${parts.length}`
    );
  }

  const command = parts.slice(5).join(' ');
  const fieldExpressions = parts.slice(0, 5);

  const result = {};

  for (let i = 0; i < FIELD_NAMES.length; i++) {
    const fieldName = FIELD_NAMES[i];
    result[fieldName] = parseField(fieldExpressions[i], fieldName);
  }

  result.command = command;

  return result;
}

module.exports = {
  parseCronExpression,
  parseField,
  FIELD_CONSTRAINTS,
  FIELD_NAMES
};
