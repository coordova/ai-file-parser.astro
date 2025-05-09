"use client";

import type * as React from "react";
import { useCallback, useState } from "react";
import { X, Upload, File, CheckCircle2 } from "lucide-react";

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

interface FileUploadProps {
	maxFiles?: number;
	maxSize?: number; // in MB
	accept?: string;
	onFilesChange?: (files: File[]) => void;
	className?: string;
}

export function OxxFileUpload({
	maxFiles = 5,
	maxSize = 5, // 5MB
	accept = "*",
	onFilesChange,
	className,
}: FileUploadProps) {
	const [files, setFiles] = useState<File[]>([]);
	const [isDragging, setIsDragging] = useState(false);
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

	const handleDragLeave = useCallback(
		(e: React.DragEvent<HTMLDivElement>) => {
			e.preventDefault();
			e.stopPropagation();
			setIsDragging(false);
		},
		[]
	);

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

	return (
		<Card className={cn("w-full", className)}>
			<CardHeader>
				<CardTitle>File Upload</CardTitle>
				<CardDescription>
					Drag and drop files or click to browse
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
							<span className="font-bold">Click to upload</span>{" "}
							or drag and drop
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
					<Button size="sm" className="gap-1">
						<CheckCircle2 className="w-4 h-4" />
						Upload {files.length}{" "}
						{files.length === 1 ? "file" : "files"}
					</Button>
				)}
			</CardFooter>
		</Card>
	);
}
