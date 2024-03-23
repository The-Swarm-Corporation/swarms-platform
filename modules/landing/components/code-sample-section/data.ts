const codeStep1 = `
import os

from dotenv import load_dotenv

# Import the OpenAIChat model and the Agent struct
from swarms import Agent, OpenAIChat

# Load the environment variables
load_dotenv()

# Get the API key from the environment
api_key = os.environ.get("OPENAI_API_KEY")

# Initialize the language model
llm = OpenAIChat(
    temperature=0.5, model_name="gpt-4", openai_api_key=api_key, max_tokens=4000
)


## Initialize the workflow
agent = Agent(llm=llm, max_loops=1, autosave=True, dashboard=True)

# Run the workflow on a task
agent.run("Generate a 10,000 word blog on health and wellness.")`;

const codeStep2 = `
from pydantic import BaseModel, Field
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
const codeStep3 = `# Importing necessary modules
import os

from dotenv import load_dotenv

from swarms import OpenAIChat, Worker, tool

# Loading environment variables from .env file
load_dotenv()

# Retrieving the OpenAI API key from environment variables
api_key = os.getenv("OPENAI_API_KEY")


# Create a tool
@tool
def search_api(query: str):
    pass


# Creating a Worker instance
worker = Worker(
    name="My Worker",
    role="Worker",
    human_in_the_loop=False,
    tools=[search_api],
    temperature=0.5,
    llm=OpenAIChat(openai_api_key=api_key),
)

# Running the worker with a prompt
out = worker.run("Hello, how are you? Create an image of how your are doing!")

# Printing the output
print(out)`;
const codeStep4 = `
from swarms import Agent, ChromaDB, OpenAIChat

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

const content = [
    {
        title: "Sequential Workflow",
        description:
            "Work together in real time with your team, clients, and stakeholders. Collaborate on documents, share ideas, and make decisions quickly. With our platform, you can streamline your workflow and increase productivity.",
        sampleCodes: {
            python: {
                sourceCode: codeStep1,
                title: "python.py"
            },
        }
    },
    {
        title: "Sequential Workflow",
        description:
            "Work together in real time with your team, clients, and stakeholders. Collaborate on documents, share ideas, and make decisions quickly. With our platform, you can streamline your workflow and increase productivity.",
        sampleCodes: {
            python: {
                sourceCode: codeStep2,
                title: "python.py"
            },
        }
    },
    {
        title: "Sequential Workflow",
        description:
            "Work together in real time with your team, clients, and stakeholders. Collaborate on documents, share ideas, and make decisions quickly. With our platform, you can streamline your workflow and increase productivity.",
        sampleCodes: {
            python: {
                sourceCode: codeStep3,
                title: "python.py"
            },
        }
    },
    {
        title: "Sequential Workflow",
        description:
            "Work together in real time with your team, clients, and stakeholders. Collaborate on documents, share ideas, and make decisions quickly. With our platform, you can streamline your workflow and increase productivity.",
        sampleCodes: {
            python: {
                sourceCode: codeStep4,
                title: "python.py"
            },
        }
    },
];

export default content;