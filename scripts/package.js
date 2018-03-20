const spawn = require('child_process').spawn;
const path = require('path');

const appSourcePaths = {
  darwin: ['Electron.app', 'Contents', 'Resources', 'app'],
  win32: ['resources', 'app']
}

async function doPackaging(platform = 'darwin') {
  // Compile the js
  console.log('====================================== building javascript');
  await runCmd('yarn', ['run', 'build-react']);
  console.log('====================================== end building javascript');

  // Grab a prebuilt executable
  console.log('====================================== grabbing executable');
  await runCmd('cp', ['-r', path.join(__dirname, '..', 'node_modules', 'electron', 'dist'), path.join(__dirname, '..')]);
  console.log('====================================== end grabbing executable');

  // Move project into executable
  await runCmd('cp', ['-r', path.join(__dirname, '..', 'package.json'), path.join(__dirname, '..', ...appSourcePaths[platform])]);

  // Pack the executable


  // Make a distributable

}

function runCmd(cmd, args, opts) {
  opts = opts || {};

  return new Promise((resolve, reject) => {
    const proc = spawn(cmd, args);

    proc.stdout.pipe(process.stdout);
    proc.stderr.pipe(process.stderr);
    // proc.stderr.on('data', console.error.bind(console, `${taskName} error:`));

    proc.on('error', reject);
    proc.on('close', resolve);
  });
}

process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:')
  console.error(err.message);
  console.error(err.stack);
})

if (require.main === module) {
  // Build args from CLI and send to doPackaging
  doPackaging();
}