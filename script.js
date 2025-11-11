// 统一的 Wallet 支持（iOS + Android）

// Google Wallet JWT（从 generate-google-wallet-pass.js 生成）
const GOOGLE_WALLET_JWT =
  "eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJpc3MiOiJhZW9uLXdhbGxldEBleGFtcGxlLmNvbSIsImF1ZCI6Imdvb2dsZSIsInR5cCI6InNhdmV0b3dhbGxldCIsImlhdCI6MTc2Mjg0MjcxNywib3JpZ2lucyI6WyJodHRwczovL3lvdXItd2Vic2l0ZS5jb20iXSwicGF5bG9hZCI6eyJnZW5lcmljT2JqZWN0cyI6W3siaWQiOiJhZW9uLWNvdXBvbi0xNzYyODQyNzE3IiwiY2xhc3NJZCI6ImFlb24tY291cG9uLWNsYXNzIiwiZ2VuZXJpY1R5cGUiOiJHRU5FUklDX1RZUEVfVU5TUEVDSUZJRUQiLCJoZXhCYWNrZ3JvdW5kQ29sb3IiOiIjRTYwMDdFIiwibG9nbyI6eyJzb3VyY2VVcmkiOnsidXJpIjoiaHR0cHM6Ly95b3VyLXdlYnNpdGUuY29tL2xvZ28ucG5nIn0sImNvbnRlbnREZXNjcmlwdGlvbiI6eyJkZWZhdWx0VmFsdWUiOnsibGFuZ3VhZ2UiOiJ6aC1ISyIsInZhbHVlIjoiQUVPTiBMb2dvIn19fSwiY2FyZFRpdGxlIjp7ImRlZmF1bHRWYWx1ZSI6eyJsYW5ndWFnZSI6InpoLUhLIiwidmFsdWUiOiJBRU9OIOS8mOaDoOWIuCJ9fSwiaGVhZGVyIjp7ImRlZmF1bHRWYWx1ZSI6eyJsYW5ndWFnZSI6InpoLUhLIiwidmFsdWUiOiLmu6EkNTAw5YePJDUwIn19LCJ0ZXh0TW9kdWxlc0RhdGEiOlt7ImhlYWRlciI6IuS8mOaDoOeggSIsImJvZHkiOiJBRU9OMjAyNCIsImlkIjoiY29kZSJ9LHsiaGVhZGVyIjoi5pyJ5pWI5pyf6IezIiwiYm9keSI6IjIwMjUtMTItMzEiLCJpZCI6ImV4cGlyZXMifSx7ImhlYWRlciI6IuS9v-eUqOadoeasviIsImJvZHkiOiIxLiDmraTkvJjmg6DliLjku4XpmZBBRU9O5L-h55So5Y2h5oyB5Y2h5Lq65L2_55SoXG4yLiDljZXnrJTmtojotLnmu6FISyQ1MDDlj6_kvb_nlKhcbjMuIOS4jeWPr-S4juWFtuS7luS8mOaDoOWQjOaXtuS9v-eUqCIsImlkIjoidGVybXMifV0sImJhcmNvZGUiOnsidHlwZSI6IlFSX0NPREUiLCJ2YWx1ZSI6IkFFT04yMDI0LTAwMSIsImFsdGVybmF0ZVRleHQiOiJBRU9OMjAyNC0wMDEifX1dfX0.";

