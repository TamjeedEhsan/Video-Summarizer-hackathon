// Drag and dropping videos on to the website

const uploadBox = document.getElementById("uploadBox");
const videoInput = document.getElementById("videoInput");  //connecting to the HTML
const fileList = document.getElementById("fileList");
const summarizeButton = document.getElementById("summarizeButton");
const resultsContainer = document.getElementById("resultsContainer");
const emptyState = document.getElementById("emptyState");
const errorMessage = document.getElementById("errorMessage");
const selectedVideos = [];
let isProcessing = false;
const originalButtonText = summarizeButton.textContent;


uploadBox.addEventListener("dragover", (event) => {    //preventDefault() prevents the browser from handling the drag and drop
    event.preventDefault();

    console.log("File is being dragged over the upload box");
});

uploadBox.addEventListener("drop", (event) => {
    event.preventDefault();

    console.log("File dropped!");

    const files = event.dataTransfer.files;

    for (const file of files) {

         if (!file.type.startsWith("video/")) {    //making sure the videos dropped the videos only
        console.log("This is not a video:", file.name);
        continue;
        }

        const alreadyExists = selectedVideos.some(
        (selectedVideo) => selectedVideo.name === file.name
        );

        if (alreadyExists) {
            console.log("Video already selected:", file.name);
            errorMessage.textContent = "Please select a valid video file.";
            continue;
        }

        selectedVideos.push(file);

        console.log(file.name);

        const fileItem = document.createElement("div");

        const fileName = document.createElement("span");

        fileName.textContent = file.name;


        const removeButton = document.createElement("button");

        removeButton.textContent = "Remove";
        removeButton.addEventListener("click", () => {

            const videoIndex = selectedVideos.indexOf(file);

            if (videoIndex !== -1) {
                selectedVideos.splice(videoIndex, 1);
            }

            fileItem.remove();

            if (selectedVideos.length === 0) {
                summarizeButton.disabled = true;
            }

            console.log("Video removed:", file.name);

        });

        fileItem.appendChild(fileName);

        fileItem.appendChild(removeButton);

        fileList.appendChild(fileItem);

        // Enable the button
        if (!isProcessing) {
        summarizeButton.disabled = false;
        }
    }
});


//using the broswe files 
videoInput.addEventListener("change", (event) => {
    const files = event.target.files;

    for (const file of files) {
        
        if (!file.type.startsWith("video/")) {   //making sure the browser files are videos only
            console.log("This is not a video:", file.name);
            errorMessage.textContent = "Please select a valid video file.";
            continue;
        }
        
        const alreadyExists = selectedVideos.some(
        (selectedVideo) => selectedVideo.name === file.name
            );

        if (alreadyExists) {
            console.log("Video already selected:", file.name);
            continue;
        }

        selectedVideos.push(file);

        console.log(file.name);

        const fileItem = document.createElement("div");

        const fileName = document.createElement("span");

        fileName.textContent = file.name;


        const removeButton = document.createElement("button");

        removeButton.textContent = "Remove";
        removeButton.addEventListener("click", () => {

            const videoIndex = selectedVideos.indexOf(file);

            if (videoIndex !== -1) {
                selectedVideos.splice(videoIndex, 1);
            }

            fileItem.remove();

            if (selectedVideos.length === 0) {
                summarizeButton.disabled = true;
            }

            console.log("Video removed:", file.name);

        });

        fileItem.appendChild(fileName);

        fileItem.appendChild(removeButton);

        fileList.appendChild(fileItem);

        // Enable the button
         if (!isProcessing) {
        summarizeButton.disabled = false;
        }
    }
});


// Working with the "Summarize Videos" button
summarizeButton.addEventListener("click", async () => {

     if (isProcessing) {
        console.log("Videos are already being processed!");
        return;
    }

    console.log("Summarize Videos button clicked!");

    // Make sure at least one video exists
    if (selectedVideos.length === 0) {
        console.log("No videos selected!");
        return;
    }

    isProcessing = true;
    summarizeButton.disabled = true;
    summarizeButton.textContent = "Processing Videos...";

    // Create FormData
    const formData = new FormData();

    // Add every selected video
    for (const video of selectedVideos) {
        formData.append("videos", video);
    }

    try {

        // Send all videos to the FastAPI backend
        const response = await fetch(
            "http://127.0.0.1:8000/upload",
            {
                method: "POST",
                body: formData
            }
        );

        if (!response.ok) {
            throw new Error("The server was unable to process the videos.");
        }


        const data = await response.json();

        console.log("Backend response:", data);

        // Remove the empty state message
        emptyState.style.display = "none";

        // Clear any previous results
        resultsContainer.innerHTML = "";

        // Loop through every summarized video
         for (const result of data.results) {

        // Create a result card
        const resultCard = document.createElement("article");

        resultCard.classList.add("video-result");

        // Create the video filename
         const title = document.createElement("h3");

        title.textContent = result.filename;

        // Create the summary
        const summary = document.createElement("p");

        summary.textContent = result.summary;

        // Add filename and summary to the card
        resultCard.appendChild(title);

        resultCard.appendChild(summary);

        // Add the card to the results section
        resultsContainer.appendChild(resultCard);
        }

    } catch (error) {

        console.error("Upload error:", error);

        if (error.message ===
        "The server was unable to process the videos.") {

        errorMessage.textContent =
            "The server had trouble processing your videos.";

    } else {

        errorMessage.textContent =
            "Server isn't with you right now. Please make sure the backend is running.";

    }

    } finally {

    isProcessing = false;
    summarizeButton.disabled = false;
    summarizeButton.textContent = originalButtonText;
    }

});