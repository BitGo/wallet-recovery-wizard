const pjson = require('../package.json');
const spawn = require('child_process').spawn;
const path = require('path');

// Requires cygwin for windows

const platformConfig = {
  darwin: {
    appSourcePath: ['Electron.app', 'Contents', 'Resources'],
    forgePath: ['out', 'BitGoWalletRecoveryWizard-darwin-x64'],
    buildSteps: {
      clear: (dir) => ['rm', '-rf', dir],
      copy: (src, dest) => ['cp', '-r', src, dest],
      move: (src, dest) => ['mv', src, dest]
    }
  },
  win32: {
    appSourcePath: ['resources'],
    forgePath: ['out', 'BitGoWalletRecoveryWizard-win32-x64'],
    buildSteps: {
      clear: (dir) => ['rm', '-rf', dir],
      copy: (src, dest) => ['cp', '-r', src, dest],
      move: (src, dest) => ['mv', src, dest]
    }
  }
};

async function doPackaging(platform = 'darwin') {
  if (!Object.keys(platformConfig).includes(platform)) {
    throw new Error(`Unsupported platform: ${platform}`);
  }

  const { appSourcePath, forgePath, buildSteps } = platformConfig[platform];

  // Install modules
  console.log('====================================== installing modules');
  await runCmd('yarn', ['install', '--ignore-engines']);
  console.log('====================================== end installing modules');

  // Compile the js
  console.log('====================================== building javascript');
  await runCmd('yarn', ['run', 'build-react']);
  console.log('====================================== end building javascript');

  // Clear build folder
  console.log('====================================== clearing build folder');
  const [cleanCmd, ...cleanArgs] = buildSteps.clear('out');
  await runCmd(cleanCmd, cleanArgs);
  await runCmd('mkdir', ['out']);
  console.log('====================================== end clearing build folder');

  // Grab a prebuilt executable
  console.log('====================================== grabbing executable');
  const electronPrebuiltPath = path.join(__dirname, '..', 'node_modules', 'electron', 'dist');
  const appDir = path.join(__dirname, '..', ...forgePath);

  const [copyPrebuiltCmd, ...copyPrebuiltArgs] = buildSteps.copy(electronPrebuiltPath, appDir);
  await runCmd(copyPrebuiltCmd, copyPrebuiltArgs);

  console.log('====================================== end grabbing executable');

  // Move project into executable
  console.log('====================================== moving source code into executable');
  const appDirs = ['package.json', 'src/main.js', 'build'].map((appDir) => path.join(__dirname, '..', appDir));
  const prebuildSourcePath = path.join(__dirname, '..', ...forgePath, ...appSourcePath, 'app/');

  // Make app directory in prebuildSourcePath
  if (platform === 'win32') {
    await runCmd('mkdir', [prebuildSourcePath]);
  }

  await runCmd('mkdir', ['-p', path.join(prebuildSourcePath, 'src')]);

  // Copy the files
  for (const appDir of appDirs) {
    const [copyCmd, ...copyArgs] = buildSteps.copy(appDir, prebuildSourcePath);
    await runCmd(copyCmd, copyArgs);
  }

  // Move main.js into src directory
  const mainJSPath = path.join(prebuildSourcePath, 'main.js');
  const srcDir = path.join(prebuildSourcePath, 'src');

  const [mvMainCmd, ...mvMainArgs] = buildSteps.move(mainJSPath, srcDir);
  await runCmd(mvMainCmd, mvMainArgs);
  console.log('====================================== end moving source code into executable');

  // install packages
  console.log('====================================== installing packages');
  await runCmd('yarn', ['install', '--ignore-engines', '--prod', '--no-lockfile', `--modules-folder`, path.join(prebuildSourcePath, 'node_modules')]);
  console.log('====================================== end installing packages');

  // return;

  // Pack the source code (asar)
  console.log('====================================== packing application source');
  const packagedAppDir = path.join(__dirname, '..', ...forgePath, ...appSourcePath);
  const appPath = path.join(packagedAppDir, 'app');
  const asarPath = path.join(packagedAppDir, 'app.asar');

  await runCmd('asar', ['pack', appPath, asarPath]);
  console.log('====================================== end packing application source');

  // Remove unpacked source code
  console.log('====================================== removing unpacked source');
  const [rmSrcCmd, ...rmSrcArgs] = buildSteps.clear(path.join(packagedAppDir, 'app/'));
  console.log('PATH TO REMOVE');
  console.log(path.join(packagedAppDir, 'app/'));
  await runCmd(rmSrcCmd, rmSrcArgs);
  console.log('====================================== end removing unpacked source');

  console.log('====================================== renaming app');

  // Rename the app
  if (platform !== 'win32') {
    await runCmd('mv', [path.join(appDir, 'Electron.app'), path.join(appDir, `${pjson.name}.app`)]);
  } else {
    // rename app for windows
    await runCmd('mv', [path.join(appDir, 'electron.exe'), path.join(appDir, `${pjson.name}.exe`)]);
  }

  console.log('====================================== end renaming app');

  // Give app an icon


  // Make a distributable
  console.log('====================================== creating distributable');
  if (platform === 'win32') {
    console.log('====================================== re-installing modules');
    // need to re-install node_modules because asar deletes it (why? who knows)
    await runCmd('yarn', ['install', '--ignore-engines']);
  }

  await runCmd('electron-forge', ['make', '--skip-package']);

  console.log('====================================== end creating distributable');
}

function runCmd(cmd, args, opts) {
  opts = Object.assign({}, opts, { shell: true });

  return new Promise((resolve, reject) => {
    const proc = spawn(cmd, args, opts);

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
});

if (require.main === module) {
  doPackaging(process.argv[2] || process.platform);
}