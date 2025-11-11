// 统一的 Wallet 支持（iOS + Android）

// Google Wallet JWT（从 generate-google-wallet-pass.js 生成）
const GOOGLE_WALLET_JWT =
  "eyJpc3MiOiJubWF1YXQtcGFzc2VzQG5tYS11YXQuaWFtLmdzZXJ2aWNlYWNjb3VudC5jb20iLCJhdWQiOiJnb29nbGUiLCJ0eXAiOiJzYXZldG9hbmRyb2lkcGF5IiwiaWF0IjoxNjU1ODkxNzU1LCJvcmlnaW5zIjpbImh0dHA6Ly9sb2NhbGhvc3Q6OTA2NCJdLCJwYXlsb2FkIjp7ImV2ZW50VGlja2V0T2JqZWN0cyI6W3siYmFyY29kZSI6eyJhbHRlcm5hdGVUZXh0IjoiUFBMREVNT0FFT04xOTkiLCJ0eXBlIjoiUVJfQ09ERSIsInZhbHVlIjoiUFBMREVNT0FFT04xOTkifSwiY2xhc3NJZCI6IjMzODgwMDAwMDAwMjIxMjA1NjQuQ0xBU1NfZWVhMjUyZDEtODBlMC00YjE0LTk1ZWItNjczYTk1ZTExMmIyIiwiaWQiOiIzMzg4MDAwMDAwMDIyMTIwNTY0Lk9CSkVDVF9jYjQwYzA1ZS0wOTg5LTQ5OWItOGJiZS1lMmFkYWQ1ZGRlN2EiLCJzdGF0ZSI6ImFjdGl2ZSJ9XX19.H8dNAgZ6HRr-q4WD2VqC7BiL_vYFd7QZVnRHCaRzbFxX337hRIRHSdy7uWte2vX_YtUyOlu-xg4DWnpwEicNc3PeoT0feEnuvb0-ZvWNDqmTJiw1LANIhxGAA6gNTB6GMkxwNX6CRz8YbpOcMgdIDjqZh9fRxil8QumjNuOYbqj8J11guC6SsepsQMPf34Oo7h9ex80CEAvy7LJ1jzwp41Z8Rp7B7TyLyPZsrfaYimNgyw7sIuKx28W9jRJWeLKUVJC2iZp_x2Ecdr97d5wM2VLD4SESG0stgRcSpyLDKgwWHGIQMEF7wtNsxYVkIU_nqEoeZHU66FUIOwhXszKdMg";

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
