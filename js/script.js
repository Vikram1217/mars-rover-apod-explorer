/* assigns the const variable with the api key */
const API_KEY = 'i544qMOSS03mgTCBHHSTQyKdlf4uXW2nsgfsg9L1';

/* Base URL for the mars rover API */
const BASE_URL = 'https://api.nasa.gov/mars-photos/api/v1/rovers/';

/* BASE URL for the APOD API */
const APOD_BASE_URL = 'https://api.nasa.gov/planetary/apod/';

/* assign rover-form form to a variable */
const roverForm = document.getElementById('rover-form');

/* Get the value of the dropdownList */
const roverSelect = document.getElementById('rover-select');

/* Get the value for the camera selected */
const cameraSelect = document.getElementById('camera-select');

/* Sol input value */
const solInput = document.getElementById('sol-input');

/* earth date input */
const earthDateInput = document.getElementById('earth-date-input');
solInput.addEventListener('input', () =>{
  if(solInput.value !== ''){
    earthDateInput.value = '';
  }
})

earthDateInput.addEventListener('input', function() {
    if (earthDateInput.value !== '') {
        solInput.value = '';
    }
});

/* message area */
const messageArea = document.getElementById('message-area');

/* Photo Gallery display area */
const photoGallery = document.getElementById('photo-gallery');

/* Gallery placeholder */
let galleryPlaceholder = photoGallery.querySelector('.gallery-placeholder');

