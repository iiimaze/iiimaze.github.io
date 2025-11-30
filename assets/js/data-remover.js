// data-remover.js - 이미지 메타데이터 제거 기능
(function() {
  'use strict';

  // DOM 로드 대기
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    let uploadedFiles = [];
    let processedFiles = [];

    const uploadArea = document.getElementById("uploadArea");
    const fileInput = document.getElementById("fileInput");
    const batchInfo = document.getElementById("batchInfo");
    const fileList = document.getElementById("fileList");
    const batchButtons = document.getElementById("batchButtons");
    const singleFileView = document.getElementById("singleFileView");
    const previewImage = document.getElementById("previewImage");
    const fileInfo = document.getElementById("fileInfo");
    const metadataList = document.getElementById("metadataList");
    const metadataWarning = document.getElementById("metadataWarning");
    const riskSummary = document.getElementById("riskSummary");
    const progressBar = document.getElementById("progressBar");

    // 요소가 없으면 종료 (다른 페이지에서 실행될 수 있으므로)
    if (!uploadArea || !fileInput) {
      console.log('data-remover.js: 요소를 찾을 수 없음. 다른 페이지입니다.');
      return;
    }

    console.log('data-remover.js: 초기화 성공. 이벤트 리스너 등록 중...');

    uploadArea.addEventListener("click", () => {
      console.log('uploadArea 클릭됨!');
      fileInput.click();
    });

    fileInput.addEventListener("change", (e) => {
      console.log('fileInput change 이벤트 발생:', e.target.files.length, '개 파일');
      const files = Array.from(e.target.files);
      if (files.length > 0) handleFiles(files);
    });

    uploadArea.addEventListener("dragover", (e) => {
      e.preventDefault();
      uploadArea.classList.add("dragover");
    });

    uploadArea.addEventListener("dragleave", () => {
      uploadArea.classList.remove("dragover");
    });

    uploadArea.addEventListener("drop", (e) => {
      e.preventDefault();
      uploadArea.classList.remove("dragover");
      const files = Array.from(e.dataTransfer.files).filter((f) =>
        f.type.startsWith("image/")
      );
      if (files.length > 0) handleFiles(files);
    });

    function handleFiles(files) {
      const validFiles = files.filter((file) => {
        if (file.size > 20 * 1024 * 1024) {
          alert(`${file.name}: 파일 크기는 20MB 이하여야 합니다.`);
          return false;
        }
        return true;
      });

      if (validFiles.length === 0) return;

      uploadedFiles = validFiles.map((file, index) => ({
        id: Date.now() + index,
        file: file,
        status: "pending",
        metadata: null,
        cleanedBlob: null,
      }));

      if (uploadedFiles.length === 1) {
        displaySingleFile(uploadedFiles[0]);
      } else {
        displayBatchFiles();
      }
    }

    async function displaySingleFile(fileObj) {
      singleFileView.classList.remove("section-hidden");
      batchInfo.classList.add("section-hidden");
      fileList.classList.add("section-hidden");
      batchButtons.classList.add("section-hidden");

      const file = fileObj.file;

      const reader = new FileReader();
      reader.onload = (e) => {
        previewImage.src = e.target.result;
      };
      reader.readAsDataURL(file);

      fileInfo.innerHTML = `
        <strong>${file.name}</strong><br>
        크기: ${(file.size / 1024).toFixed(2)} KB<br>
        형식: ${file.type}
      `;

      await extractMetadata(file);
    }

    function displayBatchFiles() {
      singleFileView.classList.add("section-hidden");
      batchInfo.classList.remove("section-hidden");
      fileList.classList.remove("section-hidden");
      batchButtons.classList.remove("section-hidden");

      document.getElementById("fileCount").textContent = uploadedFiles.length;

      let html = "";
      uploadedFiles.forEach((fileObj) => {
        const statusClass = `status-${fileObj.status}`;
        const statusText = {
          pending: "대기 중",
          processing: "처리 중...",
          complete: "완료 ✓",
          error: "오류",
        }[fileObj.status];

        html += `
          <div class="file-item" id="file-${fileObj.id}">
            <div class="file-item-info">
              <div class="file-item-name">${fileObj.file.name}</div>
              <div class="file-item-size">${(fileObj.file.size / 1024).toFixed(
                2
              )} KB - ${fileObj.file.type}</div>
            </div>
            <div class="file-item-status ${statusClass}" id="status-${
          fileObj.id
        }">${statusText}</div>
          </div>
        `;
      });

      fileList.innerHTML = html;
    }

    async function processAllFiles() {
      const processBtn = document.getElementById("processBtn");
      const downloadBtn = document.getElementById("downloadBtn");

      processBtn.disabled = true;
      processedFiles = [];

      for (let i = 0; i < uploadedFiles.length; i++) {
        const fileObj = uploadedFiles[i];
        fileObj.status = "processing";
        updateFileStatus(fileObj);

        const progress = (i / uploadedFiles.length) * 100;
        progressBar.style.width = `${progress}%`;

        try {
          const cleanedBlob = await removeMetadataFromFile(fileObj.file);
          fileObj.cleanedBlob = cleanedBlob;
          fileObj.status = "complete";
          processedFiles.push(fileObj);
        } catch (error) {
          fileObj.status = "error";
        }

        updateFileStatus(fileObj);
      }

      progressBar.style.width = "100%";
      processBtn.disabled = false;
      downloadBtn.disabled = false;

      alert(
        `처리 완료! ${processedFiles.length}/${uploadedFiles.length} 파일 성공`
      );
    }

    function updateFileStatus(fileObj) {
      const statusEl = document.getElementById(`status-${fileObj.id}`);
      if (!statusEl) return;

      const statusClass = `status-${fileObj.status}`;
      const statusText = {
        pending: "대기 중",
        processing: "처리 중...",
        complete: "완료 ✓",
        error: "오류",
      }[fileObj.status];

      statusEl.className = `file-item-status ${statusClass}`;
      statusEl.textContent = statusText;
    }

    async function downloadAllFiles() {
      if (processedFiles.length === 0) return;

      const zip = new JSZip();
      const customFileNameInput = document.getElementById('customFileName');
      const customBaseName = customFileNameInput ? customFileNameInput.value.trim() : '';

      processedFiles.forEach((fileObj, index) => {
        let newFileName;

        if (customBaseName) {
          // 사용자가 파일명을 입력한 경우
          const extension = getFileExtension(fileObj.file.name);
          if (index === 0) {
            // 첫 번째 파일: "입력한파일명.jpg"
            newFileName = `${customBaseName}.${extension}`;
          } else {
            // 두 번째 이후: "입력한파일명1.jpg", "입력한파일명2.jpg"
            newFileName = `${customBaseName}${index}.${extension}`;
          }
        } else {
          // 파일명을 입력하지 않은 경우: 기존 로직
          newFileName = `cleaned_${fileObj.file.name}`;
        }

        zip.file(newFileName, fileObj.cleanedBlob);
      });

      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cleaned_images_${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

    // 파일 확장자 추출 헬퍼 함수
    function getFileExtension(filename) {
      const parts = filename.split('.');
      return parts.length > 1 ? parts[parts.length - 1] : 'jpg';
    }

    async function removeMetadataFromFile(file) {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0);

          let mimeType = file.type;
          if (mimeType === "image/png") mimeType = "image/png";
          else if (mimeType === "image/webp") mimeType = "image/webp";
          else mimeType = "image/jpeg";

          canvas.toBlob(
            (blob) => {
              if (blob) resolve(blob);
              else reject(new Error("Blob 생성 실패"));
            },
            mimeType,
            0.95
          );
        };
        img.onerror = () => reject(new Error("이미지 로드 실패"));

        const reader = new FileReader();
        reader.onload = (e) => {
          img.src = e.target.result;
        };
        reader.onerror = () => reject(new Error("파일 읽기 실패"));
        reader.readAsDataURL(file);
      });
    }

    function removeSingleMetadata() {
      if (uploadedFiles.length === 0) return;

      const fileObj = uploadedFiles[0];
      const file = fileObj.file;

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        let mimeType = file.type;
        if (mimeType === "image/png") mimeType = "image/png";
        else if (mimeType === "image/webp") mimeType = "image/webp";
        else mimeType = "image/jpeg";

        canvas.toBlob(
          (blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `cleaned_${file.name}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            alert("✅ 메타데이터가 제거된 이미지가 다운로드되었습니다!");
          },
          mimeType,
          0.95
        );
      };
      img.src = previewImage.src;
    }

    function resetUpload() {
      uploadedFiles = [];
      processedFiles = [];
      fileInput.value = "";

      singleFileView.classList.add("section-hidden");
      batchInfo.classList.add("section-hidden");
      fileList.classList.add("section-hidden");
      batchButtons.classList.add("section-hidden");

      previewImage.src = "";
      metadataList.innerHTML = "";
      metadataWarning.innerHTML = "";
      riskSummary.innerHTML = "";
      progressBar.style.width = "0%";

      document.getElementById("downloadBtn").disabled = true;

      // 파일명 입력 필드 초기화
      const customFileNameInput = document.getElementById('customFileName');
      if (customFileNameInput) {
        customFileNameInput.value = "";
      }
    }

    async function extractMetadata(file) {
      try {
        metadataList.innerHTML =
          '<div class="empty-state">메타데이터를 분석하는 중...</div>';

        let data = {};

        try {
          const exifrData = await exifr.parse(file, true);
          if (exifrData) {
            data = { ...data, ...exifrData };
          }
        } catch (e) {
          console.log("exifr 파싱 실패:", e);
        }

        if (!data || Object.keys(data).length === 0) {
          metadataList.innerHTML =
            '<div class="empty-state">메타데이터가 없습니다 ✅</div>';
          metadataWarning.innerHTML =
            '<div class="metadata-success">✅ 이 이미지에는 메타데이터가 없습니다.</div>';
          riskSummary.innerHTML = "";
          return;
        }

        let html = "";
        for (const [key, value] of Object.entries(data)) {
          let displayValue =
            typeof value === "object" ? JSON.stringify(value) : value;
          if (String(displayValue).length > 100) {
            displayValue = String(displayValue).substring(0, 100) + "...";
          }
          html += `
            <div class="metadata-item">
              <span class="metadata-key">${key}</span>
              <span class="metadata-value">${displayValue}</span>
            </div>
          `;
        }
        metadataList.innerHTML = html;

        if (
          data.latitude ||
          data.longitude ||
          data.GPSLatitude ||
          data.GPSLongitude
        ) {
          metadataWarning.innerHTML =
            '<div class="metadata-danger">⚠️ <strong>GPS 위치 정보</strong>가 포함되어 있습니다!</div>';
          riskSummary.innerHTML =
            '<div class="risk-summary">⚠️ <strong>위험!</strong> 이 메타데이터가 노출되면, 누군가 당신의 위치를 알 수 있습니다.</div>';
        }
      } catch (error) {
        metadataList.innerHTML =
          '<div class="empty-state">메타데이터를 읽을 수 없습니다</div>';
      }
    }

    // 전역 함수로 노출 (HTML의 onclick에서 사용)
    window.processAllFiles = processAllFiles;
    window.downloadAllFiles = downloadAllFiles;
    window.removeSingleMetadata = removeSingleMetadata;
    window.resetUpload = resetUpload;
  }
})();
