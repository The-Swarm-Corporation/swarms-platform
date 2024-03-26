const codeStep1 = `from swarms import Agent, ChromaDB, OpenAIChat

# Making an instance of the ChromaDB class
memory = ChromaDB(
    metric="cosine",
    n_results=3,
    output_dir="results",
    docs_folder="docs",
)

# Initializing the agent with the Gemini instance and other parameters
agent = Agent(
    agent_name="Covid-19-Chat",
    agent_description=(
        "This agent provides information about COVID-19 symptoms."
    ),
    llm=OpenAIChat(),
    max_loops="auto",
    autosave=True,
    verbose=True,
    long_term_memory=memory,
    stopping_condition="finish",
)

# Defining the task and image path
task = ("What are the symptoms of COVID-19?",)

# Running the agent with the specified task and image
out = agent.run(task)
print(out)
`;

const codeStep2 = `from swarms import QwenVLMultiModal

# Instantiate the QwenVLMultiModal model
model = QwenVLMultiModal(
    model_name="Qwen/Qwen-VL-Chat",
    device="cuda",
    quantize=True,
)

# Run the model
response = model("Hello, how are you?", "https://example.com/image.jpg")

# Print the response
print(response)`;
const codeStep3 = `from pydantic import BaseModel, Field
from transformers import AutoModelForCausalLM, AutoTokenizer

from swarms import ToolAgent
from swarms.utils.json_utils import base_model_to_json

# Load the pre-trained model and tokenizer
model = AutoModelForCausalLM.from_pretrained(
    "databricks/dolly-v2-12b",
    load_in_4bit=True,
    device_map="auto",
)
tokenizer = AutoTokenizer.from_pretrained("databricks/dolly-v2-12b")


# Initialize the schema for the person's information
class Schema(BaseModel):
    name: str = Field(..., title="Name of the person")
    agent: int = Field(..., title="Age of the person")
    is_student: bool = Field(
        ..., title="Whether the person is a student"
    )
    courses: list[str] = Field(
        ..., title="List of courses the person is taking"
    )


# Convert the schema to a JSON string
tool_schema = base_model_to_json(Schema)

# Define the task to generate a person's information
task = (
    "Generate a person's information based on the following schema:"
)

# Create an instance of the ToolAgent class
agent = ToolAgent(
    name="dolly-function-agent",
    description="Ana gent to create a child data",
    model=model,
    tokenizer=tokenizer,
    json_schema=tool_schema,
)

# Run the agent to generate the person's information
generated_data = agent.run(task)

# Print the generated data
print(f"Generated data: {generated_data}")
`;
const codeStep4 = `from swarms.models import HuggingfaceLLM

# Initialize with custom configuration
custom_config = {
    "quantize": True,
    "quantization_config": {"load_in_4bit": True},
    "verbose": True,
}
inference = HuggingfaceLLM(
    model_id="NousResearch/Nous-Hermes-2-Vision-Alpha", **custom_config
)

# Generate text based on a prompt
prompt_text = (
    "Create a list of known biggest risks of structural collapse with references"
)
generated_text = inference(prompt_text)
print(generated_text)`;

const content = [
  {
    title: 'Long Term Memory',
    description:
      'Agent equipped with quasi-infinite long term memory. Great for long document understanding, analysis, and retrieval.',
    sampleCodes: {
      python: {
        sourceCode: codeStep1,
        title: 'python.py'
      }
    }
  },
  {
    title: 'Multi Modal',
    description:
      'A radically simple interface for QwenVLMultiModal comes complete with Quantization to turn it on just set quantize to true!',
    sampleCodes: {
      python: {
        sourceCode: codeStep2,
        title: 'python.py'
      }
    }
  },
  {
    title: 'Tools',
    description:
      'ToolAgent is an agent that can use tools through JSON function calling. It intakes any open source model from huggingface and is extremely modular and plug in and play. We need help adding general support to all models soon.',
    sampleCodes: {
      python: {
        sourceCode: codeStep3,
        title: 'python.py'
      }
    }
  },
  {
    title: 'HuggingFace LLM',
    description:
      "The HuggingFaceLLM class in the Zeta library provides a simple and easy-to-use interface to harness the power of Hugging Face's transformer-based language models, specifically for causal language modeling.",
    sampleCodes: {
      python: {
        sourceCode: codeStep4,
        title: 'python.py'
      }
    }
  }
];

export default content;
