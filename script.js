document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const skuFromURL = urlParams.get("sku");
  if (skuFromURL) {
    document.getElementById("skuInput").value = skuFromURL;
  }

  document.getElementById("analyzeBtn").addEventListener("click", async () => {
    const sku = document.getElementById("skuInput").value.trim();
    const cost = parseFloat(document.getElementById("costInput").value);
    const resultBox = document.getElementById("resultBox");
    const resultText = document.getElementById("resultText");

    if (!sku || isNaN(cost)) {
      resultText.innerText = "SKU와 원가를 모두 입력해주세요.";
      resultBox.style.display = "block";
      return;
    }

    resultText.innerText = "분석 중입니다...";
    resultBox.style.display = "block";

    try {
      const response = await fetch("https://luka-resell-proxy.vercel.app/api/ebay?sku=" + sku);
      const data = await response.json();

      if (data.status === "success") {
        const avgPrice = data.avgPrice;
        const salesVolume = data.salesVolume;
        const fee = avgPrice * 0.12;
        const shipping = 18000;
        const margin = Math.round(avgPrice - fee - shipping - cost);
        const profitTotal = margin * salesVolume;

        resultText.innerHTML = `
          SKU: ${sku}<br>
          평균 판매가: $${avgPrice}<br>
          수수료: $${fee.toFixed(2)}<br>
          배송비: ₩${shipping}<br>
          원가: ₩${cost}<br>
          ▶ 순마진: ₩${margin}<br>
          최근 30일 판매량: ${salesVolume}개<br>
          ▶ 월 수익 예상: ₩${profitTotal}
        `;

        updateHistory(sku, margin, salesVolume);
      } else {
        resultText.innerText = "eBay 데이터 분석 실패. SKU를 확인해주세요.";
      }
    } catch (error) {
      resultText.innerText = "오류 발생: " + error;
    }
  });

  function updateHistory(sku, margin, volume) {
    const historyList = document.getElementById("historyList");
    const newItem = document.createElement("li");
    newItem.textContent = `${sku} - 마진 ₩${margin} (${volume}개 판매)`;
    historyList.prepend(newItem);
    if (historyList.children.length > 20) {
      historyList.removeChild(historyList.lastChild);
    }
  }
});
