let addDownloadButtonToModal = (modalItem, node) => {
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

let setButtonVisibility = (button) => {
    // Make the button visible
    button.style.setProperty("display", "flex", "important");
    button.style.setProperty("opacity", "1", "important");
}

let buildDownloadButtonModal = (closeButton) => {
    // Create new div button
    const button = document.createElement("div");
    button.classList.add(...closeButton.classList);
    button.classList.add("modal-download-button", "modal-pulse");

    // Copy ngcontent for styles
    button.setAttribute(
        closeButton.attributes[0].name,
        closeButton.attributes[0].value
    );

    // Add download icon to container
    const buttonIcon = document.createElement("i");
    buttonIcon.classList.add("fas", "fa-download");

    // Copy ngcontent for styles
    buttonIcon.setAttribute(
        closeButton.attributes[0].name,
        closeButton.attributes[0].value
    );
    button.appendChild(buttonIcon);

    return button;
};

let onDownloadClickModal = (event) => {
    // Get image or video relative to button
    
    var path = event.path || (event.composedPath && event.composedPath());
    if(!path) {
      console.log("Unable to get path information from browser.");
      return;
    }
    
    const downloadLink = path[2].querySelector(".video")?.src ||
        event.path[2].querySelectorAll(".image")[1]?.src ||
        event.path[2].querySelectorAll(".image")[0]?.src;

    const feedUsername = "fansly";

    if (downloadLink != null && !downloadLink.includes("mp4")) {
        fetch(downloadLink)
        .then((res) => res.text())
        .then((data) => {
            const type = getTypeFromBlobStart(data.slice(0, 10));

            const name = feedUsername + "-" + Math.random().toString(36).substr(2) + type;

            downloadFile(downloadLink, name);
        });
    } else if (downloadLink != null && downloadLink.includes("mp4")) {
        const name = feedUsername + "-" + downloadLink.split("/")[4].split("?")[0];

        downloadFile(downloadLink, name);
    }
};

let addDownloadButtonToFeed = (feedItem) => {
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

let buildDownloadButtonFeed = (tipsButton) => {
    // Create new div button
    const button = document.createElement("div");
    button.classList.add(...tipsButton.classList);
    button.classList.replace("tips", "download");

    // Copy ngcontent for styles
    button.setAttribute(
        tipsButton.attributes[0].name,
        tipsButton.attributes[0].value
    );

    // Create new icon container
    const buttonIconContainer = document.createElement("div");
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
    const buttonIcon = document.createElement("i");
    buttonIcon.classList.add("fas", "fa-download");

    // Copy ngcontent for styles
    buttonIcon.setAttribute(
        tipsButton.attributes[0].name,
        tipsButton.attributes[0].value
    );
    buttonIconContainer.appendChild(buttonIcon);

    return button;
};

let onDownloadClickFeed = (event) => {
    // Stop angular click events
    event.stopPropagation();

    const feedItemContent = event.path[2].closest(".feed-item-content");

    const preview = feedItemContent.querySelectorAll(".feed-item-preview")[0];
    if (!preview.classList.contains("single-preview")) {
        preview.querySelectorAll(".image")[0].click();
        return;
    }

    downloadLinks = getBlobUrls(feedItemContent);

    const feedUsername = feedItemContent.querySelector(".display-name").textContent.replace(/\s+/g, "");

    // Check if image or video
    downloadLinks.forEach((downloadLink) => {
        if (downloadLink.startsWith("img:")) {
            fetch(downloadLink.substr(4))
            .then((res) => res.text())
            .then((data) => {
                const type = getTypeFromBlobStart(data.slice(0, 10));

                const name = feedUsername + "-" + Math.random().toString(36).substr(2) + type;

                downloadFile(downloadLink.substr(4), name);
            });
        } else {
            const name = feedUsername + "-" + downloadLink.split("/")[4].split("?")[0];

            downloadFile(downloadLink.substr(4), name);
        }
    });
};

let getTypeFromBlobStart = (blobStr) => {
    let type = ".png";

    if (blobStr.includes("GIF")) {
        type = ".gif";
    } else if (blobStr.includes("JPG")) {
        type = ".jpg";
    } else if (blobStr.includes("JPEG")) {
        type = ".jpeg";
    }

    return type;
};

let hasItemMedia = (feedItem) => {
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

let getBlobUrls = (feedItem) => {
    let returnable = [];

    const preview = feedItem.querySelector(".feed-item-preview");

    let video = false;
    if (preview.querySelectorAll(".video").length > 0) {
        video = true;
    }

    const images = preview.querySelectorAll(".image");

    for (let i = 0; i < images.length; i++) {
        if (images[i].querySelector(".image") != null) {
            const img = images[i].querySelector(".image");

            if (img.src != null && !video) {
                returnable.push("img:" + img.src);
            } else {
                const vid = preview.querySelector(".video");
                if (vid) {
                    returnable.push("vid:" + vid.src);
                }
            }
        }
    }

    return returnable;
};

let downloadFile = (url, name) => {
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

let buildProgressItem = (name) => {
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
}

let updateProgressItem = ({loaded, total}, progressItem) => {
    const percentage = Math.round(loaded/total*100)+"%";
    progressItem.style.width = percentage;
    progressItem.innerText = percentage;
}

let createProgressContainer = () => {
    // Create container for progress items
    const progressContainer = document.createElement("div");
    progressContainer.setAttribute("id", "progress-container");

    document.body.insertBefore(progressContainer, document.body.firstChild);
}

let finishedProgress = (progressItem, progressBar) => {
    // Remove progress item
    progressBar.innerText = "Finished download!";

    progressItem.style.transition = "opacity 1s ease-in 3s";
    
    progressItem.style.opacity = 0;
    setTimeout(() => {
        progressItem.parentNode.removeChild(progressItem);
    }, 4000);
}

let downloadVideo = async (url, name) => {
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

    const res = new Response(new ReadableStream({
        async start(controller) {
            const reader = response.body.getReader();
            
            // Add progress bar
            const progressItem = buildProgressItem(name);
            const progressContainer = document.getElementById("progress-container");
            progressContainer.insertBefore(progressItem, progressContainer.firstChild);

            // Update progress
            const progressBar = progressItem.querySelector(".progress").firstChild;
            for (;;) {
                const {done, value} = await reader.read();
                if (done) break;
                loaded += value.byteLength;
                updateProgressItem({loaded, total}, progressBar);
                controller.enqueue(value);
            }
            controller.close();
          
            finishedProgress(progressItem, progressBar);
        }
    }));
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

let afterPageLoad = () => {
    // Init after page load
    createProgressContainer();
}

let observerCallback = (mutationsList) => {
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
    characterData: true
};

const observer = new MutationObserver(observerCallback);

window.addEventListener("load", function () {
    observer.observe(document.body, config);
    afterPageLoad();
});