const { formatCronOutput } = require('../src/formatter');

describe('Formatter', () => {
  test('should format example from spec', () => {
    const parsed = {
      minute: [0, 15, 30, 45],
      hour: [0],
      dayOfMonth: [1, 15],
      month: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      dayOfWeek: [1, 2, 3, 4, 5],
      command: '/usr/bin/find'
    };

    const output = formatCronOutput(parsed);
    const lines = output.split('\n');

    expect(lines[0]).toBe('minute        0 15 30 45');
    expect(lines[1]).toBe('hour          0');
    expect(lines[2]).toBe('day of month  1 15');
    expect(lines[3]).toBe('month         1 2 3 4 5 6 7 8 9 10 11 12');
    expect(lines[4]).toBe('day of week   1 2 3 4 5');
    expect(lines[5]).toBe('command       /usr/bin/find');
  });

  test('should have correct column width', () => {
    const parsed = {
      minute: [0],
      hour: [0],
      dayOfMonth: [1],
      month: [1],
      dayOfWeek: [0],
      command: 'test'
    };

    const output = formatCronOutput(parsed);
    const lines = output.split('\n');

    // Each line should have field name padded to 14 characters
    lines.forEach((line) => {
      const contentStart = line.substring(0, 14);
      expect(contentStart.length).toBe(14);
    });
  });

  test('should format single value fields', () => {
    const parsed = {
      minute: [5],
      hour: [14],
      dayOfMonth: [15],
      month: [6],
      dayOfWeek: [3],
      command: '/bin/test'
    };

    const output = formatCronOutput(parsed);
    
    expect(output).toContain('minute        5');
    expect(output).toContain('hour          14');
    expect(output).toContain('day of month  15');
    expect(output).toContain('month         6');
    expect(output).toContain('day of week   3');
    expect(output).toContain('command       /bin/test');
  });

  test('should handle multi-word commands', () => {
    const parsed = {
      minute: [0],
      hour: [0],
      dayOfMonth: [1],
      month: [1],
      dayOfWeek: [0],
      command: '/usr/bin/python /home/user/script.py --verbose'
    };

    const output = formatCronOutput(parsed);
    
    expect(output).toContain('command       /usr/bin/python /home/user/script.py --verbose');
  });

  test('should format all values separated by spaces', () => {
    const parsed = {
      minute: [0, 15, 30, 45],
      hour: [0, 6, 12, 18],
      dayOfMonth: [1, 15],
      month: [1, 2, 3],
      dayOfWeek: [1, 2, 3, 4, 5],
      command: 'cmd'
    };

    const output = formatCronOutput(parsed);
    const lines = output.split('\n');

    expect(lines[0]).toContain('0 15 30 45');
    expect(lines[1]).toContain('0 6 12 18');
    expect(lines[2]).toContain('1 15');
    expect(lines[3]).toContain('1 2 3');
    expect(lines[4]).toContain('1 2 3 4 5');
  });
});
