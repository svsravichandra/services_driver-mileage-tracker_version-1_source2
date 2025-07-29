# Mialage share app
-useful app to track Milage driven by each drivers in a sharing a fleet of vehicles with one click
-select the driver name and just snap a photo of odometer before starting a shift and ending a shift. Done.
-your data is scurely stored and accesable via dashboard., and can be exported to any format you choose.


## Instructions

**Prerequisites**:
- [Google Cloud SDK / gcloud CLI](https://cloud.google.com/sdk/docs/install)
- (Optional) Gemini API Key

1. Download or copy the files of your app into this directory at the root level.
2. If your app calls the Gemini API, create a Secret for your API key:
     ```
     echo -n "${GEMINI_API_KEY}" | gcloud secrets create gemini_api_key --data-file=-
     ```

3.  Deploy to Cloud Run (optionally including API key):
    ```
    gcloud run deploy my-app --source=. --update-secrets=GEMINI_API_KEY=gemini_api_key:latest
    ```
