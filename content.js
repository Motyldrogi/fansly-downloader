const addDownloadButtonToModal = (modalItem, node) => {
  const closeButton = modalItem.getElementsByClassName("modal-close-button")[0];

  // Private message video
  if (node.classList.contains("video-element-wrapper")) {
    node = node.querySelector(".video");
  }
  if (node.closest(".preview")) {
    return;
  }

  // If already added or not found return
  if (node.parentNode.querySelector(".modal-download-button") != null) {
    return;
  }

  if (closeButton != null) {
    // Add new download button after node
    const button = buildDownloadButtonModal(closeButton);
    button.addEventListener("click", onDownloadClickModal);

    setButtonVisibility(button);

    node.parentNode.insertBefore(button, node.nextSibling);
  }
};

const setButtonVisibility = (button) => {
  // Make the button visible
  button.style.setProperty("display", "flex", "important");
  button.style.setProperty("opacity", "1", "important");
};

const buildDownloadButtonModal = (closeButton) => {
  // Create new div button
  const button = document.createElement("div");
  button.classList.add(...closeButton.classList);
  button.classList.add("modal-download-button", "modal-pulse");

  // Copy ngcontent for styles
  button.setAttribute(closeButton.attributes[0].name, closeButton.attributes[0].value);

  // Add download icon to container
  const buttonIcon = document.createElement("div");
  buttonIcon.classList.add("download-icon");
  buttonIcon.innerHTML =
    "<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' class='feather feather-download'><path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4'></path><polyline points='7 10 12 15 17 10'></polyline><line x1='12' y1='15' x2='12' y2='3'></line></svg>";

  // Copy ngcontent for styles
  buttonIcon.setAttribute(closeButton.attributes[0].name, closeButton.attributes[0].value);
  button.appendChild(buttonIcon);

  return button;
};

const getPathInfo = (event) => {
  const path = event.path || (event.composedPath && event.composedPath());
  if (!path) {
    console.log("Unable to get path information from browser.");
    return;
  }
  return path;
};

const onDownloadClickModal = async (event) => {
  // Get image or video relative to button
  const path = getPathInfo(event);

  const downloadLink =
    path[2].querySelector("video")?.src ||
    path[2].querySelectorAll(".image")[1]?.src ||
    path[2].querySelectorAll(".image")[0]?.src;

  const feedUsername = "fansly";

  try {
    await fetch(downloadLink, { credentials: "include" });
  } catch {
    const [videoUrl, audioUrl] = await getVideoUrl(path);

    console.log(videoUrl);
    console.log(audioUrl);

    let { createFFmpeg, fetchFile } = FFmpeg;
    let ffmpeg = createFFmpeg({
      log: true,
      corePath: chrome.runtime.getURL("ffmpeg/ffmpeg-core.js"),
    });

    if (!ffmpeg.isLoaded()) {
      await ffmpeg.load();
    }

    // write files to memory
    ffmpeg.FS("writeFile", "video.mp4", await fetchFile(videoUrl));
    ffmpeg.FS("writeFile", "audio.mp4", await fetchFile(audioUrl));

    // Run ffmpeg command to merge video and audio
    await ffmpeg.run("-i", "video.mp4", "-i", "audio.mp4", "-c", "copy", "output.mp4");

    // read the result
    let data = await ffmpeg.FS("readFile", "output.mp4");

    // create a URL
    let resultUrl = URL.createObjectURL(new Blob([data.buffer], { type: "video/mp4" }));

    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = feedUsername + "-" + downloadLink.split("/")[4].split("?")[0];
    a.click();
    a.remove();

    return;
  }

  if (downloadLink != null && !downloadLink.includes("mp4")) {
    fetch(downloadLink)
      .then((res) => res.text())
      .then((data) => {
        const type = getTypeFromBlobStart(data.slice(0, 10));

        const name = feedUsername + "-" + downloadLink.split("/")[3].split("?")[0].split("-").join("") + type;

        downloadFile(downloadLink, name);
      });
  } else if (downloadLink != null && downloadLink.includes("mp4")) {
    const name = feedUsername + "-" + downloadLink.split("/")[4].split("?")[0];

    downloadFile(downloadLink, name);
  }
};

