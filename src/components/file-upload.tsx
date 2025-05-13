"use client";

import type * as React from "react";
import { useCallback, useState } from "react";
import { X, Upload, File, CheckCircle2, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "./ui/textarea";
import { getAiResult } from "server/ai"; // importamos la funcion de ai

// importamos react-markdown para convertir a markdown (https://github.com/remarkjs/react-markdown)
import ReactMarkdown from "react-markdown";

interface FileUploadProps {
  maxFiles?: number;
  maxSize?: number; // in MB
  accept?: string;
  onFilesChange?: (files: File[]) => void;
  className?: string;
}

export function FileUpload({
  maxFiles = 5,
  maxSize = 5, // 5MB
  accept = "*",
  onFilesChange,
  className,
}: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  // State to manage drag and drop
  const [promt, setPromt] = useState<string | null>(null);
  // State to store AI result
  const [aiResult, setAiResult] = useState<string | null>(null);
  // State to manage loading state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // State to manage drag and drop
  const [isDragging, setIsDragging] = useState<boolean>(false);
  // State to store error message
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = useCallback(
    (selectedFiles: FileList | null) => {
      if (!selectedFiles) return;

      setError(null);

      const newFiles = Array.from(selectedFiles);

      // Check file size
      const oversizedFiles = newFiles.filter(
        (file) => file.size > maxSize * 1024 * 1024
      );
      if (oversizedFiles.length > 0) {
        setError(`Some files exceed the ${maxSize}MB limit`);
        return;
      }

      // Check max files
      if (files.length + newFiles.length > maxFiles) {
        setError(`You can only upload up to ${maxFiles} files`);
        return;
      }

      const updatedFiles = [...files, ...newFiles];
      setFiles(updatedFiles);
      onFilesChange?.(updatedFiles);
    },
    [files, maxFiles, maxSize, onFilesChange]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const droppedFiles = e.dataTransfer.files;
      handleFileChange(droppedFiles);
    },
    [handleFileChange]
  );

  const removeFile = useCallback(
    (index: number) => {
      const newFiles = [...files];
      newFiles.splice(index, 1);
      setFiles(newFiles);
      onFilesChange?.(newFiles);
    },
    [files, onFilesChange]
  );

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " bytes";
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  // using marked - cdn de marked github: https://github.com/markedjs/marked
  // <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>;

  // Handle file input change
  const onSubmit = async () => {
    if (promt === null || promt === "") {
      setError("Prompt is required");
      return;
    }

    if (files.length === 0) {
      setError("At least one file is required");
      return;
    }

    // TODO - Handle the file upload and prompt submission logic
    let rs = `# Hola Mundo!\nEste es un ejemplo de Markdown.\n\n* Esto es una lista.\n* Otro elemento.`;

    if (promt !== null && promt !== "" && files.length > 0) {
      setIsLoading(true);
      try {
        const result = marked.parse(rs); // await getAiResult(promt, files[0]);
        setAiResult(result);
      } catch (error) {
        console.error("Error getting AI result:", error);
      }
      setIsLoading(false);

      console.log("Prompt:", promt);
      console.log("Files:", files);
    } else {
      console.error("Prompt is empty or files is empty");
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Mostrar el resultado si hay un resultado */}
      {aiResult && (
        <div className="flex flex-col items-center gap-5">
          <div
            id="ai-result"
            className="text-sm text-muted-foreground max-w-[500px]"
          >
            {/* <ReactMarkdown>{aiResult}</ReactMarkdown> */}
            <div dangerouslySetInnerHTML={{ __html: aiResult }} />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAiResult(null)}
            >
              Clear
            </Button>
          </div>
        </div>
      )}
      {/* Mostrar el textarea, la Card y el boton si no hay un resultado */}
      {!aiResult && (
        <>
          {/* Text area */}
          <Textarea
            rows={10}
            value={promt || ""}
            onChange={(e) => setPromt(e.target.value)}
          />

          <Card className={cn("w-full", className)}>
            <CardHeader>
              <CardTitle>File Upload</CardTitle>
              <CardDescription>
                Drag and drop files or{" "}
                <span className="text-red-500">click</span> to browse
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={cn(
                  "relative flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-lg transition-colors",
                  isDragging
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/25 hover:border-primary/50",
                  files.length > 0 && "pb-2"
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  id="fileUpload"
                  multiple
                  accept={accept}
                  onChange={(e) => handleFileChange(e.target.files)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  aria-label="File upload"
                />

                <div className="flex flex-col items-center justify-center text-center">
                  <Upload className="w-10 h-10 mb-3 text-muted-foreground" />
                  <p className="mb-2 text-sm font-semibold">
                    <span className="font-bold">Click to upload</span> or drag
                    and drop
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {accept === "*"
                      ? "Any file format"
                      : accept.replace(/,/g, ", ")}{" "}
                    (Max: {maxSize}MB)
                  </p>
                  {error && (
                    <p className="mt-2 text-sm font-medium text-destructive">
                      {error}
                    </p>
                  )}
                </div>
              </div>

              {files.length > 0 && (
                <div className="mt-4 space-y-2">
                  {files.map((file, index) => (
                    <div
                      key={`${file.name}-${index}`}
                      className="flex items-center justify-between p-2 bg-muted/50 rounded-md"
                    >
                      <div className="flex items-center space-x-2 overflow-hidden">
                        <File className="flex-shrink-0 w-4 h-4 text-primary" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFile(index)}
                        className="flex-shrink-0"
                        aria-label={`Remove ${file.name}`}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <p className="text-xs text-muted-foreground">
                {files.length} of {maxFiles} files
              </p>
              {files.length > 0 && (
                <Button
                  size="sm"
                  className="gap-1"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Upload {files.length} {files.length === 1 ? "file" : "files"}
                </Button>
              )}
            </CardFooter>
          </Card>
          <Button
            onClick={onSubmit}
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="size-4 animate-spin" /> : "Submit"}
          </Button>
        </>
      )}
    </div>
  );
}
