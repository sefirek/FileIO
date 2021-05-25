const fs = require('fs');
const path = require('path');
const fileProperties = require('./defaultFileProperties');

const FileIO = {
  fileProperties,
};

/**
 * @param {HTMLElement} element
 * @param {string} dir url
 * @param {fileProperties} builderSettings
 */
function createScript(element, dir, builderSettings = FileIO.fileProperties) {
  const name = element.getAttribute('name');
  if (!name) throw new Error('<script name=undefined');
  const filePath = joinPath(dir, `${name}.js`);
  writeFileSync(filePath, 'empty', builderSettings);
}

/**
 *
 * @param {string} dirPath
 * @param {fileProperties} builderSettings
 */
function createDir(dirPath, builderSettings = FileIO.fileProperties) {
  const preparedDirPath = preparePath(dirPath);
  if (fs.existsSync(preparedDirPath)) {
    if (builderSettings.dirExistsError) {
      throw new Error(`Directory ${preparedDirPath} already exists.`);
    }
  } else fs.mkdirSync(preparedDirPath);
}

/**
 *
 * @param {string} filePath relative path
 * @returns {string}
 */
function getDirName(filePath) {
  return path.dirname(preparePath(filePath));
}

/**
 *
 * @param {string} filePath relative path
 * @returns {string}
 */
function getRelativeDirName(filePath) {
  const dirname = getDirName(filePath).substring(process.cwd().length);
  return dirname[0] === '/' ? `.${dirname}` : dirname;
}

/**
 *
 * @param {string} filePath relative path
 * @returns {string}
 */
function getBaseName(filePath) {
  return path.basename(filePath);
}

/**
 *
 * @param {string} filePath
 * @param {string} src
 * @param {fileProperties} builderSettings
 */
function writeFileSync(filePath, src, builderSettings = FileIO.fileProperties) {
  const preparedFilePath = preparePath(filePath);
  if (fs.existsSync(preparedFilePath)) {
    if (builderSettings.fileExistsError) {
      throw new Error(`File ${filePath} already exists.`);
    }
    if (builderSettings.overrideFiles) {
      fs.writeFileSync(preparedFilePath, src, { encoding: 'utf-8' });
    }
  } else fs.writeFileSync(preparedFilePath, src, { encoding: 'utf-8' });
}

/**
 *
 * @param {string} filePath
 * @param {string} src
 * @param {fileProperties} builderSettings
 */
async function writeFile(filePath, src, builderSettings = FileIO.fileProperties) {
  const preparedFilePath = preparePath(filePath);
  try {
    fs.exists(preparedFilePath, (exists) => {
      if (exists) {
        if (builderSettings.fileExistsError) {
          throw new Error(`File ${filePath} already exists.`);
        }
        if (builderSettings.overrideFiles) {
          fs.writeFile(preparedFilePath, src, { encoding: 'utf-8' }, (error) => {
            if (error) throw error;
          });
        }
      } else {
        fs.writeFile(preparedFilePath, src, { encoding: 'utf-8' }, (error) => {
          if (error) throw error;
        });
      }
    });
  } catch (error) {
    throw error;
  }
}

/**
 * @param {string} filePath relative path
 * @returns {string} txt file src
 */
function getFile(filePath) {
  return fs.readFileSync(preparePath(filePath), 'utf-8');
}

/**
 *
 * @param {string} dirPath relative path
 * @returns {string[]}
 */
function getFileList(dirPath) {
  return fs.readdirSync(preparePath(dirPath));
}

/**
 * @param {string} filePath relative path
 * @returns {fs.ReadStream}
 */
function getReadStream(filePath) {
  return fs.createReadStream(preparePath(filePath));
}

/**
 * @param {string} filePath relative path
 * @returns {fs.WriteStream}
 */
function getWriteStream(filePath) {
  return fs.createWriteStream(preparePath(filePath));
}

/**
 *
 * @param {string} filePath relative path
 */
function getJSON(filePath) {
  return JSON.parse(getFile(filePath));
}

/**
 *
 * @param {string} filePath relative path
 * @param {object} json JSON object
 */
function setJSON(filePath, json) {
  if (!(json instanceof Object)) {
    throw new Error('json is not a correct type');
  }

  writeFileSync(filePath, JSON.stringify(json, null, 2), { overrideFiles: true });
}

