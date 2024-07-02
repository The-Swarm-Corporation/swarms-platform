import { Label } from "./components/label"
import { Input } from "./components/input"
import { Textarea } from "./components/textarea"
import { Switch } from "./components/switch"
import { Card, CardHeader, CardTitle, CardContent } from "./components/card"
import { Avatar, AvatarImage, AvatarFallback } from "./components/avatar"

export default function AgentBuilder() {
    return (
        <div className="flex min-h-screen w-full bg-background">
            <div className="flex-1 p-6 sm:p-8 md:p-10">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    <div className="space-y-2">
                        <Label htmlFor="agentName">Agent Name</Label>
                        <Input id="agentName" placeholder="Enter agent name" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="systemPrompt">System Prompt</Label>
                        <Textarea id="systemPrompt" placeholder="Enter system prompt" rows={3} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="agentDescription">Agent Description</Label>
                        <Textarea id="agentDescription" placeholder="Enter agent description" rows={3} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="modelName">Model Name</Label>
                        <Input id="modelName" placeholder="Enter model name" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="maxLoops">Max Loops</Label>
                        <Input id="maxLoops" type="number" placeholder="Enter max loops" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="autosave">Autosave</Label>
                        <Switch id="autosave" aria-label="Autosave" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="dynamicTemperatureEnabled">Dynamic Temperature Enabled</Label>
                        <Switch id="dynamicTemperatureEnabled" aria-label="Dynamic Temperature Enabled" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="dashboard">Dashboard</Label>
                        <Switch id="dashboard" aria-label="Dashboard" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="verbose">Verbose</Label>
                        <Switch id="verbose" aria-label="Verbose" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="streamingOn">Streaming On</Label>
                        <Switch id="streamingOn" aria-label="Streaming On" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="savedStatePath">Saved State Path</Label>
                        <Input id="savedStatePath" placeholder="Enter saved state path" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="sop">SOP</Label>
                        <Textarea id="sop" placeholder="Enter SOP" rows={3} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="sopList">SOP List</Label>
                        <Textarea id="sopList" placeholder="Enter SOP list" rows={3} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="userName">User Name</Label>
                        <Input id="userName" placeholder="Enter user name" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="retryAttempts">Retry Attempts</Label>
                        <Input id="retryAttempts" type="number" placeholder="Enter retry attempts" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="contextLength">Context Length</Label>
                        <Input id="contextLength" type="number" placeholder="Enter context length" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="task">Task</Label>
                        <Textarea id="task" placeholder="Enter task" rows={3} />
                    </div>
                </div>
            </div>
            <div className="flex-1 border-l bg-muted/40 p-6 sm:p-8 md:p-10 h-fit">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>API Request</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <pre className="whitespace-pre-wrap break-all">{`{
  "agent_name": "My Agent",
  "system_prompt": "You are a helpful AI assistant.",
  "agent_description": "A friendly and knowledgeable AI agent.",
  "model_name": "gpt-3.5-turbo",
  "max_loops": 5,
  "autosave": true,
  "dynamic_temperature_enabled": true,
  "dashboard": true,
  "verbose": false,
  "streaming_on": true,
  "saved_state_path": "/path/to/saved/state",
  "sop": "Follow these steps...",
  "sop_list": [
    "Step 1",
    "Step 2",
    "Step 3"
  ],
  "user_name": "John Doe",
  "retry_attempts": 3,
  "context_length": 1024,
  "task": "Explain the concept of machine learning in simple terms."
}`}</pre>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Chat</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-start gap-4">
                                        <Avatar className="w-10 h-10 border">
                                            <AvatarImage src="/placeholder-user.jpg" />
                                            <AvatarFallback>JD</AvatarFallback>
                                        </Avatar>
                                        <div className="grid gap-1">
                                            <div className="font-bold">User</div>
                                            <div className="prose text-muted-foreground">
                                                <p>Explain the concept of machine learning in simple terms.</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <Avatar className="w-10 h-10 border">
                                            <AvatarImage src="/placeholder-user.jpg" />
                                            <AvatarFallback>AI</AvatarFallback>
                                        </Avatar>
                                        <div className="grid gap-1">
                                            <div className="font-bold">Agent</div>
                                            <div className="prose text-muted-foreground">
                                                <p>
                                                    Machine learning is a type of artificial intelligence that allows computers to learn and
                                                    improve from experience without being explicitly programmed. It involves using algorithms and
                                                    statistical models to analyze data and make predictions or decisions without relying on
                                                    rule-based programming.
                                                </p>
                                                <p>
                                                    The key idea behind machine learning is that the computer can identify patterns in data and
                                                    use those patterns to make predictions or decisions. For example, a machine learning algorithm
                                                    could be trained on a large dataset of images of different types of animals, and then it could
                                                    be used to identify the type of animal in a new image.
                                                </p>
                                                <p>
                                                    Machine learning is used in a wide variety of applications, such as image recognition, natural
                                                    language processing, and predictive analytics. It has become an increasingly important tool in
                                                    fields like healthcare, finance, and transportation, where it can be used to make more
                                                    accurate and informed decisions.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}