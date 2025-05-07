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

export async function fetchSwarmLogs(): Promise<SwarmLogsResponse> {
  if (typeof window === "undefined") {
    throw new Error("This function can only be called in the browser")
  }

  const apiKey = localStorage.getItem("swarms_api_key")
  if (!apiKey) {
    throw new Error("Please configure your API key in the dashboard first")
  }

  try {
    console.log("Fetching logs from API...")
    const response = await fetch("https://api.swarms.world/v1/swarm/logs", {
      method: "GET",
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
      },
    })

    console.log("API Response status:", response.status)

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
        localStorage.removeItem("swarms_api_key") // Clear invalid API key
        throw new Error("Invalid or expired API key. Please reconfigure your API key in the dashboard.")
      }

      throw new Error(
        `API request failed: ${response.status} ${response.statusText}${errorText ? ` - ${errorText}` : ""}`,
      )
    }

    const data = await response.json()
    console.log("API Response data:", data)

    // Validate response structure
    if (!data || typeof data !== "object") {
      console.error("Invalid response format:", data)
      throw new Error("Invalid API response format: not an object")
    }

    // Check if the response has the expected structure
    if (!data.status || !Array.isArray(data.logs)) {
      console.error("Invalid response format:", data)
      throw new Error("Invalid API response format: missing status or logs array")
    }

    // Filter and validate logs
    const validLogs = data.logs.filter((log: SwarmLog) => {
      if (!log.id || !log.created_at || !log.data) {
        console.warn("Skipping invalid log entry:", log)
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
    // Log the full error for debugging
    console.error("Error fetching swarm logs:", {
      error,
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    })

    // Ensure we're throwing an Error object with a descriptive message
    if (error instanceof Error) {
      throw new Error(`Failed to fetch logs: ${error.message}`)
    }
    throw new Error("Failed to fetch logs: Unknown error occurred")
  }
}

export async function fetchAvailableModels(): Promise<string[]> {
  if (typeof window === "undefined") {
    throw new Error("This function can only be called in the browser")
  }

  const apiKey = localStorage.getItem("swarms_api_key")
  if (!apiKey) {
    throw new Error("Please configure your API key in the dashboard first")
  }

  try {
    console.log("Fetching available models...")
    const response = await fetch("https://api.swarms.world/v1/models/available", {
      method: "GET",
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
      },
      // Add these options to help with potential network issues
      cache: "no-cache",
      credentials: "omit",
    })

    console.log("Models API Response status:", response.status)

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
        localStorage.removeItem("swarms_api_key") // Clear invalid API key
        throw new Error("Invalid or expired API key. Please reconfigure your API key in the dashboard.")
      }

      throw new Error(
        `API request failed: ${response.status} ${response.statusText}${errorText ? ` - ${errorText}` : ""}`,
      )
    }

    const data = await response.json()
    console.log("Models API Response data:", data)

    // Return a fallback array if the API doesn't return an array
    if (!Array.isArray(data)) {
      console.warn("API did not return an array for models, using fallback data")
      return ["gpt-4o", "gpt-4", "gpt-3.5-turbo"] // Fallback data
    }

    return data
  } catch (error) {
    console.error("Error fetching available models:", {
      error,
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    })

    // Provide fallback data in case of error
    console.warn("Using fallback model data due to API error")
    return ["gpt-4o", "gpt-4", "gpt-3.5-turbo"] // Fallback data
  }
}

export async function fetchAvailableSwarmTypes(): Promise<string[]> {
  if (typeof window === "undefined") {
    throw new Error("This function can only be called in the browser")
  }

  const apiKey = localStorage.getItem("swarms_api_key")
  if (!apiKey) {
    throw new Error("Please configure your API key in the dashboard first")
  }

  try {
    console.log("Fetching available swarm types...")
    const response = await fetch("https://api.swarms.world/v1/swarms/available", {
      method: "GET",
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
      },
      // Add these options to help with potential network issues
      cache: "no-cache",
      credentials: "omit",
    })

    console.log("Swarm Types API Response status:", response.status)

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
        localStorage.removeItem("swarms_api_key") // Clear invalid API key
        throw new Error("Invalid or expired API key. Please reconfigure your API key in the dashboard.")
      }

      throw new Error(
        `API request failed: ${response.status} ${response.statusText}${errorText ? ` - ${errorText}` : ""}`,
      )
    }

    const data = await response.json()
    console.log("Swarm Types API Response data:", data)

    // Return a fallback array if the API doesn't return an array
    if (!Array.isArray(data)) {
      console.warn("API did not return an array for swarm types, using fallback data")
      return [
        "SequentialWorkflow",
        "ConcurrentWorkflow",
        "AgentRearrange",
        "MixtureOfAgents",
        "GroupChat",
        "AutoSwarmBuilder",
      ] // Fallback data
    }

    return data
  } catch (error) {
    console.error("Error fetching available swarm types:", {
      error,
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    })

    // Provide fallback data in case of error
    console.warn("Using fallback swarm types data due to API error")
    return [
      "SequentialWorkflow",
      "ConcurrentWorkflow",
      "AgentRearrange",
      "MixtureOfAgents",
      "GroupChat",
      "AutoSwarmBuilder",
    ] // Fallback data
  }
}

