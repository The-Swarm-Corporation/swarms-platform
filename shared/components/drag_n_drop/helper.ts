export function getOptimizeSystemPrompt(currentPrompt: string) {
  const systemOptimizationPrompt = `
    Your task is to optimize the following system prompt for an AI agent. The optimized prompt should be highly reliable, production-grade, and tailored to the specific needs of the agent. Consider the following guidelines:

    1. Thoroughly understand the agent's requirements and capabilities.
    2. Employ diverse prompting strategies (e.g., chain of thought, few-shot learning).
    3. Blend strategies effectively for the specific task or scenario.
    4. Ensure production-grade quality and educational value.
    5. Provide necessary constraints for the agent's operation.
    6. Design for extensibility and wide scenario coverage.
    7. Aim for a prompt that fosters the agent's growth and specialization.

    Original prompt to optimize:
    ${currentPrompt}

    Please provide an optimized version of this prompt, incorporating the guidelines mentioned above. Only return the optimized prompt, no other text or comments.
    `;

  return systemOptimizationPrompt;
}
