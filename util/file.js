import { readdirSync, statSync } from 'fs';
import { resolve, join } from 'path';

/**
 * @description 过滤指定类型的文件
 * @param {array} files 文件列表
 * @param {string} fileType 文件类型
 * @returns {array}
 */
function filterSpecifyTypeFile(files, fileType) {
  return files.filter((file) => {
    return file.name.endsWith(`.${fileType}`);
  });
}

/**
 * @description 获取目标文件夹下的所有文件
 * @param {string} dir 文件夹路径
 * @param {object} options 配置项
 * @returns {array} 符合配置的文件结合
 */
export function getDirectoryFiles(dir, options, files = []) {
  const { deep, fileType } = (options = Object.assign({ deep: "shallow", fileType: "any" }, options || {}));
  const filesList = readdirSync(dir);
  for (const file of filesList) {
    const filePath = join(dir, file);
    const stats = statSync(filePath);
    if (deep === "deep" && stats.isDirectory()) {
      getDirectoryFiles(filePath, options, files);
    } else {
      files.push({
        name: file,
        path: filePath,
        mtime: new Date(stats.mtime).getTime()
      });
    }
  }
  if (fileType === "any") {
    return files;
  }
  return filterSpecifyTypeFile(files, fileType);
}

/**
 * @description 获取目标文件夹下最新的文件
 */
export function getDirectoryLatestFile(dir, fileType) {
  const sortedFiles = getDirectoryFiles(dir, { fileType }).sort((a, b) => {
    return b.mtime - a.mtime;
  });
  return (sortedFiles[0] || {});
}