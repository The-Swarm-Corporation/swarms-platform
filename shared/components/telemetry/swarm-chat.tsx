"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Input } from "@/shared/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar"
import { ScrollArea } from "@/shared/components/ui/scroll-area"
import { SendHorizontal, Bot, UserIcon, Loader2 } from "lucide-react"
import { useStorageManager } from "@/shared/utils/api/telemetry/storage"
import { toast } from "sonner"
import { useAPIKeyContext } from "../ui/apikey.provider"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface SwarmChatProps {
  swarmId?: string
  swarmName?: string
}

export function SwarmChat({ swarmId, swarmName = "Swarm Assistant" }: SwarmChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I'm your Swarm Assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const storageManager = useStorageManager()
  const { apiKey } = useAPIKeyContext();

  useEffect(() => {
    scrollToBottom()
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    if (!input.trim()) return

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      if (!apiKey) {
        throw new Error("API key not configured")
      }

      // Simulate API response for now
      setTimeout(() => {
        const assistantMessage: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: generateResponse(userMessage.content),
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev, assistantMessage])
        setIsLoading(false)

        // Save chat history if swarmId is provided
        if (swarmId) {
          storageManager?.addOutput({
            swarmId,
            output: JSON.stringify(
              {
                query: userMessage.content,
                response: assistantMessage.content,
              },
              null,
              2,
            ),
            status: "success",
            tokensUsed: Math.floor(Math.random() * 1000) + 500,
            creditsUsed: Math.random() * 0.05 + 0.01,
            executionTime: Math.random() * 5 + 1,
          })
        }
      }, 1500)
    } catch (error) {
      console.error("Error sending message:", error)
      toast.error(error instanceof Error ? error.message : "Failed to send message")
      setIsLoading(false)
    }
  }

  // Simple response generator for demo purposes
  const generateResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase()

    if (lowerQuery.includes("hello") || lowerQuery.includes("hi")) {
      return "Hello! How can I assist you with your swarms today?"
    }

    if (lowerQuery.includes("create") || lowerQuery.includes("new swarm")) {
      return "To create a new swarm, you can click the 'Create New Swarm' button at the top of the page, or I can help you set one up through this chat. What kind of swarm would you like to create?"
    }

    if (lowerQuery.includes("agent") || lowerQuery.includes("agents")) {
      return "Agents are the building blocks of swarms. Each agent can be specialized for different tasks. You can create and manage agents in the Agents section, or I can help you design agents for your specific needs."
    }

    if (lowerQuery.includes("help") || lowerQuery.includes("how")) {
      return "I'm here to help you with the Swarms platform. You can ask me about creating swarms, managing agents, running tasks, or understanding the platform's capabilities. What specific information are you looking for?"
    }

    return (
      "I understand you're interested in \"" +
      query +
      "\". Could you provide more details about what you're trying to accomplish with swarms, and I'll do my best to assist you?"
    )
  }

  return (
    <Card className="flex flex-col h-[600px] border-red-500/50 bg-white dark:bg-zinc-900">
      <CardHeader className="border-b border-zinc-800">
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-red-500" />
          {swarmName}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-[480px] p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-3 ${message.role === "assistant" ? "justify-start" : "justify-end"}`}
              >
                {message.role === "assistant" && (
                  <Avatar className="h-8 w-8 border border-red-500/50">
                    <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Bot" />
                    <AvatarFallback className="bg-red-950 text-red-500">SA</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`rounded-lg px-4 py-2 max-w-[80%] ${
                    message.role === "assistant"
                      ? "bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white"
                      : "bg-red-600 text-white ml-auto"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs mt-1 opacity-70">{message.timestamp.toLocaleTimeString()}</p>
                </div>
                {message.role === "user" && (
                  <Avatar className="h-8 w-8 border border-red-500/50">
                    <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                    <AvatarFallback className="bg-zinc-800 text-zinc-300">
                      <UserIcon className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="border-t border-zinc-800 p-3">
        <form onSubmit={handleSendMessage} className="flex w-full gap-2">
          <Input
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading || !input.trim()} className="bg-red-600 hover:bg-red-700">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendHorizontal className="h-4 w-4" />}
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}

