import axios from "axios";

const API_URL = "http://localhost:3000/chatbot";

let currentToken: string | null = null;

export const setChatbotToken = (token: string | null) => {
  currentToken = token;
};

export const chatbotService = {
  async sendMessage(message: string, conversationId?: string) {
    try {
      const token = currentToken;

      if (!token) {
        throw new Error("No authentication token available");
      }

      const response = await axios.post(
        `${API_URL}/message`,
        { message, conversationId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error("❌ sendMessage error:", error.response || error);
      throw error;
    }
  },

  async getConversations() {
    try {
      const token = currentToken;

      if (!token) {
        throw new Error("No authentication token available");
      }

      const response = await axios.get(`${API_URL}/conversations`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error: any) {
      console.error("❌ getConversations error:", error.response || error);
      throw error;
    }
  },

  async getConversationById(id: string) {
    try {
      const token = currentToken;

      if (!token) {
        throw new Error("No authentication token available");
      }

      const response = await axios.get(
        `${API_URL}/conversation/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error("❌ getConversationById error:", error.response || error);
      throw error;
    }
  },
};