/*****************
  FANSLY DOWNLOADER
*****************/

// Callback function to execute when mutations are observed
var observerCallback = function (mutationsList) {
  mutationsList.forEach((mutation) => {
    if (!mutation.addedNodes) return;

    for (let i = 0; i < mutation.addedNodes.length; i++) {
      let node = mutation.addedNodes[i];
      var classList = node.classList;

      // Feed was added
      if (classList != null && classList.contains("image")) {
        var feedItem = node.closest(".feed-item-content");
        if (feedItem) {
          addDownloadButtonToFeed(feedItem);
        }
      }

      // Modal was added
      if (
        classList != null &&
        classList.contains("image") &&
        (classList.contains("contain-no-grow") || classList.contains("contain"))
      ) {
        var modalItem = node.closest(".active-modal");
        if (modalItem) {
          addDownloadButtonToModal(modalItem, node);
        }
      }
    }
  });
};

// MutationObserver config
var config = {
  attributes: true,
  childList: true,
  subtree: true,
  characterData: true,
};

// Create an observer instance linked to the callback function
var observer = new MutationObserver(observerCallback);

// Start observing the target node for configured mutations
window.addEventListener("load", function () {
  observer.observe(document.body, config);
});

/*****************
  MODAL CONTENT
*****************/

// Add download button to modal
function addDownloadButtonToModal(modalItem, node) {
  var closeButton = modalItem.getElementsByClassName("modal-close-button")[0];

  // If already added or not found return
  if (node.parentNode.querySelector(".modal-download-button") != null) {
    return;
  }

  if (closeButton != null) {
    var button = buildDownloadButtonModal(closeButton);

    // Add new download button after close button
    node.parentNode.insertBefore(button, node.nextSibling);

    button.addEventListener("click", onDownloadClickModal);
  }
}

// Build a download button for modal
function buildDownloadButtonModal(closeButton) {
  // Create new div button
  var button = document.createElement("div");
  button.classList.add(...closeButton.classList);
  button.classList.add("modal-download-button", "modal-pulse");
  // Copy ngcontent for styles
  button.setAttribute(
    closeButton.attributes[0].name,
    closeButton.attributes[0].value
  );

  // Add download icon to container
  var buttonIcon = document.createElement("i");
  buttonIcon.classList.add("fas", "fa-download");
  // Copy ngcontent for styles
  buttonIcon.setAttribute(
    closeButton.attributes[0].name,
    closeButton.attributes[0].value
  );
  button.appendChild(buttonIcon);

  return button;
}

// Click event for the added download button
function onDownloadClickModal(event) {
  var downloadLink = null;
  try {
    downloadLink = event.path[3].querySelector(".contain-no-grow").src;
  } catch (error) {
    downloadLink = event.path[3].querySelectorAll(".contain")[1].src;
  }

  var feedUsername = "fansly";

  if (downloadLink != null && !downloadLink.includes("mp4")) {
    fetch(downloadLink)
      .then((res) => res.text())
      .then((data) => {
        var type = getTypeFromBlobStart(data.slice(0, 10));

        var name =
          feedUsername + "-" + Math.random().toString(36).substr(2) + type;
        downloadFile(downloadLink, name);
      });
  } else if (downloadLink != null && downloadLink.includes("mp4")) {
    var name = feedUsername + "-" + downloadLink.split("/")[4].split("?")[0];
    downloadFile(downloadLink, name);
  }
}

/*****************
  FEED CONTENT
*****************/

// When body is observed then add button to feed
function addDownloadButtonToFeed(feedItem) {
  var hasMedia = hasItemMedia(feedItem);
  if (hasMedia == false) {
    return;
  }

  var lastElem = feedItem.getElementsByClassName("feed-item-stats").length - 1;
  var stats = feedItem.getElementsByClassName("feed-item-stats")[lastElem];

  // If already added or not found return
  if (!stats || stats.querySelectorAll(".download").length > 0) {
    return;
  }

  var tipsButton = stats.getElementsByClassName("tips")[0];
  if (tipsButton != null) {
    var button = buildDownloadButtonFeed(tipsButton);

    // Add new download button after tip button
    tipsButton.parentNode.insertBefore(button, tipsButton.nextSibling);

    button.addEventListener("click", onDownloadClickFeed);
  }
}

