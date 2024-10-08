export const codeSample = {
  sequential_workflow: {
    chart: `
      graph TD;
        Layer[First Agent] --> Layer1[Second Agent];
        Layer1 --> Layer2[Third Agent];
        Layer2 --> FinalOutput[Fourth Agent];
  `,
    code: `
from swarms import Agent, SequentialWorkflow
from swarm_models import Anthropic

llm = Anthropic()

agent1 = Agent(
    agent_name="Blog generator",
    system_prompt="Generate a blog post like stephen king",
    llm=llm,
    max_loops=1,
    dashboard=False,
    tools=[],
)
agent2 = Agent(
    agent_name="summarizer",
    system_prompt="Summarize the blog post",
    llm=llm,
    max_loops=1,
    dashboard=False,
    tools=[],
)

workflow = SequentialWorkflow(
    agents=[agent1, agent2], max_loops=1, verbose=False
)

workflow.run(
    "Generate a blog post on how swarms of agents can help businesses grow."
)
              `,
  },
  agent_rearrange: {
    code: `
from swarms import Agent, AgentRearrange
from swarm_models import Anthropic

director = Agent(
    agent_name="Director",
    system_prompt="Directs the tasks for the workers",
    llm=Anthropic(),
    max_loops=1,
    dashboard=False,
    streaming_on=True,
    verbose=True,
    stopping_token="<DONE>",
    state_save_file_type="json",
    saved_state_path="director.json",
)

worker1 = Agent(
    agent_name="Worker1",
    system_prompt="Generates a transcript for a youtube video on what swarms are",
    llm=Anthropic(),
    max_loops=1,
    dashboard=False,
    streaming_on=True,
    verbose=True,
    stopping_token="<DONE>",
    state_save_file_type="json",
    saved_state_path="worker1.json",
)

worker2 = Agent(
    agent_name="Worker2",
    system_prompt="Summarizes the transcript generated by Worker1",
    llm=Anthropic(),
    max_loops=1,
    dashboard=False,
    streaming_on=True,
    verbose=True,
    stopping_token="<DONE>",
    state_save_file_type="json",
    saved_state_path="worker2.json",
)

agents = [director, worker1, worker2]
flow = "Director -> Worker1 -> Worker2"

agent_system = AgentRearrange(agents=agents, flow=flow)
output = agent_system.run(
    "Create a format to express and communicate swarms of llms in a structured manner for youtube"
)
              `,
  },
  mixture_of_agents: {
    chart: `
    graph TD;
        TaskInput --> Layer1[Layer 1: Reference Agents];
        Layer1 --> Agent1[Agent 1];
        Layer1 --> Agent2[Agent 2];
        Layer1 --> AgentN[Agent N];
        Agent1 --> Agent1Response[Agent 1 Response];
        Agent2 --> Agent2Response[Agent 2 Response];
        AgentN --> AgentNResponse[Agent N Response];
        Agent1Response --> Layer2[Aggregator Agent];
        Agent2Response --> Layer2[Aggregator Agent];
        AgentNResponse --> Layer2[Layer 2: Aggregator Agent];
        Layer2 --> Aggregate[Aggregate All Responses];
        Aggregate --> FinalOutput[Final Output];
`,
    code: `
from swarms import Agent, OpenAIChat, MixtureOfAgents

director = Agent(
    agent_name="Director",
    system_prompt="Directs the tasks for the accountants",
    llm=OpenAIChat(),
    max_loops=1,
    dashboard=False,
    streaming_on=True,
    verbose=True,
    stopping_token="<DONE>",
    state_save_file_type="json",
    saved_state_path="director.json",
)

accountant1 = Agent(
    agent_name="Accountant1",
    system_prompt="Prepares financial statements",
    llm=OpenAIChat(),
    max_loops=1,
    dashboard=False,
    streaming_on=True,
    verbose=True,
    stopping_token="<DONE>",
    state_save_file_type="json",
    saved_state_path="accountant1.json",
)

accountant2 = Agent(
    agent_name="Accountant2",
    system_prompt="Audits financial records",
    llm=OpenAIChat(),
    max_loops=1,
    dashboard=False,
    streaming_on=True,
    verbose=True,
    stopping_token="<DONE>",
    state_save_file_type="json",
    saved_state_path="accountant2.json",
)

agents = [director, accountant1, accountant2]

swarm = MixtureOfAgents(
    name="Mixture of Accountants",
    agents=agents,
    layers=3,
    final_agent=director,
)

out = swarm.run("Prepare financial statements and audit financial records")
              `,
  },
  forest_swarm: {
    code: `
from swarms.structs.tree_swarm import TreeAgent, Tree, ForestSwarm

agents_tree1 = [
    TreeAgent(
        system_prompt="Stock Analysis Agent",
        agent_name="Stock Analysis Agent",
    ),
    TreeAgent(
        system_prompt="Financial Planning Agent",
        agent_name="Financial Planning Agent",
    ),
    TreeAgent(
        agent_name="Retirement Strategy Agent",
        system_prompt="Retirement Strategy Agent",
    ),
]

agents_tree2 = [
    TreeAgent(
        system_prompt="Tax Filing Agent",
        agent_name="Tax Filing Agent",
    ),
    TreeAgent(
        system_prompt="Investment Strategy Agent",
        agent_name="Investment Strategy Agent",
    ),
    TreeAgent(
        system_prompt="ROTH IRA Agent", agent_name="ROTH IRA Agent"
    ),
]

tree1 = Tree(tree_name="Financial Tree", agents=agents_tree1)
tree2 = Tree(tree_name="Investment Tree", agents=agents_tree2)

multi_agent_structure = ForestSwarm(trees=[tree1, tree2])

task = "Our company is incorporated in delaware, how do we do our taxes for free?"
output = multi_agent_structure.run(task)
              `,
  },
};
