const { spawn } = require('child_process');
const path = require('path');

function runCli(args) {
  return new Promise((resolve, reject) => {
    const child = spawn('node', [path.join(__dirname, '../src/index.js'), ...args], {
      cwd: path.join(__dirname, '..')
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      resolve({ code, stdout, stderr });
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}

describe('CLI E2E Tests', () => {
  test('should handle spec example correctly', async () => {
    const { code, stdout } = await runCli(['*/15 0 1,15 * 1-5 /usr/bin/find']);

    expect(code).toBe(0);
    expect(stdout).toContain('minute        0 15 30 45');
    expect(stdout).toContain('hour          0');
    expect(stdout).toContain('day of month  1 15');
    expect(stdout).toContain('month         1 2 3 4 5 6 7 8 9 10 11 12');
    expect(stdout).toContain('day of week   1 2 3 4 5');
    expect(stdout).toContain('command       /usr/bin/find');
  });

  test('should handle missing argument with error', async () => {
    const { code, stderr } = await runCli([]);

    expect(code).toBe(1);
    expect(stderr).toContain('Usage:');
  });

  test('should handle invalid cron expression', async () => {
    const { code, stderr } = await runCli(['0 0 * *']);

    expect(code).toBe(1);
    expect(stderr).toContain('Error');
  });

  test('should handle out of range values', async () => {
    const { code, stderr } = await runCli(['60 * * * * /cmd']);

    expect(code).toBe(1);
    expect(stderr).toContain('out of range');
  });

  test('should handle multi-word commands', async () => {
    const { code, stdout } = await runCli(['0 0 * * * /usr/bin/python /home/user/script.py']);

    expect(code).toBe(0);
    expect(stdout).toContain('command       /usr/bin/python /home/user/script.py');
  });

  test('should handle simple daily schedule', async () => {
    const { code, stdout } = await runCli(['30 2 * * * /usr/bin/backup']);

    expect(code).toBe(0);
    expect(stdout).toContain('minute        30');
    expect(stdout).toContain('hour          2');
    expect(stdout).toContain('command       /usr/bin/backup');
  });

  test('should handle business hours expression', async () => {
    const { code, stdout } = await runCli(['0,30 9-17 * * 1-5 /work']);

    expect(code).toBe(0);
    expect(stdout).toContain('minute        0 30');
    expect(stdout).toContain('hour          9 10 11 12 13 14 15 16 17');
    expect(stdout).toContain('day of week   1 2 3 4 5');
  });
});