// Build a download button
function buildDownloadButtonFeed(tipsButton) {
  // Create new div button
  var button = document.createElement("div");
  button.classList.add(...tipsButton.classList);
  button.classList.replace("tips", "download");
  // Copy ngcontent for styles
  button.setAttribute(
    tipsButton.attributes[0].name,
    tipsButton.attributes[0].value
  );

  // Create new icon container
  var buttonIconContainer = document.createElement("div");
  buttonIconContainer.classList.add(...tipsButton.children[0].classList);
  buttonIconContainer.classList.replace("green", "pink");
  // Copy ngcontent for styles
  buttonIconContainer.setAttribute(
    tipsButton.attributes[0].name,
    tipsButton.attributes[0].value
  );
  button.appendChild(buttonIconContainer);

  // Add text
  button.appendChild(document.createTextNode("Download"));

  // Add download icon to container
  var buttonIcon = document.createElement("i");
  buttonIcon.classList.add("fas", "fa-download");
  // Copy ngcontent for styles
  buttonIcon.setAttribute(
    tipsButton.attributes[0].name,
    tipsButton.attributes[0].value
  );
  buttonIconContainer.appendChild(buttonIcon);

  return button;
}

// Click event for the added download buttons
function onDownloadClickFeed(event) {
  // Stop angular click events
  event.stopPropagation();

  var feedItemContent = event.path[2].closest(".feed-item-content");

  var preview = feedItemContent.querySelectorAll(".feed-item-preview")[0];
  if (!preview.classList.contains("single-preview")) {
    preview.querySelectorAll(".image")[0].click();
    return;
  }

  downloadLinks = getBlobUrls(feedItemContent);

  var feedUsername = feedItemContent
    .querySelector(".display-name")
    .textContent.replace(/\s+/g, "");

  // Check if image or video
  downloadLinks.forEach((downloadLink) => {
    if (downloadLink.startsWith("img:")) {
      fetch(downloadLink.substr(4))
        .then((res) => res.text())
        .then((data) => {
          var type = getTypeFromBlobStart(data.slice(0, 10));

          var name =
            feedUsername + "-" + Math.random().toString(36).substr(2) + type;
          downloadFile(downloadLink.substr(4), name);
        });
    } else {
      var name = feedUsername + "-" + downloadLink.split("/")[4].split("?")[0];
      downloadFile(downloadLink.substr(4), name);
    }
  });
}

/*****************
  GENERAL CONTENT
*****************/

// Get the type from the first 10 chars of blob data
function getTypeFromBlobStart(blobStr) {
  var type = ".png";

  if (blobStr.includes("GIF")) {
    type = ".gif";
  } else if (blobStr.includes("JPG")) {
    type = ".jpg";
  } else if (blobStr.includes("JPEG")) {
    type = ".jpeg";
  }

  return type;
}

// Checks if feed item has downloadable content
function hasItemMedia(feedItem) {
  var returnable = true;
  var preview = feedItem.querySelector(".feed-item-preview");

  if (preview) {
    var count = 0;
    var images = preview.querySelectorAll(".image");
    for (let i = 0; i < images.length; i++) {
      var img = images[i].querySelector(".image");
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
}

// Get content src relative to the clicked download button
function getBlobUrls(feedItem) {
  var returnable = [];

  var preview = feedItem.querySelector(".feed-item-preview");

  if (preview.querySelectorAll(".video").length > 0) {
    var video = true;
  }

  var images = preview.querySelectorAll(".image");
  for (let i = 0; i < images.length; i++) {
    if (images[i].querySelector(".image") != null) {
      var img = images[i].querySelector(".image");

      if (img.src != null && !video) {
        returnable.push("img:" + img.src);
      } else {
        var vid = preview.querySelector(".video");
        if (vid) {
          returnable.push("vid:" + vid.src);
        }
      }
    }
  }

  return returnable;
}

// Download the file
function downloadFile(url, name) {
  // Download video
  if (url.includes("mp4")) {
    this.downloadWithFetch(url, name);

    return;
  }
  // Download image
  var link = document.createElement("a");
  link.href = url;

  link.setAttribute("download", name);
  document.body.appendChild(link);

  link.click();
  link.parentNode.removeChild(link);
}

// Download as blob
function downloadWithFetch(url, name) {
  var link = document.createElement("a");

  fetch(url, {
    headers: new Headers({
      Origin: location.origin,
    }),
    mode: "cors",
  })
    .then((response) => response.blob())
    .then((blob) => {
      let blobUrl = window.URL.createObjectURL(blob);

      link.href = blobUrl;

      // Trigger download
      link.setAttribute("download", name);
      document.body.appendChild(link);

      link.click();
      link.parentNode.removeChild(link);
    })
    .catch((e) => console.error(e));
}
