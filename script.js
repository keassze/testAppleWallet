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

// 检查设备是否支持 Apple Wallet
function isAppleWalletSupported() {
  const userAgent = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(userAgent);
  const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);

  return isIOS && isSafari;
}

// 检查本地是否有 .pkpass 文件
async function findLocalPassFile() {
  const possiblePaths = [
    "./Pass/maxims-coupon.pkpass",
    "./Pass/Loli.pkpass",
    "./Pass/coupon.pkpass",
  ];

  for (const path of possiblePaths) {
    try {
      const response = await fetch(path);
      if (response.ok) {
        return path;
      }
    } catch (error) {
      // 继续尝试下一个路径
    }
  }

  return null;
}

// 获取 .pkpass 文件
function getPassFile() {
  // 使用绝对路径，兼容 GitHub Pages
  const baseUrl =
    window.location.origin + window.location.pathname.replace(/\/[^\/]*$/, "");
  return baseUrl + "/Pass/maxims-coupon.pkpass";
}

// 添加到 Apple Wallet
async function addToAppleWallet() {
  try {
    showMessage("正在准备添加到 Apple Wallet...", "info");

    // 获取 .pkpass 文件的完整 URL
    const passUrl = getPassFile();
    console.log("Pass URL:", passUrl);

    // 检查文件是否存在
    try {
      const response = await fetch(passUrl, { method: "HEAD" });
      if (!response.ok) {
        console.error("Pass file not found:", response.status);
        throw new Error("Pass file not found");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      showMessage(
        "未找到 .pkpass 文件，请确保文件已上传到 GitHub Pages",
        "error"
      );
      return;
    }

    // 检测是否在 iOS 环境中（包括 WebView）
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isInWebView = /(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(
      navigator.userAgent
    );

    if (isIOS) {
      // 检测是否在 WebView 中
      if (isInWebView) {
        console.log("Detected WebView environment");

        // 方案1: 尝试使用 URL Scheme 通知原生 app
        // 你需要在 iOS app 中注册一个 URL Scheme，例如: myapp://addpass?url=xxx
        const appScheme = `myapp://addpass?url=${encodeURIComponent(passUrl)}`;
        console.log("Trying app scheme:", appScheme);

        // 尝试打开 app scheme
        const iframe = document.createElement("iframe");
        iframe.style.display = "none";
        iframe.src = appScheme;
        document.body.appendChild(iframe);

        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);

        // 同时尝试 window.webkit.messageHandlers（如果 app 支持）
        if (
          window.webkit &&
          window.webkit.messageHandlers &&
          window.webkit.messageHandlers.addToWallet
        ) {
          console.log("Using webkit message handler");
          window.webkit.messageHandlers.addToWallet.postMessage({
            action: "addPass",
            url: passUrl,
          });
          showMessage("正在打开 Apple Wallet...", "success");
          return;
        }

        // 方案2: 如果没有原生支持，尝试在新窗口打开
        console.log("Trying window.open");
        const newWindow = window.open(passUrl, "_blank");
        if (!newWindow) {
          // 如果被阻止，尝试直接导航
          console.log("window.open blocked, trying location.href");
          window.location.href = passUrl;
        }

        showMessage("正在打开 Apple Wallet...", "success");
      } else {
        // 在 Safari 中，直接导航到 .pkpass 文件
        console.log("In Safari, navigating to:", passUrl);
        window.location.href = passUrl;
        showMessage("正在打开 Apple Wallet...", "success");
      }
    } else {
      // 在其他浏览器中，提供下载链接
      const link = document.createElement("a");
      link.href = passUrl;
      link.download = "maxims-coupon.pkpass";
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showMessage(
        "已下载 .pkpass 文件，请在 iOS 设备上打开以添加到 Apple Wallet",
        "success"
      );
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

    // 检测环境并更新按钮文本
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isInWebView = /(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(
      navigator.userAgent
    );

    console.log("Environment:", {
      isIOS,
      isInWebView,
      userAgent: navigator.userAgent,
    });

    // 在 iOS 环境中显示"添加到 Apple Wallet"
    if (isIOS) {
      addButton.innerHTML = `
        <span class="wallet-icon">📱</span>
        添加到 Apple Wallet
      `;
      if (isInWebView) {
        addButton.title = "在 WebView 中打开 Apple Wallet";
      }
    } else {
      addButton.innerHTML = `
        <span class="wallet-icon">📱</span>
        下载 .pkpass 文件
      `;
      addButton.title = "下载 .pkpass 文件，然后在 iOS 设备上打开";
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

  // 输出调试信息
  console.log("Page loaded, Pass URL will be:", getPassFile());
});
