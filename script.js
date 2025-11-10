// Apple Wallet Pass 数据结构
const passData = {
  formatVersion: 1,
  passTypeIdentifier: "pass.com.maxims.coupon",
  serialNumber: "MAXIMS20-001",
  teamIdentifier: "YOUR_TEAM_ID",
  organizationName: "美心西饼",
  description: "美心西饼8折优惠券",

  // Pass 样式
  coupon: {
    primaryFields: [
      {
        key: "discount",
        label: "优惠",
        value: "8折",
      },
    ],
    secondaryFields: [
      {
        key: "title",
        label: "优惠内容",
        value: "全场蛋糕8折优惠",
      },
    ],
    auxiliaryFields: [
      {
        key: "code",
        label: "优惠码",
        value: "MAXIMS20",
      },
      {
        key: "expires",
        label: "有效期至",
        value: "2025-12-31",
      },
    ],
    backFields: [
      {
        key: "terms",
        label: "使用条款",
        value:
          "1. 此优惠券不可与其他优惠同时使用\n2. 适用于香港所有美心西饼门店\n3. 最低消费HK$200\n4. 适用于所有生日蛋糕、芝士蛋糕及季节限定蛋糕",
      },
    ],
  },

  // 条形码
  barcode: {
    message: "1234567890123",
    format: "PKBarcodeFormatCode128",
    messageEncoding: "iso-8859-1",
  },

  // 颜色设置
  backgroundColor: "rgb(255, 107, 107)",
  foregroundColor: "rgb(255, 255, 255)",
  labelColor: "rgb(255, 255, 255)",

  // 过期时间
  expirationDate: "2025-12-31T23:59:59+08:00",

  // 相关日期
  relevantDate: "2024-11-05T00:00:00+08:00",
};

// 获取 .pkpass 文件
function getPassFile() {
  // 使用绝对路径，兼容 GitHub Pages
  const baseUrl =
    window.location.origin + window.location.pathname.replace(/\/[^\/]*$/, "");
  return baseUrl + "/Pass/maxims-coupon.pkpass";
}

// 添加到 Apple Wallet（简化版 - 仅使用 Bridge）
async function addToAppleWallet() {
  try {
    showMessage("正在准备添加到 Apple Wallet...", "info");

    // 获取 .pkpass 文件的完整 URL
    const passUrl = getPassFile();
    console.log("Pass URL:", passUrl);

    // 检测是否在 React Native WebView 中
    const isReactNativeWebView = window.ReactNativeWebView !== undefined;
    const hasWebKitBridge =
      window.webkit &&
      window.webkit.messageHandlers &&
      window.webkit.messageHandlers.addToWallet;

    console.log("Environment:", {
      isReactNativeWebView,
      hasWebKitBridge,
      userAgent: navigator.userAgent,
    });

    // 方案1: 使用 React Native Bridge（推荐）
    if (hasWebKitBridge) {
      console.log("✅ 使用 React Native Bridge");
      window.webkit.messageHandlers.addToWallet.postMessage({
        action: "addToWallet",
        url: passUrl,
      });
      showMessage("正在打开 Apple Wallet...", "success");
      return;
    }

    // 方案2: 降级方案 - 直接导航（在 Safari 中）
    console.log("⚠️ 未检测到 Bridge，使用降级方案");
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

    if (isIOS) {
      window.location.href = passUrl;
      showMessage("正在打开 Apple Wallet...", "success");
    } else {
      // 在其他浏览器中，提供下载
      const link = document.createElement("a");
      link.href = passUrl;
      link.download = "maxims-coupon.pkpass";
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showMessage("已下载 .pkpass 文件，请在 iOS 设备上打开", "success");
    }
  } catch (error) {
    console.error("添加到 Apple Wallet 失败:", error);
    showMessage("添加失败: " + error.message, "error");
  }
}

// 显示消息提示
function showMessage(message, type = "info") {
  // 移除现有的消息
  const existingMessage = document.querySelector(".message");
  if (existingMessage) {
    existingMessage.remove();
  }

  // 创建新消息
  const messageDiv = document.createElement("div");
  messageDiv.className = `message message-${type}`;
  messageDiv.textContent = message;

  // 添加样式
  messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: ${
          type === "error"
            ? "#ff4757"
            : type === "success"
            ? "#2ed573"
            : "#3742fa"
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

  // 添加动画样式
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

  // 3秒后自动移除
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

  if (addButton) {
    addButton.addEventListener("click", addToAppleWallet);

    // 检测环境
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const hasWebKitBridge =
      window.webkit &&
      window.webkit.messageHandlers &&
      window.webkit.messageHandlers.addToWallet;

    console.log("页面加载完成:", {
      isIOS,
      hasWebKitBridge,
      passUrl: getPassFile(),
    });

    // 更新按钮文本
    if (isIOS) {
      addButton.innerHTML = `
        <span class="wallet-icon">📱</span>
        添加到 Apple Wallet
      `;
    } else {
      addButton.innerHTML = `
        <span class="wallet-icon">📱</span>
        下载 .pkpass 文件
      `;
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