const addDownloadButtonToFeed = (feedItem) => {
  const hasMedia = hasItemMedia(feedItem);
  if (hasMedia == false) {
    return;
  }

  const lastElem = feedItem.getElementsByClassName("feed-item-stats").length - 1;
  const stats = feedItem.getElementsByClassName("feed-item-stats")[lastElem];

  // If already added or not found return
  if (!stats || stats.querySelectorAll(".download").length > 0) {
    return;
  }

  const tipsButton = stats.getElementsByClassName("tips")[0];
  if (tipsButton != null) {
    // Add new download button after tip button
    const button = buildDownloadButtonFeed(tipsButton);
    button.addEventListener("click", onDownloadClickFeed);

    setButtonVisibility(button);

    tipsButton.parentNode.insertBefore(button, tipsButton.nextSibling);
  }
};

const buildDownloadButtonFeed = (tipsButton) => {
  // Create new div button
  const button = document.createElement("div");
  button.classList.add(...tipsButton.classList);
  button.classList.replace("tips", "download");

  // Copy ngcontent for styles
  button.setAttribute(tipsButton.attributes[0].name, tipsButton.attributes[0].value);

  // Create new icon container
  const buttonIconContainer = document.createElement("div");
  buttonIconContainer.classList.add(...tipsButton.children[0].classList);
  buttonIconContainer.classList.replace("green", "pink");

  // Copy ngcontent for styles
  buttonIconContainer.setAttribute(tipsButton.attributes[0].name, tipsButton.attributes[0].value);
  button.appendChild(buttonIconContainer);

  // Add text
  button.appendChild(document.createTextNode("Download"));

  // Add download icon to container
  const buttonIcon = document.createElement("div");
  buttonIcon.classList.add("download-icon");
  buttonIcon.innerHTML =
    "<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' class='feather feather-download'><path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4'></path><polyline points='7 10 12 15 17 10'></polyline><line x1='12' y1='15' x2='12' y2='3'></line></svg>";

  // Copy ngcontent for styles
  buttonIcon.setAttribute(tipsButton.attributes[0].name, tipsButton.attributes[0].value);
  buttonIconContainer.appendChild(buttonIcon);

  return button;
};

const onDownloadClickFeed = async (event) => {
  // Stop angular click events
  event.stopPropagation();

  const path = getPathInfo(event);

  console.log(path);

  const feedItemContent = path[2].closest(".feed-item-content");

  const preview = feedItemContent.querySelectorAll(".feed-item-preview")[0];
  if (!preview.classList.contains("single-preview")) {
    preview.querySelectorAll(".image")[0].click();
    return;
  }

  downloadLinks = getBlobUrls(feedItemContent);

  const feedUsername = feedItemContent.querySelector(".display-name").textContent.replace(/\s+/g, "");

  // Check if image or video
  downloadLinks.forEach(async (downloadLink) => {
    // check if the URl works or not. since Fansly has 2 ways of showing images and 1 of the 2 is f#cking autistic
    const _downloadLink = downloadLink.substr(4);

    try {
      await fetch(_downloadLink, {
        credentials: "include",
      });
    } catch {
      const [videoUrl, audioUrl] = await getVideoUrl(path);

      console.log(videoUrl);
      console.log(audioUrl);

      return;
    }

    if (downloadLink.startsWith("img:")) {
      fetch(downloadLink.substr(4))
        .then((res) => res.text())
        .then((data) => {
          const type = getTypeFromBlobStart(data.slice(0, 10));

          const name = feedUsername + "-" + downloadLink.split("/")[3].split("?")[0].split("-").join("") + type;

          downloadFile(downloadLink.substr(4), name);
        });
    } else {
      const name = feedUsername + "-" + downloadLink.split("/")[3] + ".mp4";

      downloadFile(downloadLink.substr(4), name);
    }
  });
};

