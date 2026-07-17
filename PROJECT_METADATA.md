# Project Name
Lucid - AI Image Recognition
---

# Short Description
A modern, responsive React 19 + Vite dashboard for uploading images and
browsing AI recognition results (objects, detected text, confidence, and
generated audio summaries).
---

# AWS Services
Amazon S3 (X2, one for hosting and other for storage)
Amazon Lambda
Amazon IAM
Amazon CloudWatch
Amazon API Gateway
Amazon Dynamo DB
Amazon Rekognition
Amazon Polly
---

# Frontend
- React 19 (functional components + hooks, no Redux, no Context API)
- Vite
- Plain modern CSS (no CSS framework/UI kit)
- Browser `fetch()` / `XMLHttpRequest` only — no AWS SDK, no Amplify
---

# Backend
Amazon Lambda
Python
---

# Deployment
Amazon S3
---

# API Endpoints
HTTP API with routes /image/{id} (GET), /images (GET), /upload-url (POST)
---

# Screenshots
project_images/data-s3-bucket.png
project_images/gallery.png
project_images/home-dark.png
project_images/home-light.png
project_images/hosting-s3-bucket.png
project_images/image-modal-audio.png
project_images/image-modal-objects.png
project_images/image-modal-summary.png
project_images/image-modal-text.png
project_images/image-table.png
project_images/s3-audio-summary.png
project_images/s3-images.png
---

# Notes
- Upload progress is reported via `XMLHttpRequest` (native `fetch` cannot
  report upload progress), then the pre-signed URL is `PUT` to directly from
  the browser.
- The file input uses `capture="environment"` so mobile browsers open the
  rear camera automatically.
- Theme preference is persisted to `localStorage` and respects the user's
  OS preference on first visit.
- Images lazy-load (`loading="lazy"`) and gallery cards are memoized to
  avoid unnecessary re-renders.
- The generate_upload_url lambda generates the pre-signed url.
- The pre-signed url is used to upload image to S3 bucket.
- The image is then collected by image_processor lambda.
- This lambda is triggered by s3 images/ addition.
- Upon triggering it collects the image and sends it to rekognition.
- Rekognition sends it's response which is then used to generate summary based upon the top few labels.
- The summary is then sent to polly.
- Polly converts this text summary into audio file.
- This audio file is stored back in S3 bucket audio-summary/ folder.
- The lambda then stores all of these details including the audio summary file id and textual summary into ImageRecognitionMetadata dynamo db.
- The image_dashboard_api lambda collects this data from dynamo db and sends it to frontend to display.
- This lambda generates the pre-signed urls to display the image and audio file which expires in 5 minutes.
---

# Future Improvements
- Add a "Delete" button to remove images and their associated metadata from S3 and DynamoDB.
- Add secure login.