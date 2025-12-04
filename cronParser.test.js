const { parseCronExpression, parseField } = require('../src/cronParser');

describe('Cron Parser - parseField', () => {
  describe('Single values', () => {
    test('should parse single number', () => {
      expect(parseField('5', 'minute')).toEqual([5]);
      expect(parseField('23', 'hour')).toEqual([23]);
      expect(parseField('15', 'dayOfMonth')).toEqual([15]);
    });

    test('should handle zero', () => {
      expect(parseField('0', 'minute')).toEqual([0]);
      expect(parseField('0', 'hour')).toEqual([0]);
    });
  });

  describe('Wildcards', () => {
    test('should expand * for minute', () => {
      const result = parseField('*', 'minute');
      expect(result.length).toBe(60);
      expect(result[0]).toBe(0);
      expect(result[59]).toBe(59);
    });

    test('should expand * for hour', () => {
      const result = parseField('*', 'hour');
      expect(result.length).toBe(24);
      expect(result[0]).toBe(0);
      expect(result[23]).toBe(23);
    });

    test('should expand * for day of month', () => {
      const result = parseField('*', 'dayOfMonth');
      expect(result.length).toBe(31);
      expect(result[0]).toBe(1);
      expect(result[30]).toBe(31);
    });

    test('should expand * for month', () => {
      const result = parseField('*', 'month');
      expect(result.length).toBe(12);
      expect(result[0]).toBe(1);
      expect(result[11]).toBe(12);
    });

    test('should expand * for day of week', () => {
      const result = parseField('*', 'dayOfWeek');
      expect(result.length).toBe(8); 
      expect(result.includes(0)).toBe(true);
    });
  });

  describe('Ranges', () => {
    test('should parse simple range', () => {
      expect(parseField('1-5', 'dayOfWeek')).toEqual([1, 2, 3, 4, 5]);
      expect(parseField('9-17', 'hour')).toEqual([9, 10, 11, 12, 13, 14, 15, 16, 17]);
    });

    test('should handle single value in range', () => {
      expect(parseField('5-5', 'minute')).toEqual([5]);
    });
  });

  describe('Steps', () => {
    test('should parse */step', () => {
      expect(parseField('*/15', 'minute')).toEqual([0, 15, 30, 45]);
      expect(parseField('*/6', 'hour')).toEqual([0, 6, 12, 18]);
    });

    test('should parse range/step', () => {
      expect(parseField('1-5/2', 'dayOfWeek')).toEqual([1, 3, 5]);
      expect(parseField('0-20/5', 'minute')).toEqual([0, 5, 10, 15, 20]);
    });

    test('should handle step of 1', () => {
      expect(parseField('*/1', 'minute').length).toBe(60);
      expect(parseField('0-23/1', 'hour').length).toBe(24);
    });
  });

  describe('Lists', () => {
    test('should parse comma-separated values', () => {
      expect(parseField('1,15', 'dayOfMonth')).toEqual([1, 15]);
      expect(parseField('1,15,30', 'dayOfMonth')).toEqual([1, 15, 30]);
    });

    test('should parse list with mixed formats', () => {
      expect(parseField('1,3-5,7', 'dayOfWeek')).toEqual([0, 1, 3, 4, 5]);
    });

    test('should handle duplicates in list', () => {
      expect(parseField('1,1,5', 'dayOfMonth')).toEqual([1, 5]);
    });
  });

  describe('Special cases', () => {
    test('should convert day of week 7 to 0 (Sunday)', () => {
      expect(parseField('7', 'dayOfWeek')).toEqual([0]);
      expect(parseField('0,7', 'dayOfWeek')).toEqual([0]);
    });

    test('should sort results', () => {
      expect(parseField('5,1,3', 'dayOfMonth')).toEqual([1, 3, 5]);
    });
  });

  describe('Error handling', () => {
    test('should throw on invalid number', () => {
      expect(() => parseField('abc', 'minute')).toThrow();
    });

    test('should throw on out of range value', () => {
      expect(() => parseField('60', 'minute')).toThrow();
      expect(() => parseField('24', 'hour')).toThrow();
      expect(() => parseField('13', 'month')).toThrow();
    });

    test('should throw on invalid step', () => {
      expect(() => parseField('*/0', 'minute')).toThrow();
      expect(() => parseField('*/-5', 'minute')).toThrow();
    });
  });
});

describe('Cron Parser - parseCronExpression', () => {
  test('should parse example from spec', () => {
    const result = parseCronExpression('*/15 0 1,15 * 1-5 /usr/bin/find');
    
    expect(result.minute).toEqual([0, 15, 30, 45]);
    expect(result.hour).toEqual([0]);
    expect(result.dayOfMonth).toEqual([1, 15]);
    expect(result.month).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    expect(result.dayOfWeek).toEqual([1, 2, 3, 4, 5]);
    expect(result.command).toBe('/usr/bin/find');
  });

  test('should parse simple cron expressions', () => {
    const result = parseCronExpression('0 0 * * * /bin/bash');
    
    expect(result.minute).toEqual([0]);
    expect(result.hour).toEqual([0]);
    expect(result.dayOfMonth.length).toBe(31);
    expect(result.month.length).toBe(12);
    expect(result.dayOfWeek.length).toBe(8);
    expect(result.command).toBe('/bin/bash');
  });

  test('should handle multi-word commands', () => {
    const result = parseCronExpression('0 0 * * * /usr/bin/python /home/user/script.py');
    expect(result.command).toBe('/usr/bin/python /home/user/script.py');
  });

  test('should throw on too few fields', () => {
    expect(() => parseCronExpression('0 0 * *')).toThrow();
  });

  test('should throw on missing command', () => {
    expect(() => parseCronExpression('0 0 * * *')).toThrow();
  });

  test('should handle all wildcards', () => {
    const result = parseCronExpression('* * * * * /bin/echo');
    
    expect(result.minute.length).toBe(60);
    expect(result.hour.length).toBe(24);
    expect(result.dayOfMonth.length).toBe(31);
    expect(result.month.length).toBe(12);
    expect(result.dayOfWeek.length).toBe(8);
  });

  test('should parse every minute', () => {
    const result = parseCronExpression('* * * * * /bin/run');
    expect(result.minute.length).toBe(60);
  });

  test('should parse every hour at minute 0', () => {
    const result = parseCronExpression('0 * * * * /bin/run');
    expect(result.minute).toEqual([0]);
    expect(result.hour.length).toBe(24);
  });

  test('should parse daily at specific time', () => {
    const result = parseCronExpression('30 2 * * * /bin/backup');
    expect(result.minute).toEqual([30]);
    expect(result.hour).toEqual([2]);
  });

  test('should parse weekly', () => {
    const result = parseCronExpression('0 0 * * 0 /bin/weekly');
    expect(result.minute).toEqual([0]);
    expect(result.hour).toEqual([0]);
    expect(result.dayOfWeek).toEqual([0]);
  });

  test('should parse complex expressions', () => {
    const result = parseCronExpression('0,30 9-17 * * 1-5 /usr/bin/work');
    
    expect(result.minute).toEqual([0, 30]);
    expect(result.hour).toEqual([9, 10, 11, 12, 13, 14, 15, 16, 17]);
    expect(result.dayOfMonth.length).toBe(31);
    expect(result.month.length).toBe(12);
    expect(result.dayOfWeek).toEqual([1, 2, 3, 4, 5]);
    expect(result.command).toBe('/usr/bin/work');
  });
});
