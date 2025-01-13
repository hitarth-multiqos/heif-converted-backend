document.getElementById('uploadForm').addEventListener('submit', async (event) => {
  event.preventDefault();

  const fileInput = document.getElementById('fileInput');
  const file = fileInput.files[0];

  if (!file) return alert('Please select a file!');

  const formData = new FormData();
  formData.append('image', file); // Only append 'image' once

  try {
    const response = await fetch('/convert', {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      const data = await response.json();
      console.log('Conversion successful:', data);

      const output = document.getElementById('output');
      const outputImage = document.getElementById('outputImage');
      const downloadLink = document.getElementById('downloadLink');

      // The server should return the path to the converted file
      const fileUrl = `http://localhost:3000/public/uploads/${data.convertedFileName}`; // Adjust this based on how the file path is returned

      // Update the UI with the result
      outputImage.src = fileUrl;
      downloadLink.href = fileUrl;
      output.classList.remove('hidden');  // Show the output section
    } else {
      alert('Failed to convert the file.');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error during file upload or conversion.');
  }
});
