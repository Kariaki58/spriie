"use client"

import * as React from "react"
import { useDropzone } from "react-dropzone"
import { UploadCloud, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
// import { toast } from "@/components/ui/use-toast"

interface ImageUploadProps {
  value: string
  onChange: (value: string) => void
  maxFiles?: number
  accept?: Record<string, string[]>
  placeholder?: string
}

export function ImageUpload({
  value,
  onChange,
  maxFiles = 1,
  accept = { "image/*": [] },
  placeholder = "Drag & drop files here, or click to select",
}: ImageUploadProps) {
  const [preview, setPreview] = React.useState(value)
  const [isUploading, setIsUploading] = React.useState(false)
  const [previousCloudinaryUrl, setPreviousCloudinaryUrl] = React.useState("")

  const uploadToServer = async (file: File): Promise<string | null> => {
    const formData = new FormData()
    formData.append("files", file)

    try {
      setIsUploading(true)
      const response = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Upload failed")
      }

      const data = await response.json()
      
      return data.message[0]
    } catch (error) {
      console.error("Upload error:", error)
    //   toast({
    //     title: "Upload failed",
    //     description: "Could not upload image",
    //     variant: "destructive",
    //   })
      return null
    } finally {
      setIsUploading(false)
    }
  }

  const deleteFromServer = async (url: string): Promise<void> => {
    try {
      const response = await fetch("/api/delete-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      })

      if (!response.ok) {
        throw new Error("Deletion failed")
      }
    } catch (error) {
      console.error("Deletion error:", error)
    //   toast({
    //     title: "Cleanup failed",
    //     description: "Could not delete previous image",
    //     variant: "destructive",
    //   })
    }
  }

  const onDrop = React.useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles?.length) {
      const file = acceptedFiles[0]
      const previewUrl = URL.createObjectURL(file)
      setPreview(previewUrl)

      try {
        const uploadedUrl = await uploadToServer(file)

        console.log({ uploadedUrl })
        
        if (uploadedUrl) {
          // Delete previous image if it exists
          if (previousCloudinaryUrl) {
            await deleteFromServer(previousCloudinaryUrl)
          }
          
          setPreviousCloudinaryUrl(uploadedUrl)
          onChange(uploadedUrl)
        } else {
          // Revert to previous state if upload fails
          setPreview(value)
        }
      } finally {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [onChange, previousCloudinaryUrl, value])

  const removeImage = async () => {
    if (previousCloudinaryUrl) {
      await deleteFromServer(previousCloudinaryUrl)
    }
    setPreview("")
    onChange("")
    setPreviousCloudinaryUrl("")
  }

  React.useEffect(() => {
    return () => {
      if (preview && preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview)
      }
    }
  }, [preview])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles,
    disabled: isUploading,
  })

  return (
    <div className="space-y-2">
      {preview ? (
        <div className="relative group">
          <img
            src={preview}
            alt="Preview"
            className="rounded-md object-cover w-full h-48"
          />
          {isUploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
          )}
          <button
            type="button"
            onClick={removeImage}
            disabled={isUploading}
            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-70"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-md p-6 text-center cursor-pointer transition-colors ${
            isDragActive ? "border-primary bg-primary/10" : "border-muted-foreground/30"
          } ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <input {...getInputProps()} />
          {isUploading ? (
            <div className="flex flex-col items-center justify-center gap-2">
              <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Uploading...</p>
            </div>
          ) : (
            <>
              <UploadCloud className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">{placeholder}</p>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                className="mt-2"
                disabled={isUploading}
              >
                Select Files
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  )
}