---
layout: default
title: ZIF
subtitle: "동영상 GIF 변환 서비스"
tagline: "서버에 저장 no! 100% 사생활 보장 GIF 생성 프로그램"
description: "ZIF는 브라우저에서 100% 로컬로 동작하는 프리미엄 Video to GIF 변환기입니다. 설치 없이 안전하게 GIF 변환을 수행하고, 고화질 GIF 애니메이션을 쉽고 빠르게 제작하세요."
---

<div class="zif-app">
  <main class="content">
   <h1 class="sr-only">ZIF Video to GIF 변환 서비스</h1>
    <section class="upload-section" id="uploadSection">
      <div class="upload-icon">📁</div>
      <div class="upload-text" id="uploadText">비디오 파일을 선택하세요</div>
      <div class="upload-subtext" id="uploadSubtext">클릭하거나 드래그 & 드롭으로 업로드하면 GIF가 생성됩니다.</div>
      <input type="file" id="videoInput" accept="video/*">
    </section>

    <!-- 프리뷰 -->
    <section class="preview-section" id="previewSection" style="display:none;">
          <h2 class="sr-only">GIF 변환 프레임 미리보기</h2>
      <div class="section-title">
        <span>📸</span>
        <span id="previewTitle">프레임 미리보기</span>
      </div>
      <div id="preview"></div>
    </section>

    <!-- 결과 -->
    <section class="output-section" id="outputSection" style="display:none;">
     <h2 class="sr-only">생성된 GIF 다운로드</h2>
      <div class="section-title">
        <span>✨</span>
        <span id="outputTitle">생성된 GIF</span>
      </div>
      <div id="output"></div>
      <a id="downloadLink" style="display:none;" download="output.gif">
        <span id="downloadText">GIF 다운로드</span>
      </a>

      <!-- 고급 설정 -->
      <div class="advanced-settings" id="advancedSettings">
      <h2 class="sr-only">GIF 변환 고급 설정</h2>
        <div class="advanced-settings-header" id="advancedToggle">
          <div class="advanced-settings-title">
            <span>⚙️</span>
            <span id="advancedSettingsTitle">고급 설정</span>
          </div>
          <div class="toggle-icon" id="toggleIcon">▼</div>
        </div>
        <div class="advanced-content" id="advancedContent">
          <div class="settings-grid">
            <div class="setting-group">
              <label for="interval" id="intervalLabel">프레임 간격 (초)</label>
              <input type="number" id="interval" value="0.3" step="0.1">
            </div>
            <div class="setting-group">
              <label for="outputWidth" id="outputWidthLabel">출력 가로 크기 (px)</label>
              <input type="number" id="outputWidth" value="420" min="1">
            </div>
            <div class="setting-group">
              <label for="quality" id="qualityLabel">품질 (1~100)</label>
              <input type="number" id="quality" value="90" min="1" max="100">
            </div>
            <div class="setting-group">
              <label for="fps" id="fpsLabel">FPS (프레임/초)</label>
              <input type="number" id="fps" value="10" min="1" max="60">
            </div>
          </div>

          <button id="reconvertBtn" class="convert-btn">
            <span id="reconvertText">🔄 새 설정으로 GIF 재생성</span>
          </button>
        </div>
      </div>
    </section>

  </main>
</div>

<!-- 처리용 요소(한 번만) -->

<video id="video" crossorigin="anonymous"></video>
<canvas id="canvas"></canvas>

<!-- 정적 자산: 빌드 산출물만 로드 (중복 로드 금지) -->
<link rel="stylesheet" href="{{ '/assets/zif/style.css' | relative_url }}">
<script src="{{ '/coi-serviceworker.js' | relative_url }}"></script>
<script type="module" src="{{ '/assets/zif/main.js' | relative_url }}"></script>
