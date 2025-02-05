import path from 'path';

export function logInfo(...messages: any[]) {
  const stack = new Error().stack;
  if (stack) {
    const stackLines = stack.split('\n');
    if (stackLines.length > 2) {
      const callerLine = stackLines[2];
      const match = callerLine.match(/\((.*):(\d+):(\d+)\)/);
      if (match) {
        const filePath = match[1];
        const lineNumber = match[2];
        const fileName = path.basename(filePath);
        console.info(`[${fileName}:${lineNumber}]`, ...messages);
        return;
      }
    }
  }
  console.info(...messages);
}
