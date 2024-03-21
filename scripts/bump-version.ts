export {};

const { writeFileSync } = require('fs');
const path = require('path');
const https = require('https');

/**
 * This script will:
 * - read the `package.json` in the dir in which this script was invoked from
 * - bump @bitgo/ packages in said `package.json` to the latest version
 * - overwrite the `package.json` with the bumped bitogjs versions
 *
 * This script requires no arguments as it relies on the fact that the process.cwd() has a package.json
 */

type BitGoPackageName = `@bitgo/${string}`;

function dependencyIsBitGoBetaPackage(
  dependency: string
): dependency is BitGoPackageName {
  return dependency.startsWith('@bitgo/');
}

type Tag = {
  beta?: string;
  latest?: string;
};

type DistTags = {
  tags: Tag;
};

const packageJsonPath = path.resolve(process.cwd(), 'package.json');
const packageJson = require(packageJsonPath);
const packageNames: BitGoPackageName[] = Object.keys(
  packageJson.dependencies
).filter(dependencyIsBitGoBetaPackage);

/**
 * Makes an HTTP request to fetch all the dist tags
 */
const getDistTags = async (
  packageName: BitGoPackageName
): Promise<DistTags> => {
  return new Promise(resolve => {
    https.get(
      `https://registry.npmjs.org/-/package/${packageName}/dist-tags`,
      (res: { on: (arg0: string, arg1: (d: any) => void) => void }) => {
        let data = '';
        res.on('data', d => {
          data += d;
        });
        res.on('end', () => {
          const tags = JSON.parse(data) as Tag;
          resolve({ tags });
        });
      }
    );
  });
};

/**
 * Fetches the latest version for each bitgo-beta package
 * and writes that to the dependencies list
 */
const bumpVersion = async (packageName: BitGoPackageName) => {
  const { tags } = await getDistTags(packageName);

  const next = tags['latest'];

  if (next) {
    packageJson.dependencies[packageName] = next;
    console.log(
      `Upgrading ${packageName} to ${packageJson.dependencies[packageName]}...`
    );
  }

  return;
};

const bumpVersions = async () => {
  const bumpPromises = packageNames.map(bumpVersion);
  await Promise.all(bumpPromises);

  const targetDir = path.join(process.cwd());

  writeFileSync(
    path.join(targetDir, 'package.json'),
    JSON.stringify(packageJson, null, 2) + '\n'
  );

  console.log(`Successfully bumped ${packageJson.name}`);
};

void bumpVersions();