const getTypeFromBlobStart = (blobStr) => {
  let type = ".png";

  if (blobStr.includes("GIF")) {
    type = ".gif";
  } else if (blobStr.includes("JPG")) {
    type = ".jpg";
  } else if (blobStr.includes("JPEG")) {
    type = ".jpeg";
  } else if (blobStr.includes("ftyp")) {
    type = ".mp4";
  }

  return type;
};

const hasItemMedia = (feedItem) => {
  let returnable = true;
  const preview = feedItem.querySelector(".feed-item-preview");

  if (preview) {
    let count = 0;
    const images = preview.querySelectorAll(".image");

    for (let i = 0; i < images.length; i++) {
      const img = images[i].querySelector(".image");
      if (img != null && img.src != null) {
        count++;
      }
    }

    if (count == 0) {
      returnable = false;
    }
  } else if (!preview) {
    returnable = false;
  }

  return returnable;
};

const getBlobUrls = (feedItem) => {
  let returnable = [];

  const preview = feedItem.querySelector(".feed-item-preview");

  let video = false;
  if (preview.querySelectorAll("video").length > 0) {
    video = true;
  }

  const images = preview.querySelectorAll(".image");

  for (let i = 0; i < images.length; i++) {
    if (images[i].querySelector(".image") != null) {
      const img = images[i].querySelector(".image");

      if (img.src != null && !video) {
        returnable.push("img:" + img.src);
      } else {
        const vid = preview.querySelector("video");
        if (vid) {
          returnable.push("vid:" + vid.src);
        }
      }
    }
  }

  return returnable;
};

const downloadFile = (url, name) => {
  // Download video
  if (url.includes("mp4")) {
    downloadVideo(url, name);
    return;
  }

  // Download image
  const link = document.createElement("a");
  link.href = url;

  link.setAttribute("download", name);
  document.body.appendChild(link);

  link.click();
  link.parentNode.removeChild(link);
};

const buildProgressItem = (name) => {
  // Create progress item
  const progressItem = document.createElement("div");
  progressItem.classList.add("item");
  progressItem.innerText = name;

  const progressBar = document.createElement("div");
  progressBar.classList.add("progress");

  const progressBarInner = document.createElement("div");
  progressBar.appendChild(progressBarInner);

  progressItem.appendChild(progressBar);

  return progressItem;
};

const updateProgressItem = ({ loaded, total }, progressItem) => {
  const percentage = Math.round((loaded / total) * 100) + "%";
  progressItem.style.width = percentage;
  progressItem.innerText = percentage;
};

const createProgressContainer = () => {
  // Create container for progress items
  const progressContainer = document.createElement("div");
  progressContainer.setAttribute("id", "progress-container");

  document.body.insertBefore(progressContainer, document.body.firstChild);
};

const finishedProgress = (progressItem, progressBar) => {
  // Remove progress item
  progressBar.innerText = "Finished download!";

  progressItem.style.transition = "opacity 1s ease-in 3s";

  progressItem.style.opacity = 0;
  setTimeout(() => {
    progressItem.parentNode.removeChild(progressItem);
  }, 4000);
};

const downloadVideo = async (url, name) => {
  const response = await fetch(url, {
    cache: "no-store",
    headers: new Headers({
      Origin: location.origin,
    }),
    mode: "cors",
  });
  const contentLength = response.headers.get("content-length");
  const total = parseInt(contentLength, 10);
  let loaded = 0;

  const res = new Response(
    new ReadableStream({
      async start(controller) {
        const reader = response.body.getReader();

        // Add progress bar
        const progressItem = buildProgressItem(name);
        const progressContainer = document.getElementById("progress-container");
        progressContainer.insertBefore(progressItem, progressContainer.firstChild);

        // Update progress
        const progressBar = progressItem.querySelector(".progress").firstChild;
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          loaded += value.byteLength;
          updateProgressItem({ loaded, total }, progressBar);
          controller.enqueue(value);
        }
        controller.close();

        finishedProgress(progressItem, progressBar);
      },
    }),
  );
  const blob = await res.blob();

  if (blob.size != 0) {
    let blobUrl = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = blobUrl;

    // Trigger download
    link.setAttribute("download", name);
    document.body.appendChild(link);

    link.click();
    link.parentNode.removeChild(link);
  }
};

