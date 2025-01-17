import time
from google.oauth2 import service_account
import vertexai
from vertexai.generative_models import GenerativeModel, SafetySetting

class Gemini:
    def __init__(self):
        self.credentials_ = service_account.Credentials.from_service_account_file('app/keys/server1_key.json')
        vertexai.init(project="base-app-it", location="us-central1", credentials=self.credentials_)
        self.generate_translation("Service started successfully.", "ja")

    def generate_translation(self, text, language="en"):
        model = GenerativeModel(model_name="gemini-1.5-pro-002",
                                system_instruction=f"You are an expert Translator. "
                                                   f"Translate this document from en to {language}.")
        generation_config = {
            "candidate_count": 1,
            "max_output_tokens": 8192,
            "temperature": 0,
            "top_p": 0.95,
            "top_k": 1,
        }

        safety_settings = [
            SafetySetting(
                category=SafetySetting.HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                threshold=SafetySetting.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
            ),
            SafetySetting(
                category=SafetySetting.HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                threshold=SafetySetting.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
            ),
            SafetySetting(
                category=SafetySetting.HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                threshold=SafetySetting.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
            ),
            SafetySetting(
                category=SafetySetting.HarmCategory.HARM_CATEGORY_HARASSMENT,
                threshold=SafetySetting.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
            ),
        ]

        max_retries = 5
        backoff_factor = 2
        for attempt in range(max_retries):
            try:
                responses = model.generate_content(
                    [text],
                    generation_config=generation_config,
                    safety_settings=safety_settings,
                )
                if responses and hasattr(responses, 'candidates'):
                    res = responses.candidates[0].content.parts[0].text
                    print(f"Translated Text: {res}")
                    return res
                else:
                    print("No translation generated.")
                    return "No translation generated."
            except Exception as e:
                if "429" in str(e):
                    wait_time = backoff_factor ** attempt
                    print(f"Quota exceeded. Retrying in {wait_time} seconds...")
                    time.sleep(wait_time)
                else:
                    print(f"An error occurred: {e}")
                    return "An error occurred."
        return "Failed to generate translation after retries."



