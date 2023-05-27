import { createRequire } from "node:module";
import { ManifestTypeV3 } from './v3-type.mjs';

const require = createRequire(import.meta.url);
const pkg = require("../../package.json");

const manifest: ManifestTypeV3 = {
  manifest_version: 3,
  name: pkg.displayName,
  version: pkg.version,
  description: pkg.description,
  permissions: [
    "activeTab",
    "tabs",
    "storage",
    "background",
    "clipboardRead",
    "clipboardWrite",
    "contextMenus",
    "scripting",
    "activeTab"
  ],
  host_permissions:["<all_urls>"],
  commands: {
    "toggle-insight": {
      "suggested_key": {
        "default": "Ctrl+B",
        "windows": "Ctrl+B",
        "mac": "Command+B",
      },
      "description": "打开面板"
    }
  },
  icons: {
    "128": "public/icon-128.png",
  },
  web_accessible_resources: [
    {
      resources: ["public/*", "assets/*"],
      matches: ["<all_urls>"],
    },
  ],
};

function getManifestV3(pageDirMap: { [x: string]: any }): ManifestTypeV3 {
  const pages = Object.keys(pageDirMap);

  if (pages.length === 0) {
    return manifest;
  }

  // 处理//
  const fixedPath = (p: string) => p.replace('\\', '/')

  if (pages.indexOf("options") > -1) {
    manifest.options_ui = {
      page: fixedPath(pageDirMap["options"]),
    };
  }

  if (pages.indexOf("background") > -1) {
    manifest.background = {
      service_worker: fixedPath(pageDirMap["background"]),
      type: "module",
    };
  }

  if (pages.indexOf("popup") > -1) {
    manifest.action = {
      // chrome.action.onClicked 生效的话，default_popup需要去掉
      default_title: "Hello World!",
      // default_popup: fixedPath(pageDirMap["popup"]),
      default_icon: "public/icon-34.png",
    };
  }

  // if (pages.indexOf("newtab") > -1) {
  //   manifest.chrome_url_overrides = {
  //     newtab: fixedPath(pageDirMap["newtab"]),
  //   };
  // }

  if (pages.indexOf("bookmarks") > -1) {
    manifest.chrome_url_overrides = {
      bookmarks: fixedPath(pageDirMap["bookmarks"]),
    };
  }

  if (pages.indexOf("history") > -1) {
    manifest.chrome_url_overrides = {
      history: fixedPath(pageDirMap["history"]),
    };
  }

  if (pages.indexOf("content") > -1) {
    manifest.content_scripts = [
      {
        matches: ["http://*/*", "https://*/*","<all_urls>"],
        js: [fixedPath(pageDirMap["content"])],
        css: pageDirMap["content-css"],
        run_at: "document_start",
      },
    ];
  }

  if (pages.indexOf("devtools") > -1) {
    manifest.devtools_page = fixedPath(pageDirMap["devtools"]);
  }

  return manifest;
}

export default getManifestV3;