// 检测平台
function detectPlatform() {
  const userAgent = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(userAgent);
  const isAndroid = /Android/.test(userAgent);
  const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
  const isInWebView = /(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(
    userAgent
  );

  return {
    isIOS,
    isAndroid,
    isSafari,
    isInWebView,
    platform: isIOS ? "ios" : isAndroid ? "android" : "other",
  };
}

// 获取 Apple Wallet Pass URL
function getApplePassUrl() {
  const baseUrl =
    window.location.origin + window.location.pathname.replace(/\/[^\/]*$/, "");
  return baseUrl + "/Pass/maxims-coupon.pkpass";
}

// 获取 Google Wallet URL
function getGoogleWalletUrl() {
  return `https://pay.google.com/gp/v/save/${GOOGLE_WALLET_JWT}`;
}

// 添加到 Apple Wallet
async function addToAppleWallet() {
  try {
    showMessage("正在打开 Apple Wallet...", "info");

    const passUrl = getApplePassUrl();
    console.log("Apple Wallet Pass URL:", passUrl);

    // 检测是否在 React Native WebView 中
    const hasWebKitBridge =
      window.webkit &&
      window.webkit.messageHandlers &&
      window.webkit.messageHandlers.addToWallet;

    // 方案1: 使用 React Native Bridge
    if (hasWebKitBridge) {
      console.log("✅ 使用 React Native Bridge");
      window.webkit.messageHandlers.addToWallet.postMessage({
        action: "addToWallet",
        appleUrl: passUrl,
        googleJwt: GOOGLE_WALLET_JWT,
      });
      showMessage("正在打开 Apple Wallet...", "success");
      return;
    }

    // 方案2: 直接导航（在 Safari 中）
    console.log("⚠️ 使用直接导航");
    window.location.href = passUrl;
    showMessage("正在打开 Apple Wallet...", "success");
  } catch (error) {
    console.error("添加到 Apple Wallet 失败:", error);
    showMessage("添加失败: " + error.message, "error");
  }
}

// 添加到 Google Wallet
function addToGoogleWallet() {
  try {
    showMessage("正在打开 Google Wallet...", "info");

    const googleWalletUrl = getGoogleWalletUrl();
    console.log("Google Wallet URL:", googleWalletUrl);

    // 检测是否在 React Native WebView 中
    if (window.ReactNativeWebView) {
      console.log("✅ 在 React Native WebView 中");
      window.ReactNativeWebView.postMessage(
        JSON.stringify({
          action: "addToWallet",
          appleUrl: getApplePassUrl(),
          googleJwt: GOOGLE_WALLET_JWT,
          googleUrl: googleWalletUrl,
        })
      );
      showMessage("正在打开 Google Wallet...", "success");
      return;
    }

    // 直接打开 Google Wallet
    window.open(googleWalletUrl, "_blank");
    showMessage("正在打开 Google Wallet...", "success");
  } catch (error) {
    console.error("添加到 Google Wallet 失败:", error);
    showMessage("添加失败: " + error.message, "error");
  }
}

// 统一的添加到 Wallet 函数
async function addToWallet() {
  const { platform, isIOS, isAndroid } = detectPlatform();

  console.log("Platform detected:", platform);
  console.log("User Agent:", navigator.userAgent);

  if (isIOS) {
    await addToAppleWallet();
  } else if (isAndroid) {
    addToGoogleWallet();
  } else {
    showMessage("请在 iOS 或 Android 设备上打开", "error");
  }
}

// 显示消息提示
function showMessage(message, type = "info") {
  const existingMessage = document.querySelector(".message");
  if (existingMessage) {
    existingMessage.remove();
  }

  const messageDiv = document.createElement("div");
  messageDiv.className = `message message-${type}`;
  messageDiv.textContent = message;

  messageDiv.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: ${
      type === "error" ? "#ff4757" : type === "success" ? "#2ed573" : "#3742fa"
    };
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    z-index: 1000;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    animation: slideDown 0.3s ease;
  `;

  if (!document.querySelector("#message-styles")) {
    const style = document.createElement("style");
    style.id = "message-styles";
    style.textContent = `
      @keyframes slideDown {
        from {
          opacity: 0;
          transform: translateX(-50%) translateY(-20px);
        }
        to {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }
      }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(messageDiv);

  setTimeout(() => {
    if (messageDiv.parentNode) {
      messageDiv.style.animation = "slideDown 0.3s ease reverse";
      setTimeout(() => {
        messageDiv.remove();
      }, 300);
    }
  }, 3000);
}

// 页面加载完成后绑定事件
document.addEventListener("DOMContentLoaded", function () {
  const addButton = document.getElementById("addToWallet");
  const buttonText = document.getElementById("walletButtonText");

  if (addButton) {
    // 绑定统一的添加函数
    addButton.addEventListener("click", addToWallet);

    // 检测平台并更新按钮文本
    const { platform, isIOS, isAndroid } = detectPlatform();

    console.log("=".repeat(50));
    console.log("页面加载完成");
    console.log("平台:", platform);
    console.log("User Agent:", navigator.userAgent);
    console.log("Apple Wallet Pass:", getApplePassUrl());
    console.log("Google Wallet URL:", getGoogleWalletUrl());
    console.log("=".repeat(50));

    // 根据平台更新按钮文本
    if (buttonText) {
      if (isIOS) {
        buttonText.textContent = "添加到 Apple Wallet";
        addButton.title = "添加到 Apple Wallet";
      } else if (isAndroid) {
        buttonText.textContent = "添加到 Google Wallet";
        addButton.title = "添加到 Google Wallet";
      } else {
        buttonText.textContent = "添加到 Wallet";
        addButton.title = "请在移动设备上打开";
      }
    }
  }

  // 添加优惠券卡片的点击效果
  const couponCard = document.querySelector(".coupon-card");
  if (couponCard) {
    couponCard.addEventListener("click", function () {
      this.style.transform = "scale(0.98)";
      setTimeout(() => {
        this.style.transform = "scale(1)";
      }, 150);
    });
  }
});
