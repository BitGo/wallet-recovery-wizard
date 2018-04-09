const pjson = require('../package.json');
const spawn = require('child_process').spawn;
const path = require('path');

const appSourcePaths = {
  darwin: ['Electron.app', 'Contents', 'Resources'],
  win32: ['resources']
}

const forgePaths = {
  darwin: ['out', 'BitGoWalletRecoveryWizard-darwin-x64']
};

async function doPackaging(platform = 'darwin') {
  // Compile the js
  console.log('====================================== installing modules');
  await runCmd('yarn', ['install', '--ignore-engines']);
  console.log('====================================== end installing modules');

  // Compile the js
  console.log('====================================== building javascript');
  await runCmd('yarn', ['run', 'build-react']);
  console.log('====================================== end building javascript');

  // Grab a prebuilt executable
  console.log('====================================== grabbing executable');
  const electronPrebuiltPath = path.join(__dirname, '..', 'node_modules', 'electron', 'dist/');
  const appDir = path.join(__dirname, '..', ...forgePaths[platform]);
  await runCmd('cp', ['-r', electronPrebuiltPath, appDir]);
  console.log('====================================== end grabbing executable');


  // Move project into executable (right now, just moving package.json)
  console.log('====================================== moving source code into executable');
  const appDirs = ['package.json', 'src/main.js', 'build'].map((appDir) => path.join(__dirname, '..', appDir));
  const prebuildSourcePath = path.join(__dirname, '..', ...forgePaths[platform], ...appSourcePaths[platform], 'app');

  if (platform === 'darwin') {
    // Make app directory in prebuildSourcePath
    await runCmd('mkdir', ['-p', path.join(prebuildSourcePath, 'src')]);
  }

  // Copy the files
  for (const appDir of appDirs) {
    await runCmd('cp', ['-r', appDir, prebuildSourcePath]);
  }

  // Move main.js into src directory
  const mainJSPath = path.join(prebuildSourcePath, 'main.js');
  const srcDir = path.join(prebuildSourcePath, 'src');
  await runCmd('mv', [mainJSPath, srcDir]);
  console.log('====================================== end moving source code into executable');

  // install packages
  console.log('====================================== installing packages');
  await runCmd('yarn', ['install', '--ignore-engines', '--prod', '--no-lockfile', `--modules-folder`, path.join(prebuildSourcePath, 'node_modules')]);
  console.log('====================================== end installing packages');

  // Pack the source code (asar)
  console.log('====================================== packing application source');
  const packagedAppDir = path.join(__dirname, '..', ...forgePaths[platform], ...appSourcePaths[platform]);
  const appPath = path.join(packagedAppDir, 'app/');
  const asarPath = path.join(packagedAppDir, 'app.asar');
  await runCmd('asar', ['pack', appPath, asarPath]);
  console.log('====================================== end packing application source');

  // Remove unpacked source code
  console.log('====================================== removing unpacked source');
  // await runCmd('pwd', { cwd: packagedAppDir });
  await runCmd('rm', ['-r', path.join(packagedAppDir, 'app/')]);
  console.log('====================================== end removing unpacked source');

  // Rename the app
  if (platform === 'darwin') {
    console.log('====================================== renaming app');
    // await runCmd('pwd', { cwd: packagedAppDir });
    await runCmd('mv', [path.join(appDir, 'Electron.app'), path.join(appDir, `${pjson.name}.app`)]);
    console.log('====================================== end renaming app');
  }

  // Give app an icon

  // Make a distributable
  console.log('====================================== creating distributable');
  // await runCmd('pwd', { cwd: packagedAppDir });
  await runCmd('electron-forge', ['make', '--skip-package']);
  console.log('====================================== end creating distributable');
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