"use client"

export interface SwarmLog {
  id: number
  created_at: string
  data: {
    task: string
    output: string
    status: string
    metadata: {
      max_loops: number
      num_agents: number
      billing_info: {
        total_cost: number
        cost_breakdown: {
          agent_cost: number
          num_agents: number
          token_counts: {
            per_agent: {
              [key: string]: {
                input_tokens: number
                total_tokens: number
                output_tokens: number
              }
            }
            total_tokens: number
            total_input_tokens: number
            total_output_tokens: number
          }
          input_token_cost: number
          output_token_cost: number
          execution_time_seconds: number
        }
      }
      completion_time: number
      execution_time_seconds: number
    }
    swarm_name: string
    description: string
    agents?: Array<{
      model_name?: string
      role?: string
    }>
    swarm_type?: string
  }
}

export interface SwarmLogsResponse {
  status: string
  count: number
  logs: SwarmLog[]
}

export async function fetchSwarmLogs(apiKey: string): Promise<SwarmLogsResponse> {
  if (typeof window === "undefined") {
    throw new Error("This function can only be called in the browser")
  }

  if (!apiKey) {
    throw new Error("Please configure your API key in the dashboard first")
  }

  try {
    const response = await fetch("https://api.swarms.world/v1/swarm/logs", {
      method: "GET",
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("API Error Response:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      })

      if (response.status === 404) {
        throw new Error("The logs endpoint is not available. Please check your API configuration.")
      }

      if (response.status === 401 || response.status === 403) {
        throw new Error("Invalid or expired API key. Please reconfigure your API key in the dashboard.")
      }

      throw new Error(
        `API request failed: ${response.status} ${response.statusText}${errorText ? ` - ${errorText}` : ""}`,
      )
    }

    const data = await response.json()

    if (!data || typeof data !== "object") {
      console.error("Invalid response format:", data)
      throw new Error("Invalid API response format: not an object")
    }

    if (!data.status || !Array.isArray(data.logs)) {
      console.error("Invalid response format:", data)
      throw new Error("Invalid API response format: missing status or logs array")
    }

    const validLogs = data.logs.filter((log: SwarmLog) => {
      if (!log.id || !log.created_at || !log.data) {
        return false
      }
      return true
    })

    return {
      status: data.status,
      count: validLogs.length,
      logs: validLogs,
    }
  } catch (error) {
    console.error("Error fetching swarm logs:", {
      error,
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    })

    if (error instanceof Error) {
      throw new Error(`Failed to fetch logs: ${error.message}`)
    }
    throw new Error("Failed to fetch logs: Unknown error occurred")
  }
}

export async function fetchAvailableModels(apiKey: string): Promise<string[]> {
  if (typeof window === "undefined") {
    throw new Error("This function can only be called in the browser")
  }

  if (!apiKey) {
    throw new Error("Please configure your API key in the dashboard first")
  }

  try {
    const response = await fetch("https://api.swarms.world/v1/models/available", {
      method: "GET",
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
      },
      cache: "no-cache",
      credentials: "omit",
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("API Error Response:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      })

      if (response.status === 404) {
        throw new Error("The models endpoint is not available. Please check your API configuration.")
      }

      if (response.status === 401 || response.status === 403) {
        throw new Error("Invalid or expired API key. Please reconfigure your API key in the dashboard.")
      }

      throw new Error(
        `API request failed: ${response.status} ${response.statusText}${errorText ? ` - ${errorText}` : ""}`,
      )
    }

    const data = await response.json()

    if (!data?.models || !Array.isArray(data?.models)) {
      return ["gpt-4o", "gpt-4", "gpt-3.5-turbo"]
    }

    return data?.models;
  } catch (error) {
    console.error("Error fetching available models:", {
      error,
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    })

    return ["gpt-4o", "gpt-4", "gpt-3.5-turbo"]
  }
}

export async function fetchAvailableSwarmTypes(apiKey: string): Promise<string[]> {
  if (typeof window === "undefined") {
    throw new Error("This function can only be called in the browser")
  }

  if (!apiKey) {
    throw new Error("Please configure your API key in the dashboard first")
  }

  try {
    const response = await fetch("https://api.swarms.world/v1/swarms/available", {
      method: "GET",
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
      },
      cache: "no-cache",
      credentials: "omit",
    })


    if (!response.ok) {
      const errorText = await response.text()
      console.error("API Error Response:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      })

      if (response.status === 404) {
        throw new Error("The swarm types endpoint is not available. Please check your API configuration.")
      }

      if (response.status === 401 || response.status === 403) {
        throw new Error("Invalid or expired API key. Please reconfigure your API key in the dashboard.")
      }

      throw new Error(
        `API request failed: ${response.status} ${response.statusText}${errorText ? ` - ${errorText}` : ""}`,
      )
    }

    const data = await response.json()

    if (!data?.swarm_types || !Array.isArray(data?.swarm_types)) {
      return [
        "SequentialWorkflow",
        "ConcurrentWorkflow",
        "AgentRearrange",
        "MixtureOfAgents",
        "GroupChat",
        "AutoSwarmBuilder",
      ]
    }

    return data?.swarm_types
  } catch (error) {
    console.error("Error fetching available swarm types:", {
      error,
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    })

    return [
      "SequentialWorkflow",
      "ConcurrentWorkflow",
      "AgentRearrange",
      "MixtureOfAgents",
      "GroupChat",
      "AutoSwarmBuilder",
    ]
  }
}

