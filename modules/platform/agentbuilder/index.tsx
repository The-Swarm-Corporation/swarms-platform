/**
 * v0 by Vercel.
 * @see https://v0.dev/t/LCRL38Cq152
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
"use client"

import { useState } from "react"
import { Label } from "./components/label"
import { Input } from "./components/input"
import { Textarea } from "./components/textarea"
import { Checkbox } from "./components/checkbox"
import { Button } from "./components/button"

interface ChatMessage {
    role: string
    content: string
}

interface ApiRequest {
    request: string
    response: string
}

export default function Component() {
    const [agentName, setAgentName] = useState<string>("")
    const [systemPrompt, setSystemPrompt] = useState<string>("")
    const [agentDescription, setAgentDescription] = useState<string>("")
    const [modelName, setModelName] = useState<string>("")
    const [maxLoops, setMaxLoops] = useState<number>(10)
    const [autosave, setAutosave] = useState<boolean>(true)
    const [dynamicTemperatureEnabled, setDynamicTemperatureEnabled] = useState<boolean>(true)
    const [dashboard, setDashboard] = useState<boolean>(false)
    const [verbose, setVerbose] = useState<boolean>(false)
    const [streamingOn, setStreamingOn] = useState<boolean>(true)
    const [savedStatePath, setSavedStatePath] = useState<string>("")
    const [sop, setSop] = useState<string>("")
    const [sopList, setSopList] = useState<string[]>([])
    const [userName, setUserName] = useState("")
    const [retryAttempts, setRetryAttempts] = useState(3)
    const [contextLength, setContextLength] = useState(1024)
    const [task, setTask] = useState("")
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])
    const [apiRequests, setApiRequests] = useState<ApiRequest[]>([])
    const handleSubmit = (e: any) => {
        e.preventDefault()
        const newChatMessage = {
            role: "user",
            content: task,
        }
        setChatHistory([...chatHistory, newChatMessage])
        const response = {
            role: "assistant",
            content: "This is a sample response from the AI agent.",
        }
        setChatHistory([...chatHistory, response])
        setApiRequests([...apiRequests, { request: task, response: response.content }])
    }
    return (
        <div className="flex h-screen bg-black w-full">
            <div className="w-1/3 bg-black p-6 border rounded-md border-white h-fit">
                <h2 className="text-2xl font-bold mb-4 text-red-500">Agent Configuration</h2>
                <form onSubmit={handleSubmit} className="grid gap-4">
                    <div>
                        <Label htmlFor="agentName" className="text-red-500">
                            Agent Name
                        </Label>
                        <Input
                            id="agentName"
                            value={agentName}
                            onChange={(e) => setAgentName(e.target.value)}
                            className="bg-black border-white text-red-500"
                        />
                    </div>
                    <div>
                        <Label htmlFor="systemPrompt" className="text-red-500">
                            System Prompt
                        </Label>
                        <Textarea
                            id="systemPrompt"
                            value={systemPrompt}
                            onChange={(e) => setSystemPrompt(e.target.value)}
                            className="bg-black border-white text-red-500"
                        />
                    </div>
                    <div>
                        <Label htmlFor="agentDescription" className="text-red-500">
                            Agent Description
                        </Label>
                        <Input
                            id="agentDescription"
                            value={agentDescription}
                            onChange={(e) => setAgentDescription(e.target.value)}
                            className="bg-black border-white text-red-500"
                        />
                    </div>
                    <div>
                        <Label htmlFor="modelName" className="text-red-500">
                            Model Name
                        </Label>
                        <Input
                            id="modelName"
                            value={modelName}
                            onChange={(e) => setModelName(e.target.value)}
                            className="bg-black border-white text-red-500"
                        />
                    </div>
                    <div>
                        <Label htmlFor="maxLoops" className="text-red-500">
                            Max Loops
                        </Label>
                        <Input
                            id="maxLoops"
                            type="number"
                            value={maxLoops}
                            onChange={(e) => setMaxLoops(Number(e.target.value))}
                            className="bg-black border-white text-red-500"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="autosave"
                            checked={autosave}
                            className="accent-red-500"
                            onCheckedChange={(checked) => {
                                if (typeof checked === 'boolean') {
                                    setAutosave(checked);
                                }
                            }}
                        />
                        <Label htmlFor="autosave" className="text-red-500">
                            Autosave
                        </Label>
                    </div>
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="dynamicTemperatureEnabled"
                            checked={dynamicTemperatureEnabled}
                            className="accent-red-500"
                            onCheckedChange={(checked) => {
                                if (typeof checked === 'boolean') {
                                    setDynamicTemperatureEnabled(checked);
                                }
                            }}
                        />
                        <Label htmlFor="dynamicTemperatureEnabled" className="text-red-500">
                            Dynamic Temperature Enabled
                        </Label>
                    </div>
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="dashboard"
                            checked={dashboard}
                            className="accent-red-500"
                            onCheckedChange={(checked) => {
                                if (typeof checked === 'boolean') {
                                    setDashboard(checked);
                                }
                            }}
                        />
                        <Label htmlFor="dashboard" className="text-red-500">
                            Dashboard
                        </Label>
                    </div>
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="verbose"
                            checked={verbose}
                            className="accent-red-500"
                            onCheckedChange={(checked) => {
                                if (typeof checked === 'boolean') {
                                    setVerbose(checked);
                                }
                            }}
                        />
                        <Label htmlFor="verbose" className="text-red-500">
                            Verbose
                        </Label>
                    </div>
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="streamingOn"
                            checked={streamingOn}
                            className="accent-red-500"
                            onCheckedChange={(checked) => {
                                if (typeof checked === 'boolean') {
                                    setStreamingOn(checked);
                                }
                            }}
                        />
                        <Label htmlFor="streamingOn" className="text-red-500">
                            Streaming On
                        </Label>
                    </div>
                    <div>
                        <Label htmlFor="savedStatePath" className="text-red-500">
                            Saved State Path
                        </Label>
                        <Input
                            id="savedStatePath"
                            value={savedStatePath}
                            onChange={(e) => setSavedStatePath(e.target.value)}
                            className="bg-black border-white text-red-500"
                        />
                    </div>
                    <div>
                        <Label htmlFor="sop" className="text-red-500">
                            SOP
                        </Label>
                        <Input
                            id="sop"
                            value={sop}
                            onChange={(e) => setSop(e.target.value)}
                            className="bg-black border-white text-red-500"
                        />
                    </div>
                    <div>
                        <Label htmlFor="sopList" className="text-red-500">
                            SOP List
                        </Label>
                        <Textarea
                            id="sopList"
                            value={sopList.join("\n")}
                            onChange={(e) => setSopList(e.target.value.split("\n"))}
                            className="bg-black border-white text-red-500"
                        />
                    </div>
                    <div>
                        <Label htmlFor="userName" className="text-red-500">
                            User Name
                        </Label>
                        <Input
                            id="userName"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            className="bg-black border-white text-red-500"
                        />
                    </div>
                    <div>
                        <Label htmlFor="retryAttempts" className="text-red-500">
                            Retry Attempts
                        </Label>
                        <Input
                            id="retryAttempts"
                            type="number"
                            value={retryAttempts}
                            onChange={(e) => setRetryAttempts(Number(e.target.value))}
                            className="bg-black border-white text-red-500"
                        />
                    </div>
                    <div>
                        <Label htmlFor="contextLength" className="text-red-500">
                            Context Length
                        </Label>
                        <Input
                            id="contextLength"
                            type="number"
                            value={contextLength}
                            onChange={(e) => setContextLength(Number(e.target.value))}
                            className="bg-black border-white text-red-500"
                        />
                    </div>
                    <div>
                        <Label htmlFor="task" className="text-red-500">
                            Task
                        </Label>
                        <Textarea
                            id="task"
                            value={task}
                            onChange={(e) => setTask(e.target.value)}
                            className="bg-black border-white text-red-500"
                        />
                    </div>
                    <Button type="submit" className="bg-red-500 text-black hover:bg-red-600">
                        Submit
                    </Button>
                </form>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-4 p-6">
                <div className="border rounded-lg p-4 border-white">
                    <h3 className="text-xl font-bold mb-4 text-red-500">API Requests</h3>
                    <div className="space-y-4">
                        {apiRequests.map((request, index) => (
                            <div key={index}>
                                <div className="font-medium text-red-500">Request:</div>
                                <pre className="bg-black p-2 rounded-md border border-white text-red-500">{request.request}</pre>
                                <div className="font-medium mt-2 text-red-500">Response:</div>
                                <pre className="bg-black p-2 rounded-md border border-white text-red-500">{request.response}</pre>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="border rounded-lg p-4 border-white">
                    <h3 className="text-xl font-bold mb-4 text-red-500">Chat Interface</h3>
                    <div className="space-y-4">
                        {chatHistory.map((message, index) => (
                            <div
                                key={index}
                                className={`${message.role === "user" ? "bg-black border-white" : "bg-red-500/10 border-white"
                                    } p-4 rounded-md border`}
                            >
                                <div className="font-medium text-red-500">{message.role === "user" ? "You" : "Agent"}:</div>
                                <div className="text-red-500">{message.content}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}