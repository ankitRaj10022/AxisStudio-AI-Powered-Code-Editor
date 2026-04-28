import type {
  TemplateFile,
  TemplateFolder,
  TemplateItem,
} from "@/features/playground/libs/path-to-json";

interface WebContainerFile {
  file: {
    contents: string;
  };
}

interface WebContainerDirectory {
  directory: {
    [key: string]: WebContainerFile | WebContainerDirectory;
  };
}

type WebContainerFileSystem = Record<
  string,
  WebContainerFile | WebContainerDirectory
>;

function isFolder(item: TemplateItem): item is TemplateFolder {
  return "folderName" in item;
}

function getItemKey(item: TemplateItem) {
  return isFolder(item)
    ? item.folderName
    : `${item.filename}.${item.fileExtension}`;
}

function processItem(item: TemplateItem): WebContainerFile | WebContainerDirectory {
  if (isFolder(item)) {
    const directoryContents: WebContainerFileSystem = {};

    item.items.forEach((subItem) => {
      directoryContents[getItemKey(subItem)] = processItem(subItem);
    });

    return {
      directory: directoryContents,
    };
  }

  return {
    file: {
      contents: item.content,
    },
  };
}

export function transformToWebContainerFormat(
  template: TemplateFolder,
): WebContainerFileSystem {
  const result: WebContainerFileSystem = {};

  template.items.forEach((item) => {
    result[getItemKey(item)] = processItem(item);
  });

  return result;
}
