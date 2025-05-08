"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { PlayCircle, Plus, Trash2, AlertTriangle, Loader2 } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/shared/components/ui/card"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"
import { Textarea } from "@/shared/components/ui/textarea"
import { useStorageManager } from "@/shared/utils/api/telemetry/storage"
import { SwarmOutputViewer } from "@/shared/components/telemetry/swarm-output-viewer"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Switch } from "@/shared/components/ui/switch"
import { AgentSearch } from "@/shared/components/telemetry/agent-search"
import { SwarmChat } from "@/shared/components/telemetry/swarm-chat"
import { Badge } from "@/shared/components/ui/badge" 
import { useAPIKeyContext } from "@/shared/components/ui/apikey.provider"

interface Agent {
  agent_name: string
  description: string
  system_prompt: string
  model_name: string
  role: "worker"
  max_loops: number
}

interface SwarmRequest {
  name: string
  description: string
  agents: Agent[]
  max_loops: number
  swarm_type:
    | "ConcurrentWorkflow"
    | "SequentialWorkflow"
    | "AgentRearrange"
    | "MixtureOfAgents"
    | "SpreadSheetSwarm"
    | "GroupChat"
    | "MultiAgentRouter"
    | "AutoSwarmBuilder"
    | "HiearchicalSwarm"
    | "auto"
    | "MajorityVoting"
  task: string
}