/**
 * Create new empty file if do not exists, return true if created new file
 *
 * @param {string} filePath relative path
 * @returns {boolean} true when create new file
 */
function createFileIfNotExists(filePath) {
  const preparedPath = preparePath(filePath);
  if (fs.existsSync(preparedPath)) return false;
  fs.writeFileSync(preparedPath, '', { encoding: 'utf-8' });
  return true;
}

/**
 * @param action
 * @param dirPath
 */
function doOnFile(action, dirPath) {
  try {
    fs[`${action}Sync`](preparePath(dirPath));
  } catch (err) {
    if (FileIO.fileProperties.fileExistsError && err.code !== 'ENOENT') {
      throw err;
    }
  }
}

/**
 *
 * @param {string} dirPath relative path
 */
function deleteDir(dirPath) {
  try {
    fs.rmdirSync(preparePath(dirPath));
  } catch (err) {
    if (FileIO.fileProperties.fileExistsError && err.code !== 'ENOENT') {
      throw err;
    }
  }
}

/**
 * Deletes the file
 *
 * @param {string} filePath relative path
 */
function deleteFile(filePath) {
  const preparedPath = preparePath(filePath);

  try {
    fs.unlinkSync(preparedPath);
  } catch (err) {
    if (FileIO.fileProperties.fileExistsError && err.code !== 'ENOENT') {
      throw err;
    }
  }
}

/**
 * Ensures that the file is deleted
 *
 * @param {string} filePath relative path
 */
function ensureDeleting(filePath) {
  const preparedPath = preparePath(filePath);
  if (fs.existsSync(preparedPath)) {
    try {
      fs.unlinkSync(preparedPath);
    } catch (ex) {
      throw new Error(`Could not delete the file: ${ex.message}`);
    }
  }
}

/**
 * @param {string} htmlPath relative path
 * @returns {string} url
 */
function preparePath(htmlPath) {
  return joinPath(process.cwd(), htmlPath);
}


/**
 * @param {string} dirPath path of directory
 * @returns {string[]}
 */
function getDirectories(dirPath) {
  return fs.readdirSync(preparePath(dirPath), { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
}

/**
 * @param {string} dirPath path of directory
 * @param {string} filePath path of file
 */
function findFile(dirPath, filePath) {
  const dirs = [dirPath];
  let index = -1;
  let preparedPath = null;
  const push = dir => dirs.push(path.join(dirs[index], dir));
  do {
    index += 1;
    preparedPath = preparePath(joinPath(dirs[index], filePath));
    console.log(preparedPath, index);
    if (fs.existsSync(preparedPath)) {
      console.log(`znaleziono${preparedPath}`);
      return joinPath(dirs[index], filePath);
    }
    console.log(dirs[index], preparedPath);
    getDirectories(dirs[index]).forEach(push);
  } while (index < dirs.length);
  throw new Error(`File not found: ${filePath}`);
}

/**
 *  @param {string} dirPath path of directory
 * @returns {boolean} true if is directory
 */
function isDirectory(dirPath) {
  try {
    return fs.statSync(preparePath(dirPath)).isDirectory();
  } catch (e) {
    return false;
  }
}

/**
 * @param {string} filePath file path or module name, no need index.js
 * @returns {string} path relative to workspace
 */
function getRelativeToWorkspace(filePath) {
  try {
    return `./${path.relative(process.cwd(), require.resolve(preparePath(filePath)))}`;
  } catch (e) {
    return `./${path.relative(process.cwd(), require.resolve(filePath))}`;
  }
}

/**
 * @type {path.join}
 */
const joinPath = path.join.bind(path);

module.exports = Object.assign(FileIO, {
  getFile,
  getFileList,
  findFile,
  getJSON,
  setJSON,
  writeFileSync,
  writeFile,
  createDir,
  getDirName,
  getRelativeDirName,
  getDirectories,
  createScript,
  deleteFile,
  deleteDir,
  ensureDeleting,
  getReadStream,
  getWriteStream,
  joinPath,
  preparePath,
  createFileIfNotExists,
  isDirectory,
  getRelativeToWorkspace,
});
