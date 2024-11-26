const axios = require("axios");

class SpeechRecognitionService {
  constructor(apiKey, apiUrl) {
    this.apiKey = apiKey;
    this.apiUrl = apiUrl;
  }

  async recognizeSpeech(wavBuffer, utterance) {
    const params = new URLSearchParams({
      lang: "Kor",
      assessment: "true",
      utterance: utterance.replace(/[ ,.]/g, ""),
      graph: "false",
    }).toString();

    try {
      const response = await axios.post(`${this.apiUrl}?${params}`, wavBuffer, {
        headers: {
          "Content-Type": "application/octet-stream",
          "X-CLOVASPEECH-API-KEY": this.apiKey,
          Accept: "application/json",
        },
        timeout: 10000,
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      });

      return response.data.assessment_score;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  handleApiError(error) {
    console.error("Error details:", error);

    if (axios.isAxiosError(error)) {
      if (error.response) {
        console.error("API Error Response:", {
          status: error.response.status,
          data: error.response.data,
        });
        throw new Error(`API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        throw new Error("API request failed: No response received");
      }
    }

    throw error;
  }
}

module.exports = SpeechRecognitionService;
