
const { parseCronExpression } = require('./cronParser');
const { formatCronOutput } = require('./formatter');

function main() {
  const cronExpression = process.argv[2];

  if (!cronExpression) {
    console.error(
      'Usage: cron-parser "<cron expression>"\n' +
      'Example: cron-parser "*/15 0 1,15 * 1-5 /usr/bin/find"'
    );
    process.exit(1);
  }

  try {
    const parsed = parseCronExpression(cronExpression);

    const output = formatCronOutput(parsed);
    console.log(output);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

main();
