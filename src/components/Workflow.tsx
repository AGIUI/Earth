/**
 * ask 等待用户输入，TODO待处理
 */

import i18n from "i18next";
import "@src/locales/i18nConfig";
const workflow = {
  models: [
    {
      label: i18n.t("divergenceDegree"),
      value: "temperature",
      defaultValue: 0.7,
    },
    {
      label: i18n.t("model"),
      value: "model",
      options: [
        { value: "ChatGPT", label: "ChatGPT" },
        { value: "Bing", label: "Bing" },
      ],
    },
  ],
  inputs: [
    {
      label: i18n.t("default"),
      value: "default",
    },
    {
      label: i18n.t("bindWebContent"),
      value: "bindCurrentPage",
    },
    {
      label: i18n.t("bindWebHTML"),
      value: "bindCurrentPageHTML",
    },
    {
      label: i18n.t("bindWebURL"),
      value: "bindCurrentPageURL",
    },
    {
      ask: true,
      label: i18n.t("userSelection"),
      value: "userSelection",
    },
    {
      label: i18n.t("clipboard"),
      value: "clipboard",
    },
  ],
  outputs: [
    {
      label: i18n.t("default"),
      value: "default",
    },
    {
      label: i18n.t("asContext"),
      value: "isNextUse",
    },
    {
      label: i18n.t("conditional"),
      value: "isMatch",
    },
  ],
  agents: [
    {
      key: "prompt",
      label: i18n.t("prompt"),
    },
    {
      key: "tasks",
      label: i18n.t("taskDecomposition"),
    },
    {
      key: "query",
      label: i18n.t("getWebInfoBySelector"),
    },
    {
      key: "send-to-zsxq",
      label: i18n.t("publishToZhiShiXingQiu"),
    },
    {
      key: "highlight",
      label: i18n.t("highlightWebContent"),
      disabled: true,
    },
    {
      key: "api",
      label: "API",
    },
    {
      label: i18n.t("jsonFormat"),
      key: "json",
    },
    {
      label: i18n.t("list"),
      key: "list",
    },
    {
      label: i18n.t("markdownFormat"),
      key: "markdown",
    },
    {
      label: i18n.t("chinese"),
      key: "translate-zh",
    },
    {
      label: i18n.t("english"),
      key: "translate-en",
    },
    {
      label: i18n.t("extractStructuredData"),
      key: "extract",
      temperature: 0,
    },
  ],
};

export { workflow };
