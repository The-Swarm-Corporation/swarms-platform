"use client"

import { useState, useCallback } from "react"
import { Search, Plus, File, FileText, FileSpreadsheet, FileImage, FileIcon, FileJson, Upload } from "lucide-react"
import { Button } from "../ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../spread_sheet_swarm/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog"
import { Label } from "../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { ScrollArea } from "../ui/scroll-area"
import { useDropzone } from "react-dropzone"
import { createClient } from "@supabase/supabase-js"
import { useQuery, useMutation, useQueryClient } from "react-query"
import { useToast } from "../ui/Toasts/use-toast"
import { Input } from "../ui/Input"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

type Document = {
  id: string
  name: string
  type: string
  size: string
  uploadedBy: string
  uploadDate: string
  content: string
}

// Supabase functions
const fetchDocuments = async (): Promise<Document[]> => {
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .order("uploadDate", { ascending: false })

  if (error) throw error
  return data
}

const addDocumentToSupabase = async (document: Document): Promise<Document> => {
  const { data, error } = await supabase
    .from("documents")
    .insert(document)
    .single()

  if (error) throw error
  return data
}

// Local storage functions
const LOCAL_STORAGE_KEY = "documentHubCache"

const saveToLocalStorage = (documents: Document[]) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(documents))
}

const getFromLocalStorage = (): Document[] => {
  const cached = localStorage.getItem(LOCAL_STORAGE_KEY)
  return cached ? JSON.parse(cached) : []
}

export default function OptimizedDataHubGallery() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)

  const queryClient = useQueryClient()

  const { data: documents, isLoading, isError } = useQuery<Document[], Error>(
    "documents",
    fetchDocuments,
    {
      onSuccess: (data) => saveToLocalStorage(data),
      onError: () => {
        toast({
          title: "Error fetching documents",
          description: "Using cached data. Please check your connection and try again.",
          variant: "destructive",
        })
        queryClient.setQueryData("documents", getFromLocalStorage())
      },
    }
  )

  const addDocumentMutation = useMutation(addDocumentToSupabase, {
    onSuccess: () => {
      queryClient.invalidateQueries("documents")
      toast({
        title: "Document added successfully",
        description: "Your document has been added to the data hub.",
      })
    },
    onError: () => {
      toast({
        title: "Error adding document",
        description: "There was a problem adding your document. Please try again.",
        variant: "destructive",
      })
    },
  })

  const filteredDocuments = documents?.filter((doc) =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader()

      reader.onabort = () => console.log('file reading was aborted')
      reader.onerror = () => console.log('file reading has failed')
      reader.onload = () => {
        const binaryStr = reader.result
        const newDocument: Document = {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          type: file.type.split('/')[1] || 'unknown',
          size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
          uploadedBy: "Current User",
          uploadDate: new Date().toISOString(),
          content: binaryStr as string,
        }
        addDocumentMutation.mutate(newDocument)
      }
      reader.readAsDataURL(file)
    })
  }, [addDocumentMutation])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  const getIconForDocumentType = (type: string) => {
    switch (type) {
      case "txt":
        return <FileText className="h-6 w-6" />
      case "csv":
        return <FileSpreadsheet className="h-6 w-6" />
      case "pdf":
        return <FileIcon className="h-6 w-6" />
      case "image":
        return <FileImage className="h-6 w-6" />
      case "json":
        return <FileJson className="h-6 w-6" />
      default:
        return <File className="h-6 w-6" />
    }
  }

  if (isLoading) return <div>Loading...</div>
  if (isError) return <div>Error loading documents. Please try again.</div>

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Enterprise Data Hub</h1>
        <AddDocumentDialog onAddDocument={(doc) => addDocumentMutation.mutate(doc)} />
      </div>
      <div className="relative">
        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <Input
          type="search"
          placeholder="Search documents..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-10 text-center transition-colors ${
          isDragActive ? "border-primary bg-primary/10" : "border-gray-300"
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">Drag 'n' drop some files here, or click to select files</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredDocuments.map((doc) => (
          <Card key={doc.id} className="flex flex-col cursor-pointer hover:shadow-lg transition-shadow duration-200" onClick={() => setSelectedDocument(doc)}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getIconForDocumentType(doc.type)}
                {doc.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">Type: {doc.type}</p>
              <p className="text-sm text-gray-500">Size: {doc.size}</p>
              <p className="text-sm text-gray-500">Uploaded by: {doc.uploadedBy}</p>
            </CardContent>
            <CardFooter className="text-sm text-gray-400 mt-auto">
              Uploaded on {new Date(doc.uploadDate).toLocaleDateString()}
            </CardFooter>
          </Card>
        ))}
      </div>
      {selectedDocument && (
        <DocumentDetailsModal
          document={selectedDocument}
          onClose={() => setSelectedDocument(null)}
        />
      )}
    </div>
  )
}

function DocumentDetailsModal({ document, onClose }: { document: Document; onClose: () => void }) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>{document.name}</DialogTitle>
          <DialogDescription>
            Type: {document.type.toUpperCase()} | Size: {document.size} | Uploaded by: {document.uploadedBy} on {new Date(document.uploadDate).toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Preview:</h3>
          <ScrollArea className="h-[300px] w-full rounded-md border p-4">
            <DocumentPreview document={document} />
          </ScrollArea>
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function DocumentPreview({ document }: { document: Document }) {
  switch (document.type) {
    case "csv":
      return (
        <table className="w-full border-collapse">
          <tbody>
            {document.content.split("\n").map((row, i) => (
              <tr key={i}>
                {row.split(",").map((cell, j) => (
                  <td key={j} className="border px-2 py-1">{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )
    case "txt":
      return <pre className="whitespace-pre-wrap">{document.content}</pre>
    case "pdf":
      return (
        <div className="text-center">
          <p>PDF preview not available.</p>
          <Button className="mt-2">Download PDF</Button>
        </div>
      )
    case "image":
      return <img src={document.content} alt={document.name} className="max-w-full h-auto" />
    default:
      return <p>Preview not available for this file type.</p>
  }
}

function AddDocumentDialog({ onAddDocument }: { onAddDocument: (doc: Document) => void }) {
  const [name, setName] = useState("")
  const [type, setType] = useState("")
  const [size, setSize] = useState("")
  const [content, setContent] = useState("")

  const handleSubmit = () => {
    const newDocument: Document = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      type,
      size,
      uploadedBy: "Current User",
      uploadDate: new Date().toISOString(),
      content,
    }
    onAddDocument(newDocument)
    setName("")
    setType("")
    setSize("")
    setContent("")
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add Document
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Document</DialogTitle>
          <DialogDescription>
            Enter the details of the new document you want to add to the data hub.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              Type
            </Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="txt">Text</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="image">Image</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="size" className="text-right">
              Size
            </Label>
            <Input
              id="size"
              value={size}
              onChange={(e) => setSize(e.target.value)}
              className="col-span-3"
              placeholder="e.g., 2.3 MB"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="content" className="text-right">
              Content
            </Label>
            <Input
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="col-span-3"
              placeholder="Enter content or file path"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit}>
            Add Document
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}