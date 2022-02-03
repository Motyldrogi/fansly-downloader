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
    const downloadLink = event.path[3].querySelector(".contain-no-grow")?.src ||
        event.path[3].querySelectorAll(".contain")[1]?.src ||
        event.path[3].querySelectorAll(".video")[0]?.src;

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
        downloadWithFetch(url, name);
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

let downloadWithFetch = (url, name) => {
    fetch(url, {
        cache: "no-store",
        headers: new Headers({
            Origin: location.origin,
        }),
        mode: "cors",
    })
    .then((response) => response.blob())
    .then((blob) => {
        if (blob.size == 0) return;

        let blobUrl = window.URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = blobUrl;

        // Trigger download
        link.setAttribute("download", name);
        document.body.appendChild(link);

        link.click();
        link.parentNode.removeChild(link);
    })
    .catch((e) => console.error(e));
};

let observerCallback = (mutationsList) => {
    mutationsList.forEach((mutation) => {
        if (!mutation.addedNodes) return;

        for (let i = 0; i < mutation.addedNodes.length; i++) {
            const node = mutation.addedNodes[i];
            const classList = node.classList;

            if (classList == null) return;

            // Feed was added
            if (classList.contains("image")) {
                const feedItem = node.closest(".feed-item-content");
                if (feedItem) {
                    addDownloadButtonToFeed(feedItem);
                }
            }

            // Modal was added
            if ((classList.contains("image") && classList.contains("contain-no-grow")) ||
                classList.contains("contain") || classList.contains("video-element-wrapper")
            ) {
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
});