export default function CreateSwarm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [currentSwarmId, setCurrentSwarmId] = useState<string | null>(null)
  const [request, setRequest] = useState<SwarmRequest>({
    name: "",
    description: "",
    agents: [],
    max_loops: 1,
    swarm_type: "SequentialWorkflow",
    task: "",
  })
  const [autoSave, setAutoSave] = useState(true)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [creationMode, setCreationMode] = useState<"form" | "chat" | "templates">("form")
  const [apiError, setApiError] = useState<string | null>(null)
  const [debugLog, setDebugLog] = useState<string[]>([])
  const { apiKey } = useAPIKeyContext();

  // Use a ref to track if component is mounted to prevent state updates during SSR
  const isMounted = useRef(false)

  const storageManager = useStorageManager()

  // Add debug logging function
  const logDebug = useCallback((message: string, data?: any) => {
    if (typeof window === "undefined") return // Skip during SSR

    console.log(`[DEBUG] ${message}`, data)
    if (isMounted.current) {
      setDebugLog((prev) => [...prev, `${new Date().toISOString()} - ${message}`])
    }
  }, [])

  useEffect(() => {
    isMounted.current = true
    logDebug("Component mounted, storageManager available:", !!storageManager)

    return () => {
      isMounted.current = false
    }
  }, [logDebug, storageManager])

  // Auto-save effect
  useEffect(() => {
    if (!isMounted.current || !autoSave || !request.name || typeof storageManager !== "object") {
      return
    }

    const saveTimeout = setTimeout(() => {
      try {
        logDebug("Attempting autosave")
        if (request.name && request.task && request.agents && request.agents.length > 0) {
          const savedAgentIds = request.agents
            .map((a) => {
              if (!a) return ""

              try {
                const savedAgent = storageManager?.addAgent({
                  name: a.agent_name || "Unnamed Agent",
                  description: a.description || "",
                  systemPrompt: a.system_prompt || "",
                  modelName: a.model_name || "gpt-4o",
                  role: a.role || "worker",
                  maxLoops: a.max_loops || 1,
                })
                return savedAgent?.id || ""
              } catch (agentError) {
                console.error("Error saving agent:", agentError)
                return ""
              }
            })
            .filter((id) => id !== "")

          const savedSwarm = storageManager?.addSwarm({
            name: request.name,
            description: request.description || "",
            agents: savedAgentIds,
            maxLoops: request.max_loops || 1,
            swarmType: request.swarm_type as any || "SequentialWorkflow",
            task: request.task,
            tags: [],
          })

          if (savedSwarm) {
            setLastSaved(new Date())
            setCurrentSwarmId(savedSwarm.id)
            toast.success("Swarm autosaved")
          }
        }
      } catch (error) {
        console.error("Error autosaving swarm:", error)
        toast.error("Failed to autosave swarm")
      }
    }, 5000)

    return () => clearTimeout(saveTimeout)
  }, [request, autoSave, storageManager, logDebug])

  const addAgent = () => {
    setRequest({
      ...request,
      agents: [
        ...(request.agents || []),
        {
          agent_name: "",
          description: "",
          system_prompt: "",
          model_name: "gpt-4o",
          role: "worker",
          max_loops: 1,
        },
      ],
    })
  }

  const removeAgent = (index: number) => {
    if (!request.agents) return

    const newAgents = [...request.agents]
    newAgents.splice(index, 1)
    setRequest({ ...request, agents: newAgents })
  }

  const updateAgent = (index: number, field: keyof Agent, value: string | number) => {
    if (!request.agents) return

    const newAgents = [...request.agents]
    if (!newAgents[index]) return

    newAgents[index] = { ...newAgents[index], [field]: value }
    setRequest({ ...request, agents: newAgents })
  }

  const generatePythonCode = () => {
    const safeRequest = {
      name: request.name || "",
      description: request.description || "",
      agents: (request.agents || []).map((agent) => ({
        agent_name: agent.agent_name || "",
        description: agent.description || "",
        system_prompt: agent.system_prompt || "",
        model_name: agent.model_name || "gpt-4o",
        role: agent.role || "worker",
        max_loops: agent.max_loops || 1,
      })),
      max_loops: request.max_loops || 1,
      swarm_type: request.swarm_type || "SequentialWorkflow",
      task: request.task || "",
    }

    return `import requests

API_KEY = "your_api_key_here"
BASE_URL = "https://swarms-api-285321057562.us-east1.run.app"

headers = {
  "x-api-key": API_KEY,
  "Content-Type": "application/json"
}

payload = ${JSON.stringify(safeRequest, null, 4)}

response = requests.post(
  f"{BASE_URL}/v1/swarm/completions",
  headers=headers,
  json=payload
)

print(response.json())`
  }

  const generateNodeCode = () => {
    const safeRequest = {
      name: request.name || "",
      description: request.description || "",
      agents: (request.agents || []).map((agent) => ({
        agent_name: agent.agent_name || "",
        description: agent.description || "",
        system_prompt: agent.system_prompt || "",
        model_name: agent.model_name || "gpt-4o",
        role: agent.role || "worker",
        max_loops: agent.max_loops || 1,
      })),
      max_loops: request.max_loops || 1,
      swarm_type: request.swarm_type || "SequentialWorkflow",
      task: request.task || "",
    }

    return `const API_KEY = 'your_api_key_here';
const BASE_URL = 'https://swarms-api-285321057562.us-east1.run.app';

const headers = {
'x-api-key': API_KEY,
'Content-Type': 'application/json'
};

const payload = ${JSON.stringify(safeRequest, null, 2)};

async function runSwarm() {
try {
  const response = await fetch(\`\${BASE_URL}/v1/swarm/completions\`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || \`Error: \${response.status} \${response.statusText}\`);
  }
  
  return await response.json();
} catch (error) {
  console.error('Error:', error);
  throw error;
}
}`
  }

  const generateRustCode = () => {
    const safeRequest = {
      name: request.name || "",
      description: request.description || "",
      agents: (request.agents || []).map((agent) => ({
        agent_name: agent.agent_name || "",
        description: agent.description || "",
        system_prompt: agent.system_prompt || "",
        model_name: agent.model_name || "gpt-4o",
        role: agent.role || "worker",
        max_loops: agent.max_loops || 1,
      })),
      max_loops: request.max_loops || 1,
      swarm_type: request.swarm_type || "SequentialWorkflow",
      task: request.task || "",
    }

    return `use reqwest::{Client, header};
use serde_json::json;

const BASE_URL: &str = "https://swarms-api-285321057562.us-east1.run.app";
const API_KEY: &str = "your_api_key_here";

async fn run_swarm() -> Result<String, Box<dyn std::error::Error>> {
  let client = Client::new();
  
  let payload = json!(${JSON.stringify(safeRequest, null, 4)});

  let response = client
      .post(format!("{}/v1/swarm/completions", BASE_URL))
      .header("x-api-key", API_KEY)
      .header("Content-Type", "application/json")
      .json(&payload)
      .send()
      .await?;
      
  if !response.status().is_success() {
    return Err(format!("API Error: {}", response.status()).into());
  }

  let result = response.text().await?;
  Ok(result)
}`
  }

  const validateRequest = () => {
    if (!request.name) return "Swarm name is required"
    if (!request.task) return "Task description is required"
    if (!request.agents || request.agents.length === 0) return "At least one agent is required"

    // Check if any agent is missing required fields
    for (let i = 0; i < request.agents.length; i++) {
      const agent = request.agents[i]
      if (!agent) return `Agent at position ${i} is invalid`
      if (!agent.agent_name) return `Agent ${i + 1} is missing a name`
      if (!agent.system_prompt) return `Agent ${i + 1} is missing a system prompt`
    }

    return null
  }

  const runSwarm = async () => {
    // Clear previous errors
    setApiError(null)

    // Validate request
    const validationError = validateRequest()
    if (validationError) {
      toast.error(validationError)
      return
    }

    if (typeof window !== "undefined") {
      if (!apiKey) {
        toast.error("Please configure your API key first")
        setApiError("API key not configured. Please set your API key in the dashboard.")
        return
      }
    }

    setIsLoading(true)
    const startTime = Date.now()
    let savedSwarm

    try {
      // Save the swarm first
      savedSwarm = storageManager?.addSwarm({
        name: request.name,
        description: request.description || "",
        agents: (request.agents || [])
          .map((a) => {
            if (!a) return ""
            const savedAgent = storageManager?.addAgent({
              name: a.agent_name || "Unnamed Agent",
              description: a.description || "",
              systemPrompt: a.system_prompt || "",
              modelName: a.model_name || "gpt-4o",
              role: a.role || "worker",
              maxLoops: a.max_loops || 1,
            })
            return savedAgent?.id || ""
          })
          .filter((id) => id !== ""),
        maxLoops: request.max_loops || 1,
        swarmType: request.swarm_type as any || "SequentialWorkflow",
        task: request.task,
        tags: [],
      })

      if (!savedSwarm) {
        throw new Error("Failed to save swarm locally")
      }

      // Prepare payload with defensive coding
      const payload = {
        name: request.name,
        description: request.description || "",
        agents: (request.agents || []).map((agent) => ({
          agent_name: agent.agent_name || "Unnamed Agent",
          description: agent.description || "",
          system_prompt: agent.system_prompt || "",
          model_name: agent.model_name || "gpt-4o",
          role: agent.role || "worker",
          max_loops: agent.max_loops || 1,
        })),
        max_loops: request.max_loops || 1,
        swarm_type: request.swarm_type || "SequentialWorkflow",
        task: request.task,
      }

      // Make the API call - only in client-side
      if (typeof window !== "undefined" && apiKey) {
        const response = await fetch("https://swarms-api-285321057562.us-east1.run.app/v1/swarm/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
          },
          body: JSON.stringify(payload),
        })

        const data = await response.json()
        const executionTime = (Date.now() - startTime) / 1000 // Convert to seconds

        if (!response.ok) {
          console.error("API Error Response:", data)
          throw new Error(data.error || `API request failed: ${response.status} ${response.statusText}`)
        }

        // Calculate tokens and credits
        const tokensUsed = data.usage?.total_tokens || 0
        const creditsUsed = tokensUsed * 0.000001 // Example credit calculation

        // Track execution
        storageManager?.addSwarmExecution({
          swarmId: savedSwarm.id,
          tokensUsed,
          creditsUsed,
          success: true,
          executionTime,
        })

        // Save the output
        storageManager?.addOutput({
          swarmId: savedSwarm.id,
          output: JSON.stringify(data, null, 2),
          status: "success",
          tokensUsed,
          creditsUsed,
          executionTime,
        })
      }

      setCurrentSwarmId(savedSwarm.id)
      toast.success("Swarm executed successfully")
    } catch (error) {
      console.error("Error running swarm:", error)

      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      setApiError(errorMessage)

      // Track failed execution
      if (savedSwarm?.id) {
        storageManager?.addSwarmExecution({
          swarmId: savedSwarm.id,
          tokensUsed: 0,
          creditsUsed: 0,
          success: false,
          executionTime: (Date.now() - startTime) / 1000,
        })

        // Save the error output
        storageManager?.addOutput({
          swarmId: savedSwarm.id,
          output: errorMessage,
          status: "failed",
          tokensUsed: 0,
          creditsUsed: 0,
          executionTime: (Date.now() - startTime) / 1000,
        })
      }

      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const saveSwarm = () => {
    const validationError = validateRequest()
    if (validationError) {
      toast.error(validationError)
      return
    }

    try {
      const savedSwarm = storageManager?.addSwarm({
        name: request.name,
        description: request.description || "",
        agents: (request.agents || [])
          .map((a) => {
            if (!a) return ""
            const savedAgent = storageManager?.addAgent({
              name: a.agent_name || "Unnamed Agent",
              description: a.description || "",
              systemPrompt: a.system_prompt || "",
              modelName: a.model_name || "gpt-4o",
              role: a.role || "worker",
              maxLoops: a.max_loops || 1,
            })
            return savedAgent?.id || ""
          })
          .filter((id) => id !== ""),
        maxLoops: request.max_loops || 1,
        swarmType: request.swarm_type as any || "SequentialWorkflow",
        task: request.task,
        tags: [],
      })

      if (!savedSwarm) {
        throw new Error("Failed to save swarm")
      }

      toast.success("Swarm saved successfully")
      router.push("/swarms")
    } catch (error) {
      console.error("Error saving swarm:", error)
      toast.error(error instanceof Error ? error.message : "Failed to save swarm")
    }
  }

  // Template data
  const swarmTemplates = [
    {
      id: "financial-analysis",
      name: "Financial Document Analysis",
      description: "Analyze financial statements and reports to extract insights",
      use_case: "Perfect for analyzing annual reports, financial statements, and identifying key metrics and trends",
      swarm_type: "SequentialWorkflow",
      max_loops: 2,
      task: "Analyze the provided financial document. Extract key financial metrics, analyze year-over-year trends, identify potential risks, and provide a comprehensive summary with insights.",
      agents: [
        {
          agent_name: "Document Parser",
          description: "Extracts structured data from financial documents",
          system_prompt:
            "You are an expert financial document parser. Extract all relevant financial data from documents including: revenue, profit margins, EBITDA, cash flow, debt ratios, and other key financial metrics. Format the extracted data in a structured way that can be easily processed by other agents. Pay special attention to year-over-year comparisons and quarterly breakdowns. Ignore marketing language and focus only on quantitative data and factual statements about financial performance.",
          model_name: "gpt-4o",
          role: "worker",
          max_loops: 1,
        },
        {
          agent_name: "Financial Analyst",
          description: "Analyzes financial metrics and identifies trends",
          system_prompt:
            "You are an expert financial analyst with deep knowledge of accounting principles, financial markets, and business performance metrics. Analyze the provided financial data to: 1) Calculate key financial ratios (liquidity, solvency, profitability, efficiency), 2) Identify significant trends over multiple time periods, 3) Benchmark performance against industry standards when possible, 4) Flag any concerning metrics or potential red flags, 5) Identify areas of strong performance. Your analysis should be data-driven, balanced, and focused on actionable insights. Provide your analysis in a structured format that highlights the most important findings first.",
          model_name: "gpt-4o",
          role: "analyst",
          max_loops: 2,
        },
        {
          agent_name: "Risk Assessor",
          description: "Evaluates financial risks and compliance issues",
          system_prompt:
            "You are an expert in financial risk assessment and compliance. Analyze the financial data to identify potential risks including: 1) Liquidity risks, 2) Solvency concerns, 3) Market and interest rate exposure, 4) Regulatory compliance issues, 5) Governance concerns, 6) Operational risks. For each identified risk, assess its severity (Low/Medium/High), potential impact, and provide potential mitigation strategies. Your assessment should be comprehensive but focused on material risks that could significantly impact the organization.",
          model_name: "gpt-4o",
          role: "specialist",
          max_loops: 1,
        },
        {
          agent_name: "Executive Summary Writer",
          description: "Creates clear, concise executive summaries of financial analyses",
          system_prompt:
            "You are an executive communication specialist who creates concise, insightful summaries of financial analyses. Create an executive summary that: 1) Highlights 3-5 key findings from the financial analysis, 2) Presents the most important metrics in a digestible format, 3) Contextualizes the findings within broader business objectives, 4) Notes significant risks or opportunities, 5) Provides clear, actionable recommendations if appropriate. Your summary should be concise (no more than 500 words), written in clear business language accessible to non-financial executives, and focused on business impact rather than technical financial details.",
          model_name: "gpt-4o",
          role: "worker",
          max_loops: 1,
        },
      ],
    },
    {
      id: "medical-diagnosis",
      name: "Medical Diagnosis Assistant",
      description: "Help doctors with differential diagnosis based on symptoms",
      use_case:
        "Assists medical professionals by analyzing symptoms, suggesting possible diagnoses, and recommending tests",
      swarm_type: "GroupChat",
      max_loops: 3,
      task: "Based on the provided patient symptoms, medical history, and test results, develop a differential diagnosis, recommend additional tests if needed, and suggest potential treatment approaches. This is meant as a decision support tool for medical professionals only.",
      agents: [
        {
          agent_name: "Symptom Analyzer",
          description: "Analyzes patient symptoms and medical history",
          system_prompt:
            "You are an expert in clinical symptomatology with extensive experience in initial patient assessment. Your role is to analyze patient symptoms comprehensively by: 1) Identifying chief complaints and secondary symptoms, 2) Analyzing symptom patterns, duration, severity, and exacerbating/relieving factors, 3) Considering the patient's medical history, age, gender, and risk factors, 4) Organizing symptoms into potential syndromes or patterns, 5) Noting any red flags or emergency indicators. Present your analysis in a structured format that highlights key clinical patterns and concerns. You should be thorough but focused on clinically significant findings that will aid diagnosis. Avoid speculation beyond what the symptoms and history support.",
          model_name: "gpt-4o",
          role: "worker",
          max_loops: 1,
        },
        {
          agent_name: "Diagnostic Specialist",
          description: "Develops differential diagnoses based on clinical data",
          system_prompt:
            "You are an expert diagnostician with extensive experience in developing differential diagnoses. Based on the symptom analysis and available clinical data, create a comprehensive differential diagnosis that: 1) Lists possible diagnoses in order of likelihood, 2) For each diagnosis, note the supporting and contradicting evidence, 3) Consider common, uncommon, and critical diagnoses (those that should not be missed even if rare), 4) Take into account the patient's demographics, risk factors, and medical history, 5) Note any additional clinical findings that would help confirm or rule out each diagnosis. Your differential should be thorough yet clinically relevant, focusing on diagnoses that should reasonably be considered based on the available information.",
          model_name: "gpt-4o",
          role: "specialist",
          max_loops: 2,
        },
        {
          agent_name: "Testing Advisor",
          description: "Recommends appropriate diagnostic tests",
          system_prompt:
            "You are an expert in diagnostic testing with deep knowledge of laboratory medicine, radiology, and other clinical investigations. Based on the differential diagnosis, recommend appropriate diagnostic tests that: 1) Would help confirm or rule out the diagnoses under consideration, 2) Are arranged in a logical sequence (starting with simpler, less invasive, or more broadly informative tests), 3) Take into account test sensitivity, specificity, risks, and cost-effectiveness, 4) Consider the urgency of testing based on clinical suspicion, 5) Note any preparation required for specific tests. For each recommended test, briefly explain what information it would provide and how it would impact the diagnostic process. Be judicious in your recommendations, focusing on tests with high diagnostic yield while avoiding unnecessary testing.",
          model_name: "gpt-4o",
          role: "worker",
          max_loops: 1,
        },
        {
          agent_name: "Treatment Advisor",
          description: "Suggests evidence-based treatment approaches",
          system_prompt:
            "You are an expert in clinical therapeutics with extensive knowledge of evidence-based treatment guidelines. Based on the most likely diagnoses, suggest potential treatment approaches that: 1) Align with current clinical guidelines and best practices, 2) Are appropriate given the patient's characteristics, comorbidities, and contraindications, 3) Include first-line and alternative options if the first-line is contraindicated, 4) Note key considerations for dosing, administration, duration, and monitoring, 5) Address both definitive treatment and symptomatic relief where appropriate, 6) Consider non-pharmacological interventions when relevant. Present treatment options in a structured format, clearly indicating which diagnosis each treatment addresses. Remember to emphasize that final treatment decisions should always be made by the treating clinician based on confirmed diagnosis and patient-specific factors.",
          model_name: "gpt-4o",
          role: "specialist",
          max_loops: 1,
        },
        {
          agent_name: "Medical Literature Reviewer",
          description: "Provides evidence from medical literature",
          system_prompt:
            "You are an expert in evidence-based medicine with extensive knowledge of medical literature. Your role is to provide evidence-based context for the diagnostic and treatment considerations by: 1) Referencing relevant clinical guidelines from major medical organizations, 2) Noting the strength of evidence supporting key diagnostic criteria or treatments (e.g., based on randomized controlled trials, meta-analyses, expert consensus), 3) Highlighting any recent significant research findings that might impact diagnosis or management, 4) Noting areas of clinical uncertainty or ongoing debate in the literature, 5) Providing context on typical clinical courses, prognosis, and outcomes for diagnoses under consideration. Present information in a concise, clinically relevant manner focused on how the evidence applies to the case at hand. Avoid excessive detail while ensuring all major points are supported by current medical knowledge.",
          model_name: "gpt-4o",
          role: "analyst",
          max_loops: 2,
        },
      ],
    },
    {
      id: "legal-document-review",
      name: "Legal Document Review",
      description: "Review and analyze legal documents and contracts",
      use_case: "Ideal for contract review, compliance checks, due diligence, and legal risk assessment",
      swarm_type: "ConcurrentWorkflow",
      max_loops: 2,
      task: "Review the provided legal document or contract. Identify key terms, obligations, rights, potential risks, compliance issues, and suggest improvements or areas that may need negotiation.",
      agents: [
        {
          agent_name: "Contract Clause Analyzer",
          description: "Identifies and extracts key contractual clauses",
          system_prompt:
            "You are an expert legal document analyzer specializing in contract structure and clause identification. Your task is to: 1) Identify and extract all key clauses in the contract (e.g., term, termination, indemnification, limitation of liability, confidentiality, IP rights, governing law, dispute resolution, etc.), 2) For each clause, provide the exact section reference and a concise summary of its effect, 3) Highlight any unusual, non-standard, or particularly important clauses, 4) Note any missing standard clauses that would typically appear in this type of contract, 5) Analyze the overall structure and organization of the contract for clarity and completeness. Present your analysis in a structured format organized by clause type. Focus on accuracy in interpretation and clarity in explaining legal concepts in plain language while maintaining legal precision.",
          model_name: "gpt-4o",
          role: "worker",
          max_loops: 1,
        },
        {
          agent_name: "Rights and Obligations Assessor",
          description: "Maps out rights, obligations, and responsibilities",
          system_prompt:
            "You are an expert in contractual rights and obligations analysis. Your task is to: 1) Identify all rights granted to each party under the contract, 2) Catalog all obligations and requirements imposed on each party, 3) Note any conditions precedent that must be satisfied for rights or obligations to become effective, 4) Identify key deadlines and timeframes for performance, 5) Flag any ambiguities in the allocation of rights and responsibilities, 6) Assess the balance of rights and obligations between parties (is it relatively balanced or favoring one party?). Present your analysis in a party-by-party breakdown that clearly shows what each party must do and what each party is entitled to receive. Be precise in your language while making complex rights and obligations understandable.",
          model_name: "gpt-4o",
          role: "analyst",
          max_loops: 1,
        },
        {
          agent_name: "Risk and Liability Assessor",
          description: "Identifies potential legal risks and liabilities",
          system_prompt:
            "You are an expert in legal risk assessment and liability analysis. Your task is to: 1) Identify clauses that create significant legal or business risk (e.g., broad indemnities, unlimited liability, onerous performance standards), 2) Assess the scope and limitation of liabilities for each party, 3) Analyze warranty and representation provisions for overreach or gaps, 4) Evaluate the adequacy of liability caps, exclusions, and insurance requirements, 5) Identify potential scenarios where significant liability could arise, 6) Note any ambiguities that could create risk exposure. For each identified risk, provide a risk level assessment (High/Medium/Low) and a brief explanation of the nature of the risk. When appropriate, suggest potential modifications to mitigate identified risks. Be thorough in identifying risks while avoiding excessive focus on theoretical or extremely unlikely scenarios.",
          model_name: "gpt-4o",
          role: "specialist",
          max_loops: 2,
        },
        {
          agent_name: "Compliance Checker",
          description: "Evaluates regulatory and legal compliance",
          system_prompt:
            "You are an expert in regulatory compliance and legal requirements across various industries. Your task is to: 1) Identify any provisions that may raise compliance concerns under applicable laws and regulations, 2) Assess whether the contract includes all legally required clauses for its type and jurisdiction, 3) Evaluate privacy, data protection, and security provisions against relevant requirements (e.g., GDPR, CCPA, HIPAA), 4) Check for compliance with industry-specific regulations if apparent from the contract context, 5) Note any provisions that may raise enforceability concerns, 6) Identify any regulatory approval or notification requirements. Present your analysis by compliance domain (e.g., data privacy, consumer protection, industry-specific) with clear explanations of potential issues and applicable legal frameworks. Focus on material compliance concerns rather than minor technical issues.",
          model_name: "gpt-4o",
          role: "specialist",
          max_loops: 1,
        },
        {
          agent_name: "Negotiation Advisor",
          description: "Suggests potential areas for negotiation or amendment",
          system_prompt:
            "You are an expert legal negotiation strategist. Based on the analysis of the contract, your task is to: 1) Identify provisions that merit negotiation or amendment, prioritized by importance, 2) For each provision, suggest specific alternative language or approaches that would better balance the interests of the parties, 3) Provide brief rationales for the suggested changes that could be used in negotiations, 4) Note industry standards or common practices that differ from the current draft and could be referenced in negotiations, 5) Suggest additional provisions that might be beneficial to add, 6) Recommend strategic approaches for the overall negotiation. Present your recommendations in a prioritized format that distinguishes between critical issues, important but negotiable points, and minor suggestions. Ensure your advice is practical and balanced, respecting legitimate interests of all parties while advocating for a fair agreement.",
          model_name: "gpt-4o",
          role: "worker",
          max_loops: 1,
        },
      ],
    },
    {
      id: "market-research",
      name: "Market Research Analysis",
      description: "Analyze market trends, competition, and opportunities",
      use_case:
        "Excellent for product launches, market entry strategies, competitive analysis, and trend identification",
      swarm_type: "HiearchicalSwarm",
      max_loops: 3,
      task: "Analyze the target market and competitive landscape for the specified product or service. Identify key trends, consumer preferences, competitive positioning, and strategic opportunities.",
      agents: [
        {
          agent_name: "Market Trend Analyst",
          description: "Identifies and analyzes market trends and patterns",
          system_prompt:
            "You are an expert market trend analyst with deep knowledge of industry developments and consumer behavior. Your task is to: 1) Identify significant market trends relevant to the product/service category, 2) Analyze growth patterns, market size, and projected developments, 3) Evaluate technological, social, regulatory, and economic factors impacting the market, 4) Identify emerging opportunities and potential threats in the market landscape, 5) Assess market maturity and lifecycle stage. Your analysis should be data-driven where possible, citing relevant statistics and growth figures. Focus on significant trends that have material impact on market strategy rather than minor fluctuations. Consider both short-term movements and long-term structural changes in the market, and clearly distinguish between them in your analysis.",
          model_name: "gpt-4o",
          role: "analyst",
          max_loops: 2,
        },
        {
          agent_name: "Consumer Insights Specialist",
          description: "Analyzes consumer behavior, preferences, and needs",
          system_prompt:
            "You are an expert in consumer insights and behavior analysis. Your task is to: 1) Define and segment the target customer base for the product/service, 2) Analyze customer needs, preferences, and pain points within each segment, 3) Identify key purchasing factors and decision criteria for customers, 4) Evaluate customer acquisition channels and touchpoints, 5) Assess customer lifetime value considerations and retention factors, 6) Identify unmet needs or gaps in the market from the customer perspective. Your analysis should focus on actionable insights rather than general demographic information. Consider both functional and emotional aspects of customer decision-making, and highlight which customer segments represent the greatest opportunity and why. Where relevant, note how customer preferences are evolving and what that means for future product/service development.",
          model_name: "gpt-4o",
          role: "worker",
          max_loops: 1,
        },
        {
          agent_name: "Competitive Intelligence Analyst",
          description: "Analyzes competitors' strategies, strengths, and weaknesses",
          system_prompt:
            "You are an expert in competitive intelligence and analysis. Your task is to: 1) Identify key direct and indirect competitors in the market space, 2) Analyze each major competitor's positioning, value proposition, and market share, 3) Evaluate competitors' strengths, weaknesses, and core competencies, 4) Assess competitors' pricing strategies and business models, 5) Identify recent strategic moves by competitors (e.g., product launches, partnerships, acquisitions), 6) Analyze the competitive intensity of the market overall (e.g., barriers to entry, threat of substitutes). Present your analysis in a structured format that allows for easy comparison between competitors. Focus on substantive differences in strategy and capabilities rather than surface-level distinctions. Identify potential competitive responses to new market entrants or strategic shifts by existing players. Where possible, highlight competitors' probable future directions based on their current trajectories.",
          model_name: "gpt-4o",
          role: "analyst",
          max_loops: 2,
        },
        {
          agent_name: "SWOT Analyzer",
          description: "Conducts SWOT analysis for the business case",
          system_prompt:
            "You are an expert in strategic analysis specializing in SWOT frameworks. Based on the market research and competitive analysis, your task is to: 1) Identify internal Strengths that provide competitive advantage (e.g., unique capabilities, resources, brand equity), 2) Pinpoint internal Weaknesses that create disadvantages relative to competitors, 3) Recognize external Opportunities in the market that can be capitalized upon, 4) Flag external Threats that could negatively impact success in the market, 5) Rank the identified factors within each SWOT category by potential impact, 6) Note interconnections between different SWOT elements (e.g., how specific strengths could help capitalize on particular opportunities). Your analysis should be specific and actionable rather than generic. Focus on factors that genuinely differentiate or materially impact market success, avoiding generic points that would apply to any business. Aim for depth over breadth, identifying fewer but more significant and specific SWOT elements rather than an exhaustive list of minor factors.",
          model_name: "gpt-4o",
          role: "specialist",
          max_loops: 1,
        },
        {
          agent_name: "Strategic Opportunity Identifier",
          description: "Synthesizes insights to identify key strategic opportunities",
          system_prompt:
            "You are an expert strategic advisor specializing in market opportunity identification. Based on the comprehensive market analysis, your task is to: 1) Identify 3-5 key strategic opportunities for success in this market, 2) For each opportunity, explain the specific market gap or advantage it leverages, 3) Assess the potential impact and feasibility of capturing each opportunity, 4) Outline high-level strategic approaches to capitalize on each opportunity, 5) Note potential barriers or challenges to executing on these opportunities, 6) Provide a preliminary prioritization of the opportunities based on potential return and feasibility. Your recommendations should be specific to the market context, actionable, and grounded in the market research insights. Focus on opportunities that create meaningful differentiation or address significant unmet needs rather than incremental improvements. Consider timing factors that might make certain opportunities more or less attractive in the near term versus long term.",
          model_name: "gpt-4o",
          role: "supervisor",
          max_loops: 2,
        },
      ],
    },
    {
      id: "content-creation",
      name: "Content Creation & Marketing",
      description: "Create comprehensive content marketing campaigns",
      use_case: "Perfect for blog posts, social media campaigns, email marketing sequences, and content strategy",
      swarm_type: "MixtureOfAgents",
      max_loops: 2,
      task: "Create a comprehensive content marketing campaign for the specified product, service, or topic. Develop the content strategy, write engaging copy across multiple formats, and suggest distribution channels.",
      agents: [
        {
          agent_name: "Content Strategist",
          description: "Develops overall content strategy and messaging",
          system_prompt:
            "You are an expert content strategist with deep experience in integrated marketing campaigns. Your task is to: 1) Develop a cohesive content strategy aligned with the campaign objectives and target audience, 2) Define key messaging themes and brand voice guidelines for the campaign, 3) Outline a content calendar with recommended cadence and content types, 4) Identify key performance indicators to measure content effectiveness, 5) Suggest content distribution channels and promotional approaches, 6) Recommend content workflows and production processes. Your strategy should be comprehensive yet practical to implement. Focus on creating an integrated approach where different content pieces reinforce each other across the customer journey. Consider both short-term engagement metrics and long-term brand building in your recommendations. Provide clear strategic direction while allowing flexibility for creative execution.",
          model_name: "gpt-4o",
          role: "supervisor",
          max_loops: 2,
        },
        {
          agent_name: "SEO Specialist",
          description: "Optimizes content for search engines and keyword targeting",
          system_prompt:
            "You are an expert SEO specialist with deep knowledge of search engine algorithms and content optimization. Your task is to: 1) Conduct keyword research to identify primary and secondary target keywords for the campaign, 2) Recommend on-page SEO elements for each content piece (title tags, meta descriptions, headers), 3) Suggest internal linking strategies between content pieces, 4) Provide guidance on keyword density, semantic relevance, and natural language optimization, 5) Identify opportunities for featured snippets and rich results, 6) Recommend technical SEO considerations for content implementation. Focus on creating genuinely valuable content that aligns with search intent rather than keyword stuffing. Balance optimization for search visibility with maintaining excellent user experience and readability. Provide specific, actionable recommendations rather than general SEO principles. Consider both immediate ranking opportunities and long-term SEO strategy.",
          model_name: "gpt-4o",
          role: "specialist",
          max_loops: 1,
        },
        {
          agent_name: "Blog Content Writer",
          description: "Creates engaging, informative blog content",
          system_prompt:
            "You are an expert blog writer with exceptional skills in creating engaging, valuable content. Your task is to: 1) Create compelling blog post content that aligns with the content strategy and SEO requirements, 2) Develop attention-grabbing headlines, strong introductions, and satisfying conclusions, 3) Structure content with clear headings, subheadings, and scannable formatting, 4) Incorporate storytelling, examples, and evidence to support key points, 5) Maintain the appropriate brand voice while ensuring accessibility to the target audience, 6) Include relevant calls-to-action that guide readers to the next step in their journey. Your writing should be substantive and valuable, avoiding fluff or padding. Focus on creating genuine insight or utility for the reader rather than simply meeting word counts. Strike a balance between being conversational and authoritative, adjusting tone to suit the subject matter and audience sophistication. Ensure factual accuracy and support claims with evidence where appropriate.",
          model_name: "gpt-4o",
          role: "worker",
          max_loops: 1,
        },
        {
          agent_name: "Social Media Content Creator",
          description: "Crafts platform-specific social media content",
          system_prompt:
            "You are an expert social media content creator with deep knowledge of platform-specific best practices. Your task is to: 1) Create tailored content for different social platforms (e.g., Twitter, Instagram, LinkedIn, TikTok) based on the campaign strategy, 2) Develop attention-grabbing headlines and copy that drives engagement, 3) Suggest visual content approaches and descriptions for each platform, 4) Craft hashtag strategies appropriate to each platform, 5) Create conversation starters and engagement hooks, 6) Develop content series concepts that build audience anticipation and retention. Your content should respect each platform's unique culture, format requirements, and audience expectations. Focus on creating content that encourages engagement and sharing rather than simply broadcasting messages. Consider how to spark conversations and build community around the content. Be mindful of current platform trends and features while ensuring content remains on-brand and strategically aligned.",
          model_name: "gpt-4o",
          role: "worker",
          max_loops: 1,
        },
        {
          agent_name: "Email Marketing Specialist",
          description: "Develops email sequences and newsletter content",
          system_prompt:
            "You are an expert email marketing specialist with deep experience in developing effective email campaigns. Your task is to: 1) Create a strategic email sequence that guides subscribers through a meaningful journey, 2) Develop compelling subject lines optimized for open rates, 3) Write engaging email body content with clear, persuasive calls-to-action, 4) Structure email content for maximum readability and engagement on both desktop and mobile, 5) Suggest segmentation approaches and personalization strategies, 6) Develop A/B testing recommendations for optimizing performance. Your email content should balance providing immediate value to subscribers with advancing campaign objectives. Focus on creating a coherent subscriber journey where each email builds logically from previous communications. Consider the appropriate frequency, length, and content mix to maintain engagement without causing fatigue. Ensure all emails contain both standalone value and clear next steps for subscribers to take.",
          model_name: "gpt-4o",
          role: "worker",
          max_loops: 1,
        },
        {
          agent_name: "Analytics Interpreter",
          description: "Provides guidance on measuring content performance",
          system_prompt:
            "You are an expert marketing analytics specialist with deep knowledge of content performance measurement. Your task is to: 1) Define key metrics and KPIs for measuring the success of each content type in the campaign, 2) Recommend specific analytics implementation approaches for proper tracking, 3) Develop a reporting framework for ongoing performance assessment, 4) Suggest optimization opportunities based on anticipated performance patterns, 5) Define benchmarks and goals for key metrics based on industry standards, 6) Outline an approach for iterative testing and refinement based on performance data. Your recommendations should balance comprehensive measurement with practical focus on actionable metrics. Focus on connecting content performance data to actual business outcomes rather than vanity metrics. Consider both immediate performance indicators and longer-term impact measures. Provide guidance on interpreting results and translating analytics into actionable content optimization strategies.",
          model_name: "gpt-4o",
          role: "analyst",
          max_loops: 1,
        },
      ],
    },
  ]

  // Function to load a template into the form
  const loadTemplate = (template: any) => {
    setRequest({
      name: template.name,
      description: template.description,
      agents: template.agents,
      max_loops: template.max_loops,
      swarm_type: template.swarm_type,
      task: template.task,
    })

    setCreationMode("form")
    toast.success(`"${template.name}" template loaded successfully`)
  }

  // Helper function to generate code for a template
  const generateTemplateCode = (template: any) => {
    const payload = {
      name: template.name,
      description: template.description,
      agents: template.agents,
      max_loops: template.max_loops,
      swarm_type: template.swarm_type,
      task: template.task,
    }

    return `import requests

API_KEY = "your_api_key_here"
BASE_URL = "https://swarms-api-285321057562.us-east1.run.app"

headers = {
  "x-api-key": API_KEY,
  "Content-Type": "application/json"
}

payload = ${JSON.stringify(payload, null, 2)}

response = requests.post(
  f"{BASE_URL}/v1/swarm/completions",
  headers=headers,
  json=payload
)

print(response.json())`
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-white p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Create New Swarm</h1>
            <p className="text-zinc-400">Configure your swarm and test it</p>
          </div>
          <div className="space-x-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch checked={autoSave} onCheckedChange={setAutoSave} className="data-[state=checked]:bg-red-600" />
                <span className="text-sm text-zinc-400">
                  Autosave {lastSaved && `(Last saved: ${lastSaved.toLocaleTimeString()})`}
                </span>
              </div>
              <Button
                variant="outline"
                className="border-zinc-700 text-zinc-400"
                onClick={() => router.push("/swarms")}
              >
                Cancel
              </Button>
              <Button className="bg-red-600 hover:bg-red-700" onClick={saveSwarm}>
                Save Swarm
              </Button>
              <Button className="bg-red-600 hover:bg-red-700" onClick={runSwarm} disabled={isLoading}>
                {isLoading ? (
                  <span className="flex items-center">
                    <Loader2 className="animate-spin -ml-1 mr-3 h-4 w-4" />
                    Running...
                  </span>
                ) : (
                  <>
                    <PlayCircle className="mr-2 h-4 w-4" />
                    Run Swarm
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {apiError && (
          <Card className="bg-red-900/10 border-red-500">
            <CardContent className="p-4 flex gap-3 items-center">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <h4 className="font-semibold text-red-500">API Error</h4>
                <p className="text-sm text-zinc-300">{apiError}</p>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs
          defaultValue={creationMode}
          onValueChange={(value) => setCreationMode(value as "form" | "chat" | "templates")}
        >
          <TabsList>
            <TabsTrigger value="form">Form Builder</TabsTrigger>
            <TabsTrigger value="chat">Chat Builder</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="form">
            <Card>
              <CardHeader>
                <CardTitle>Swarm Configuration</CardTitle>
                <CardDescription>Define the parameters for your swarm</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">
                      Swarm Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      value={request.name || ""}
                      onChange={(e) => setRequest({ ...request, name: e.target.value })}
                      className="dark:border-zinc-700"
                    />
                  </div>
                  <div>
                    <Label htmlFor="swarm_type">
                      Swarm Type <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={request.swarm_type}
                      onValueChange={(value) =>
                        setRequest({
                          ...request,
                          swarm_type: value as
                            | "ConcurrentWorkflow"
                            | "SequentialWorkflow"
                            | "AgentRearrange"
                            | "MixtureOfAgents"
                            | "SpreadSheetSwarm"
                            | "GroupChat"
                            | "MultiAgentRouter"
                            | "AutoSwarmBuilder"
                            | "HiearchicalSwarm"
                            | "auto"
                            | "MajorityVoting",
                        })
                      }
                    >
                      <SelectTrigger id="swarm_type" className="w-full dark:border-zinc-700">
                        <SelectValue placeholder="Select swarm type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SequentialWorkflow">Sequential Workflow</SelectItem>
                        <SelectItem value="ConcurrentWorkflow">Concurrent Workflow</SelectItem>
                        <SelectItem value="AgentRearrange">Agent Rearrange</SelectItem>
                        <SelectItem value="MixtureOfAgents">Mixture Of Agents</SelectItem>
                        <SelectItem value="SpreadSheetSwarm">SpreadSheet Swarm</SelectItem>
                        <SelectItem value="GroupChat">Group Chat</SelectItem>
                        <SelectItem value="MultiAgentRouter">Multi-Agent Router</SelectItem>
                        <SelectItem value="AutoSwarmBuilder">Auto Swarm Builder</SelectItem>
                        <SelectItem value="HiearchicalSwarm">Hiearchical Swarm</SelectItem>
                        <SelectItem value="auto">Auto (Recommended)</SelectItem>
                        <SelectItem value="MajorityVoting">Majority Voting</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={request.description || ""}
                    onChange={(e) => setRequest({ ...request, description: e.target.value })}
                    className="dark:border-zinc-700"
                  />
                </div>
                <div>
                  <Label htmlFor="task">
                    Task <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="task"
                    value={request.task || ""}
                    onChange={(e) => setRequest({ ...request, task: e.target.value })}
                    className="dark:border-zinc-700"
                  />
                </div>
                <div>
                  <Label htmlFor="max_loops">Max Loops</Label>
                  <Input
                    type="number"
                    id="max_loops"
                    min={1}
                    value={String(request.max_loops || 1)}
                    onChange={(e) => setRequest({ ...request, max_loops: Number.parseInt(e.target.value) || 1 })}
                    className="dark:border-zinc-700"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <div className="flex items-center justify-between w-full">
                  <CardTitle>
                    Agents Configuration <span className="text-red-500">*</span>
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={addAgent} className="border-zinc-700 text-zinc-400">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Agent
                  </Button>
                </div>
                <CardDescription>Configure the agents for your swarm (at least one agent is required)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="mb-4">
                  <Label>Search Pre-built Agents</Label>
                  <AgentSearch
                    onSelect={(agent) => {
                      if (!agent) return

                      setRequest({
                        ...request,
                        agents: [
                          ...(request.agents || []),
                          {
                            agent_name: agent.name || "Unnamed Agent",
                            description: agent.description || "",
                            system_prompt: agent.systemPrompt || "",
                            model_name: agent.modelName || "gpt-4o",
                            role: "worker",
                            max_loops: agent.maxLoops || 1,
                          },
                        ],
                      })
                      toast.success(`Added agent: ${agent.name || "Unnamed Agent"}`)
                    }}
                  />
                </div>
                {(request.agents || []).map((agent, index) => (
                  <div key={index} className="border border-zinc-700 rounded-md p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Agent {index + 1}</h3>
                      <Button variant="destructive" size="sm" onClick={() => removeAgent(index)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`agent_name_${index}`}>
                          Agent Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id={`agent_name_${index}`}
                          value={agent?.agent_name || ""}
                          onChange={(e) => updateAgent(index, "agent_name", e.target.value)}
                          className="dark:border-zinc-700"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`model_name_${index}`}>Model Name</Label>
                        <Select
                          value={agent?.model_name || "gpt-4o"}
                          onValueChange={(value) => updateAgent(index, "model_name", value)}
                        >
                          <SelectTrigger id={`model_name_${index}`} className="w-full dark:border-zinc-700">
                            <SelectValue placeholder="Select model" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="gpt-4o">gpt-4o</SelectItem>
                            <SelectItem value="gpt-4">gpt-4</SelectItem>
                            <SelectItem value="gpt-3.5-turbo">gpt-3.5-turbo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor={`description_${index}`}>Description</Label>
                      <Textarea
                        id={`description_${index}`}
                        value={agent?.description || ""}
                        onChange={(e) => updateAgent(index, "description", e.target.value)}
                        className="dark:border-zinc-700"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`system_prompt_${index}`}>
                        System Prompt <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        id={`system_prompt_${index}`}
                        value={agent?.system_prompt || ""}
                        onChange={(e) => updateAgent(index, "system_prompt", e.target.value)}
                        className="dark:border-zinc-700"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`max_loops_${index}`}>Max Loops</Label>
                      <Input
                        type="number"
                        id={`max_loops_${index}`}
                        min={1}
                        value={String(agent?.max_loops || 1)}
                        onChange={(e) => updateAgent(index, "max_loops", Number.parseInt(e.target.value) || 1)}
                        className="dark:border-zinc-700"
                      />
                    </div>
                  </div>
                ))}

                {(request.agents || []).length === 0 && (
                  <div className="text-center py-8 border border-dashed border-zinc-700 rounded-md">
                    <p className="text-zinc-500">No agents added yet. Add at least one agent to your swarm.</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addAgent}
                      className="mt-4 border-zinc-700 text-zinc-400"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Your First Agent
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chat">
            <Card>
              <CardHeader>
                <CardTitle>Chat with Swarm Assistant</CardTitle>
                <CardDescription>
                  Describe your swarm in natural language and our assistant will help you configure it
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SwarmChat swarmName="Swarm Builder Assistant" swarmId={currentSwarmId || undefined} />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="templates">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {swarmTemplates.map((template) => (
                <Card
                  key={template.id}
                  className="border border-red-500/50 hover:border-red-600 hover:shadow-lg transition-all duration-200 h-full flex flex-col"
                >
                  <CardHeader>
                    <CardTitle className="text-red-600">{template.name}</CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-zinc-400">Workflow Type</span>
                        <Badge variant="outline" className="border-red-500/50 text-red-500">
                          {template.swarm_type}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-zinc-400">Agents</span>
                        <span className="text-sm">{template.agents.length}</span>
                      </div>
                      <div className="mt-4">
                        <p className="text-sm text-zinc-400 line-clamp-3">{template.use_case}</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t border-zinc-800 pt-4 flex justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-zinc-700 text-zinc-400"
                      onClick={() => {
                        const generatedCode = generateTemplateCode(template)
                        navigator.clipboard.writeText(generatedCode)
                        toast.success("Code copied to clipboard!")
                      }}
                    >
                      Copy Code
                    </Button>
                    <Button
                      className="bg-red-600 hover:bg-red-700 text-white"
                      size="sm"
                      onClick={() => loadTemplate(template)}
                    >
                      Use Template
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <Card>
          <CardHeader>
            <CardTitle>Code Generation</CardTitle>
            <CardDescription>Generate code snippets to run this swarm</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="python" className="w-full">
              <TabsList>
                <TabsTrigger value="python">Python</TabsTrigger>
                <TabsTrigger value="node">Node.js</TabsTrigger>
                <TabsTrigger value="rust">Rust</TabsTrigger>
              </TabsList>
              <TabsContent value="python">
                <div className="relative w-full">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute top-2 right-2 border-zinc-700 text-zinc-400"
                    onClick={() => {
                      navigator.clipboard.writeText(generatePythonCode())
                      toast.success("Copied to clipboard!")
                    }}
                  >
                    Copy code
                  </Button>
                  <pre className="rounded-md bg-zinc-900 p-4 mt-2">
                    <code className="text-sm text-zinc-200">{generatePythonCode()}</code>
                  </pre>
                </div>
              </TabsContent>
              <TabsContent value="node">
                <div className="relative w-full">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute top-2 right-2 border-zinc-700 text-zinc-400"
                    onClick={() => {
                      navigator.clipboard.writeText(generateNodeCode())
                      toast.success("Copied to clipboard!")
                    }}
                  >
                    Copy code
                  </Button>
                  <pre className="rounded-md bg-zinc-900 p-4 mt-2">
                    <code className="text-sm text-zinc-200">{generateNodeCode()}</code>
                  </pre>
                </div>
              </TabsContent>
              <TabsContent value="rust">
                <div className="relative w-full">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute top-2 right-2 border-zinc-700 text-zinc-400"
                    onClick={() => {
                      navigator.clipboard.writeText(generateRustCode())
                      toast.success("Copied to clipboard!")
                    }}
                  >
                    Copy code
                  </Button>
                  <pre className="rounded-md bg-zinc-900 p-4 mt-2">
                    <code className="text-sm text-zinc-200">{generateRustCode()}</code>
                  </pre>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {currentSwarmId && (
          <Card>
            <CardHeader>
              <CardTitle>Swarm Output</CardTitle>
              <CardDescription>View the output of the swarm execution</CardDescription>
            </CardHeader>
            <CardContent>
              <SwarmOutputViewer swarmId={currentSwarmId} />
            </CardContent>
          </Card>
        )}

        {/* Debug log section - only visible in development */}
        {typeof window !== "undefined" && process.env.NODE_ENV === "development" && debugLog.length > 0 && (
          <Card className="mt-6 border-yellow-500/50">
            <CardHeader>
              <CardTitle>Debug Log</CardTitle>
              <CardDescription>Detailed logging for debugging purposes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-black/50 p-4 rounded-md h-[200px] overflow-auto">
                {debugLog.map((log, i) => (
                  <div key={i} className="text-xs font-mono text-yellow-500 mb-1">
                    {log}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

