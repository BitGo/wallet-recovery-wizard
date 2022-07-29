import { remote } from 'electron';
import fs from 'fs';
import { WriteFileOptions } from 'original-fs';

const spectronIsRunning = process.env.SPECTRON_IS_RUNNING;
const spectronSaveDir = process.env.SPECTRON_SAVE_DIR;

/**
 * This function uses listDrives to get the appropriate path to save the file in
 * @param fileName
 * @returns {Promise}
 */
async function getSavePath(fileName: string): Promise<string | undefined> {
  // The spectron e2e test framework sets an environment variable
  // this env variable hardcodes the filepath, removing the need
  // to launch a dialog box, which the test framework cannot interact with
  if (spectronIsRunning) {
    return Promise.resolve(`${spectronSaveDir}${fileName}`);
  }

  const filenameSplit = fileName.split('.');
  let extension = 'json';
  if (filenameSplit.length > 1) {
    extension = filenameSplit[filenameSplit.length - 1];
  }
  // const drives = [];
  // const removableDrives = drives.filter((drive) => {
  //   // If the drive has no mountpoints listed, it's an internal drive
  //   if (drive.mountpoints.length === 0) {
  //     return false;
  //   }
  //   // If the drive's mountpoint is mounted somewhere other than '/media', it's most likely the boot drive
  //   if (!drive.mountpoints[0].path.includes('/media/')) {
  //     return false;
  //   }
  //   // If the drive doesn't have a devicePath, it's also an internal drive.
  //   return drive.devicePath;
  // });

  let removableDrivePath = '~';
  // if (removableDrives.length > 0) {
  //   // Arbitrarily select the first drive returned by the utility
  //   const firstDrive = removableDrives[0];
  //   const mountPoint = firstDrive.mountpoints[0].path;
  //   removableDrivePath = mountPoint;
  // }

  const dialogParams = {
    defaultPath: `${removableDrivePath}/${fileName}`,
    filters: [
      {
        name: 'Custom File Type',
        extensions: [extension],
      },
    ],
  };

  const result = await remote.dialog.showSaveDialog(remote.getCurrentWindow(), dialogParams);
  return result.filePath;
}

/**
 * Saves file
 * @param content
 * @param fileName
 * @returns {Promise}
 */
export async function saveFile(fileName: string, content: string | Buffer, options?: WriteFileOptions) {
  const saveFilePath = await getSavePath(fileName);
  if (!saveFilePath) {
    // TODO(Peter): we might want to throw specific error to indicate it is cancelled by user
    // The user exited the file creation process.
    throw 'File save cancelled';
  }
  try {
    fs.writeFileSync(saveFilePath, content, options);
    // We want to verify the file is actually downloaded properly see:
    // https://bitgoinc.atlassian.net/browse/BG-26455
    const readContent = fs.readFileSync(saveFilePath);
    if (content.toString() !== readContent.toString()) {
      throw 'There was a problem saving the file';
    }
    return saveFilePath;
  } catch (error: unknown) {
    const err = error as Error;
    alert(
      `There was a problem saving the file. Please try again saveFilePath=${saveFilePath} content=${content.toString()} err=${
        err.message
      }`
    );
    throw 'There was a problem saving the file';
  }
}
