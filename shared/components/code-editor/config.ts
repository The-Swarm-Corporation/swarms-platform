import { LanguageProps } from './type';

export const languages: LanguageProps = [
  {
    name: 'Python',
    icon: '/python.svg',
  },
  {
    name: 'Golang',
    icon: '/go.svg',
  },
  {
    name: 'Javascript',
    icon: '/javascript.svg',
  },
];

const VLM_SAMPLE_PY_FUNC = (model: string) => `from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()
openai_api_key = ""

openai_api_base = "https://api.swarms.world/v1"
model = "${model}"

client = OpenAI(api_key=openai_api_key, base_url=openai_api_base)
# Note that this model expects the image to come before the main text
chat_response = client.chat.completions.create(
    model=model,
    messages=[
        {
            "role": "user",
            "content": [
                {
                    "type": "image_url",
                    "image_url": {
                        "url": "https://home-cdn.reolink.us/wp-content/uploads/2022/04/010345091648784709.4253.jpg",
                    },
                },
                {
                    "type": "text",
                    "text": "What is the most dangerous object in the image?",
                },
            ],
        }
    ],
    temperature=0.1,
    max_tokens=5000,
)
print("Chat response:", chat_response)`;

const VLM_SAMPLE_GO_FUNC = (model: string) => `package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
	"github.com/openai/openai-go"
)

func main() {
	// Load environment variables from .env file
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	// Retrieve the OpenAI API key from environment variables
	openaiAPIKey := os.Getenv("OPENAI_API_KEY")
	if openaiAPIKey == "" {
		log.Fatal("OPENAI_API_KEY not set in environment")
	}

	// Set the OpenAI API base URL and model
	openaiAPIBase := "https://api.swarms.world/v1"
	model := "${model}"

	// Create an OpenAI client
	client, err := openai.NewClient(openaiAPIKey, openai.WithBaseURL(openaiAPIBase))
	if err != nil {
		log.Fatalf("Failed to create OpenAI client: %v", err)
	}

	// Define the chat message with an image and a text prompt
	messages := []openai.ChatMessage{
		{
			Role: "user",
			Content: []openai.ChatContent{
				{
					Type: "image_url",
					ImageURL: openai.ImageURL{
						URL: "https://home-cdn.reolink.us/wp-content/uploads/2022/04/010345091648784709.4253.jpg",
					},
				},
				{
					Type: "text",
					Text: "What is the most dangerous object in the image?",
				},
			},
		},
	}

	// Create a chat completion request
	request := openai.ChatCompletionRequest{
		Model:       model,
		Messages:    messages,
		Temperature: 0.1,
		MaxTokens:   5000,
	}

	// Get the chat response
	response, err := client.ChatCompletions.Create(context.Background(), request)
	if err != nil {
		log.Fatalf("Failed to create chat completion: %v", err)
	}

	// Print the chat response
	fmt.Println("Chat response:", response.Choices[0].Message.Content)
}`;

const VLM_SAMPLE_JS_FUNC = (model: string) => `// Load environment variables
require("dotenv").config();
const axios = require("axios");

// Environment variables
const openaiApiKey = process.env.OPENAI_KEY;
const model = "${model}";

// Request payload
const requestPayload = {
  model: model,
  messages: [
    {
      role: "user",
      content: [
        {
          type: "image_url",
          image_url: {
            url: "https://home-cdn.reolink.us/wp-content/uploads/2022/04/010345091648784709.4253.jpg",
          },
        },
        {
          type: "text",
          text: "What is the most dangerous object in the image?",
        },
      ],
    },
  ],
  temperature: 0.1,
  max_tokens: 5000,
};

// Function to make the API call
const getChatResponse = async () => {
  try {
    const response = await axios.post(
      "https://api.swarms.world/v1/chat/completions",
      requestPayload,
      {
        headers: {
          Authorization: "Bearer openaiApiKey",
          "Content-Type": "application/json",
        },
      }
    );
    console.log("Chat response:", response.data);
  } catch (error) {
    console.error(
      "Error:",
      error.response ? error.response.data : error.message
    );
  }
};

// Execute the function
getChatResponse();`;



export const themes: string[] = ['cobalt', 'monokai', 'twilight', 'dracula'];

export const paddings: string[] = ['1rem', '2rem', '3rem', '4rem'];

export function getLangFileName(language: string): string {
  switch (language) {
    case 'JavaScript':
      return 'index.js';
    case 'Golang':
      return 'main.go';
    case 'Python':
      return 'main.py';
    default:
      return 'index.js';
  }
}

export function getEditorCode(language: string, model: string): string {
  const VLM_SAMPLE_PY = VLM_SAMPLE_PY_FUNC(model);
  const VLM_SAMPLE_JS = VLM_SAMPLE_JS_FUNC(model);
  const VLM_SAMPLE_GO = VLM_SAMPLE_GO_FUNC(model);

  switch (language) {
    case 'JavaScript':
      return VLM_SAMPLE_JS;
    case 'Golang':
      return VLM_SAMPLE_GO;
    case 'Python':
      return VLM_SAMPLE_PY;
    default:
      return VLM_SAMPLE_JS;
  }
}
