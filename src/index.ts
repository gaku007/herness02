/**
 * 元気になるWebサイト - ボタンクリック処理
 * ボタンをクリックすると「ファイト！」メッセージをDOMに表示します
 */

interface MessageOptions {
  duration?: number;
}

/**
 * メッセージを表示する関数
 * @param message - 表示するメッセージテキスト
 * @param elementId - メッセージを表示する要素のID
 * @param options - オプション設定（表示時間など）
 */
export const displayMessage = (
  message: string,
  elementId: string,
  options: MessageOptions = {}
): void => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.warn(`Element with ID "${elementId}" not found`);
    return;
  }

  element.textContent = message;
  element.style.opacity = "1";

  if (options.duration && options.duration > 0) {
    setTimeout(() => {
      element.style.opacity = "0";
      element.style.transition = "opacity 0.5s ease-out";
    }, options.duration);
  }
};

/**
 * ボタンクリック時のイベントハンドラ
 */
export const handleGenkiButtonClick = (): void => {
  const messages = [
    "ファイト！ 💪",
    "頑張ろう！ 🔥",
    "いけるよ！ ✨",
    "あなたならできる！ ⭐",
    "応援してます！ 🎉",
  ];

  const randomMessage = messages[Math.floor(Math.random() * messages.length)];
  displayMessage(randomMessage, "message", { duration: 3000 });
};

/**
 * DOMContentLoaded 時に初期化
 */
const initializeApp = (): void => {
  const button = document.getElementById("genkiButton");

  if (!button) {
    console.error('Error: Button with ID "genkiButton" not found');
    return;
  }

  button.addEventListener("click", handleGenkiButtonClick);
  console.log("Element initialized successfully");
};

// ドキュメント読み込み完了時に初期化
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeApp);
} else {
  initializeApp();
}