const getMPD = () => {
  var capture_network_request = [];
  var capture_resource = performance.getEntriesByType("resource");
  for (var i = 0; i < capture_resource.length; i++) {
    if (capture_resource[i].initiatorType == "xmlhttprequest") {
      if (capture_resource[i].name.indexOf(".mpd") > -1) {
        capture_network_request.push(capture_resource[i].name);
      }
    }
  }
  return capture_network_request;
};

const getVideoUrl = async (path) => {
  function delay(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
  }

  const playButton = path[2].querySelector("div.play-button");
  playButton.click();

  // wait 1.5 seconds to compensate for any delays
  await delay(1500);

  // yes i am quite aware that this code is terrible and will 100% go wrong if someone uses it
  // too bad, there is no other way to do this
  const mpd = getMPD().at(-1);
  const baseURL = mpd?.split("/").slice(0, -1).join("/") + "/";

  let xmlDoc;
  await fetch(mpd, { credentials: "include" })
    .then((response) => response.text())
    .then((str) => new DOMParser().parseFromString(str, "text/xml"))
    .then((data) => (xmlDoc = data));

  const videoUrl =
    baseURL + xmlDoc?.querySelectorAll("AdaptationSet:nth-child(1) Representation > BaseURL")[0]?.textContent;
  const audioUrl =
    baseURL + xmlDoc?.querySelectorAll("AdaptationSet:nth-child(2) Representation > BaseURL")[0]?.textContent;

  return [videoUrl, audioUrl];
};

const checkVersionUpdate = () => {
  var currentVer = chrome.runtime.getManifest().version;

  fetch("https://api.github.com/repos/Motyldrogi/fansly-downloader/releases/latest")
    .then((res) => res.json())
    .then((data) => {
      if (currentVer != data.tag_name) {
        createUpdateContainer(currentVer, data.tag_name);
      }
    });
};

const createUpdateContainer = (currentVer, latestVer) => {
  const container = document.createElement("div");
  container.setAttribute("id", "update-container");
  container.innerHTML = `<a href="https://github.com/Motyldrogi/fansly-downloader/releases" target="_blank">
    Click here to update Fansly Downloader!</a>Your Version: <b>${currentVer}</b> - Latest Version: <b>${latestVer}</b>`;
  document.body.insertBefore(container, document.body.firstChild);

  const dismiss = document.createElement("div");
  dismiss.setAttribute("class", "dismiss");
  dismiss.innerText = "X";
  dismiss.addEventListener("click", dismissUpdateContainer);
  container.appendChild(dismiss);
};

const dismissUpdateContainer = (event) => {
  const path = getPathInfo(event);
  const container = path[1];
  container.parentNode.removeChild(container);
};

const afterPageLoad = () => {
  // Init after page load
  createProgressContainer();
  checkVersionUpdate();
};

const observerCallback = (mutationsList) => {
  mutationsList.forEach((mutation) => {
    if (!mutation.addedNodes) return;

    for (let i = 0; i < mutation.addedNodes.length; i++) {
      const node = mutation.addedNodes[i];
      const classList = node.classList;

      if (classList == null) return;

      // Image was added
      if (classList.contains("image")) {
        const feedItem = node.closest(".feed-item-content");
        if (feedItem) {
          addDownloadButtonToFeed(feedItem);
        }

        const modalItem = node.closest(".active-modal");
        if (modalItem) {
          addDownloadButtonToModal(modalItem, node);
        }
      }
    }
  });
};

const config = {
  attributes: true,
  childList: true,
  subtree: true,
  characterData: true,
};

const observer = new MutationObserver(observerCallback);

window.addEventListener("load", function () {
  if (!crossOriginIsolated) SharedArrayBuffer = new SharedArrayBuffer(); // FIXME SharedArrayBuffer is not defined
  // i want to fucking end myself
  observer.observe(document.body, config);
  afterPageLoad();
});
