const codeStep1 = `
from swarms import Agent, ChromaDB, OpenAIChat, tool

# Making an instance of the ChromaDB class
memory = ChromaDB(
    metric="cosine",
    n_results=3,
    output_dir="results",
    docs_folder="docs",
)

# Initialize a tool
@tool
def search_api(query: str):
    # Add your logic here
    return query

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
    tools=[search_api],
)

# Defining the task and image path
task = ("What are the symptoms of COVID-19?",)

# Running the agent with the specified task and image
out = agent.run(task)
print(out)

`;

const codeStep2 = `
import os

from dotenv import load_dotenv

from swarms import Agent, OpenAIChat, SequentialWorkflow

load_dotenv()

# Load the environment variables
api_key = os.getenv("OPENAI_API_KEY")


# Initialize the language agent
llm = OpenAIChat(
    temperature=0.5, model_name="gpt-4", openai_api_key=api_key, max_tokens=4000
)


# Initialize the agent with the language agent
agent1 = Agent(llm=llm, max_loops=1)

# Create another agent for a different task
agent2 = Agent(llm=llm, max_loops=1)

# Create another agent for a different task
agent3 = Agent(llm=llm, max_loops=1)

# Create the workflow
workflow = SequentialWorkflow(max_loops=1)

# Add tasks to the workflow
workflow.add(
    agent1,
    "Generate a 10,000 word blog on health and wellness.",
)

# Suppose the next task takes the output of the first task as input
workflow.add(
    agent2,
    "Summarize the generated blog",
)

# Run the workflow
workflow.run()

# Output the results
for task in workflow.tasks:
    print(f"Task: {task.description}, Result: {task.result}")
`;
const codeStep3 = `
import os

from dotenv import load_dotenv

# Import the OpenAIChat model and the Agent struct
from swarms import Agent, OpenAIChat, SwarmNetwork

# Load the environment variables
load_dotenv()

# Get the API key from the environment
api_key = os.environ.get("OPENAI_API_KEY")

# Initialize the language model
llm = OpenAIChat(
    temperature=0.5,
    openai_api_key=api_key,
)

## Initialize the workflow
agent = Agent(llm=llm, max_loops=1, agent_name="Social Media Manager")
agent2 = Agent(llm=llm, max_loops=1, agent_name=" Product Manager")
agent3 = Agent(llm=llm, max_loops=1, agent_name="SEO Manager")


# Load the swarmnet with the agents
swarmnet = SwarmNetwork(
    agents=[agent, agent2, agent3],
)

# List the agents in the swarm network
out = swarmnet.list_agents()
print(out)

# Run the workflow on a task
out = swarmnet.run_single_agent(
    agent2.id, "Generate a 10,000 word blog on health and wellness."
)
print(out)


# Run all the agents in the swarm network on a task
out = swarmnet.run_many_agents("Generate a 10,000 word blog on health and wellness.")
print(out)
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
    title: 'Agent with Tools and Memory',
    description:
      'An LLM backed agent with long term memory and tool usage. Great for complex multi-step activities in the real-world like sales, marketing, and accounting.',
    sampleCodes: {
      python: {
        sourceCode: codeStep1,
        title: 'python.py',
      },
    },
  },
  {
    title: 'Sequential Workflow',
    description:
      'Sequential Workflow enables you to sequentially execute tasks with Agent and then pass the output into the next agent and onwards until you have specified your max loops. SequentialWorkflow is wonderful for real-world business tasks like sending emails, summarizing documents, and analyzing data.      ',
    sampleCodes: {
      python: {
        sourceCode: codeStep2,
        title: 'python.py',
      },
    },
  },
  {
    title: 'Swarm Network',
    description:
      'SwarmNetwork provides the infrasturcture for building extremely dense and complex multi-agent applications that span across various types of agents.      ',
    sampleCodes: {
      python: {
        sourceCode: codeStep3,
        title: 'python.py',
      },
    },
  },
  // {
  //   title: 'HuggingFace LLM',
  //   description:
  //     "The HuggingFaceLLM class in the Zeta library provides a simple and easy-to-use interface to harness the power of Hugging Face's transformer-based language models, specifically for causal language modeling.",
  //   sampleCodes: {
  //     python: {
  //       sourceCode: codeStep4,
  //       title: 'python.py'
  //     }
  //   }
  // }
];

export default content;