/* constants for Modal area */
const imageModal = document.getElementById('imageModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const modalImage = document.getElementById('modalImage');
const prevModalImageBtn = document.getElementById('prevModalImageBtn');
const nextModalImageBtn = document.getElementById('nextModalImageBtn');

prevModalImageBtn.addEventListener('click', showPrevImage);
nextModalImageBtn.addEventListener('click', showNextImage);

closeModalBtn.addEventListener('click', closeModal);

/* Will be used to nav prev and next in modal */
let currentGalleryPhotos = [];
let currentPhotoIndex = 0;

window.addEventListener('keydown', (event) => {
  if(imageModal.style.display !== 'none'){
    if(event.key === 'ArrowLeft'){
      event.preventDefault();
      showPrevImage();
    }else if(event.key === 'ArrowRight'){
      event.preventDefault();
      showNextImage();
    }else if(event.key === 'Escape'){
      event.preventDefault();
      closeModal();
    }
  }
})

let submitBtn = document.querySelector('.fetch-btn');
submitBtn.addEventListener('click', (event) => {
  event.preventDefault();
  
  handleFormSubmit();
})
function  handleFormSubmit(){

  const selectedRover = roverSelect.value;
  const solString = solInput.value.trim(); // Get as string and trim
  const earthDateValue = earthDateInput.value;
  const selectedCamera = cameraSelect.value;

  if (!solString && !earthDateValue) {
    displayMessage("Please enter a Sol or an Earth date.");
    return;
  }

  if(solString.length !== 0 && earthDateValue.length !== 0){
    displayMessage('Please enter EITHER Sol number or Earth date.  Not both.');
    earthDateInput.value = '';
    solInput.value = '';
    return;
  }


  let useSol = false;
  let useEarthDate = false;
  let validatedSolNumber; // To store the parsed and validated Sol

  if (solString.length !== 0) { // If Sol input has content
      const solInt = parseInt(solString, 10);
      if (isNaN(solInt) || solInt < 0) {
          displayMessage('Invalid Sol number. Please enter a non-negative number.');
          return; // Invalid Sol, stop
      }
      validatedSolNumber = solInt; // Store the valid number
      useSol = true;
  } else if (earthDateValue.length !== 0) { 
      useEarthDate = true;
  }

  let apiUrl = `${BASE_URL}${selectedRover}/photos?`; // base and rover path

    if (useSol) {
        apiUrl += `sol=${validatedSolNumber}`;
    } else if (useEarthDate) {
        apiUrl += `earth_date=${earthDateValue}`;
    }

    if(selectedCamera !== 'ALL'){
      apiUrl += `&camera=${selectedCamera}`;
    }

    apiUrl += `&api_key=${API_KEY}`; // Append API key

    console.log("Constructed API URL:", apiUrl);

  fetchAndDisplayPhotos(apiUrl);
}

function displayMessage(message){
  messageArea.innerHTML = message;
}

async function fetchAndDisplayPhotos(apiUrl){
    displayMessage('Loading photos please wait...');
    clearGallery();
    try{
      const response = await fetch(apiUrl);

      if(!response.ok){
        throw new Error(`HTTP error! Status: ${response.status} - ${response.statusText || 'Something went wrong'}`);
      }
      const data = await response.json();
      console.log("API Data Received:", data);

      if(data.photos && data.photos.length > 0){
        displayPhotos(data.photos);
        galleryPlaceholder.innerHTML = "";
        displayMessage("");
      }else {
        displayMessage("No photos found for the selected criteria.");
      }
    }catch (error) {
      console.error("Error in fetchAndDisplayPhotos:", error); // Log the full error object
        // Display a user-friendly error message.
        // The 'error.message' will contain the string from `throw new Error(...)` or a network error message.
        displayMessage(`Failed to fetch photos: ${error.message}. Please try again.`);
    }
}

function clearGallery() {
  photoGallery.innerHTML = '';
}

/* func will display the images, takes an array of images */
function displayPhotos(photosArray){

  /* store the photos array in the currentGallery array */
  currentGalleryPhotos = photosArray;
  
  /* Get the div with id photo-gallery */
  const photoGallery = document.getElementById('photo-gallery');
  
  /* if it doesnt exist, then just return */
  if(!photoGallery){
    displayMessage('PhotoGallery doesnt exist');
    return;
  }else{
    photoGallery.innerHTML = "";
  }
  

  /* For each photo in the photosArray, create and img html
   element and fill it with the photo */
  photosArray.forEach((photo, index) => {
    const thumbnailButton = document.createElement('button');
    thumbnailButton.className = 'gallery-thumbnail-item';
    thumbnailButton.setAttribute('aria-label', `View image ${index + 1} of ${photosArray.length}: ${photo.rover.name} - ${photo.camera.name || photo.camera.full_name}`);
    const imageElement = document.createElement('img');
    imageElement.src = photo.img_src;
    imageElement.alt = `Mars photo from ${photo.camera.full_name || photo.camera.name} on Sol ${photo.sol}. Rover: ${photo.rover.name}`;
    thumbnailButton.appendChild(imageElement);
    photoGallery.appendChild(thumbnailButton);
    thumbnailButton.addEventListener('click', () =>
    {
      openModal(index);
    });
  });  
}

function openModal(index){
  if(index < 0 || index >= currentGalleryPhotos.length){
    console.error('Modal: Invalid photo index provided: ', index);
    return;
  }
  currentPhotoIndex = index;
  const photoData = currentGalleryPhotos[currentPhotoIndex];
  if(photoData){
    modalImage.src = photoData.hdurl || photoData.img_src;
    modalImage.alt = `Full size: ${photoData.rover.name} rover - ${photoData.camera.name} on Sol ${photoData.sol}.`
  }else {
    console.error('No valid photo data found for index', index);
  }
  console.log(`function openModal index: ${index}`);
  imageModal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  closeModalBtn.focus();

  if(currentGalleryPhotos.length > 1){
    prevModalImageBtn.style.display = 'block';
    nextModalImageBtn.style.display = 'block';
    updateModalNavButtons();
  }else {
    prevModalImageBtn.style.display = 'none';
    nextModalImageBtn.style.display = 'none';
  }
}

function closeModal(){
  document.body.style.overflow = 'auto';
  imageModal.style.display = 'none';
  modalImage.src = "";
  modalImage.alt = "";
}

function showPrevImage(){  
  console.log('showPrevImage function');
   if(currentPhotoIndex <= 0){
    console.error('Modal: Invalid photo index provided: ', currentPhotoIndex);
    return;
  }else {
    currentPhotoIndex--;
    console.log(currentPhotoIndex);
    openModal(currentPhotoIndex);
  }
}

function showNextImage(){
  console.log('showNextImage function');
   if(currentPhotoIndex >= currentGalleryPhotos.length - 1){
    console.error('Modal: Invalid photo index provided: ', currentPhotoIndex);
    return;
  }else {
    currentPhotoIndex++;
    console.log(currentPhotoIndex);
    openModal(currentPhotoIndex);
  }
}

function updateModalNavButtons(){
  if(currentPhotoIndex === 0){
    prevModalImageBtn.disabled = true;
  }else {
    prevModalImageBtn.disabled = false;
  }

  if(currentPhotoIndex >= currentGalleryPhotos.length-1){
    nextModalImageBtn.disabled = true;
  }else {
    nextModalImageBtn.disabled = false;
  }    
}

async function fetchAndDisplayAPOD() {
  const api_url = `${APOD_BASE_URL}?api_key=${API_KEY}`;
  
  const apodContainer = document.getElementById('apod-container');
  const loadingMessage = document.getElementById('apod-loading-message');

  if (loadingMessage) {
      loadingMessage.textContent = 'Loading APOD...'; // Ensure loading message is visible
  }

  try{
    const response = await fetch(api_url);

    if(!response.ok){
      const errorText = response.statusText || 'Failed to fetch APOD';
      throw new Error(`HTTP error! Status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log("APOD Data: ", data);

    apodContainer.innerHTML = '';

    /* Create the media wrapper that will hold either the image or embeded video */
    const mediaWrapper = document.createElement('div');
    mediaWrapper.className = 'apod-media-wrapper';

    if(data.media_type === 'image'){
      const img = document.createElement('img');
      img.src = data.hdurl || data.url;
      img.alt = data.title;
      mediaWrapper.appendChild(img);
    }else if(data.media_type === 'video'){
      const iframe = document.createElement('iframe');
      iframe.src = data.url;
      iframe.setAttribute('frameborder', '0');
      iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
      iframe.setAttribute('allowfullscreen', 'true');
      // iframe.loading = 'lazy'; // Optional: for native lazy loading
      mediaWrapper.appendChild(iframe);
    }else{
      // Handle unknown media type if necessary, or just display text
      const unknownMediaText = document.createElement('p');
      unknownMediaText.textContent = `Unsupported media type: ${data.media_type}. Title: ${data.title}`;
      mediaWrapper.appendChild(unknownMediaText);
    }
    apodContainer.appendChild(mediaWrapper);


    // 3. Create and Append Title
    if (data.title) {
        const titleElement = document.createElement('h3'); // Using h3 for APOD title
        titleElement.className = 'apod-title'; // Styled in CSS
        titleElement.textContent = data.title;
        apodContainer.appendChild(titleElement);
    }

    // 4. Create and Append Explanation
    if (data.explanation) {
        const explanationElement = document.createElement('p');
        explanationElement.className = 'apod-explanation'; // Styled in CSS
        explanationElement.textContent = data.explanation;
        apodContainer.appendChild(explanationElement);
    }

    // 5. (Optional) Create and Append Copyright
    if (data.copyright) {
        const copyrightElement = document.createElement('p');
        copyrightElement.className = 'apod-copyright'; // Add a class for styling
        // Example CSS for .apod-copyright:
        // .apod-copyright { font-size: 0.8em; text-align: center; margin-top: 10px; color: #777; }
        copyrightElement.textContent = `© ${data.copyright.trim()}`;
        apodContainer.appendChild(copyrightElement);
    }
  }catch (error){
    console.error("Error fetching or displaying APOD:", error);
    if (apodContainer) {
        // Ensure class for error message styling if you have one
        apodContainer.innerHTML = `<p class="apod-error-message">Failed to load APOD: ${error.message}</p>`;
        // Style .apod-error-message in your CSS (e.g., color: red; text-align: center; padding: 10px;)
    }
  }
}
window.addEventListener('DOMContentLoaded', fetchAndDisplayAPOD);
