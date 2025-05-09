import { FileUpload } from "@/components/file-upload";

export default function OxxFileUpload() {
	return (
		<main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24">
			<div className="w-full max-w-md">
				<FileUpload
					maxFiles={5}
					maxSize={5}
					accept=".jpg,.jpeg,.png,.pdf,.docx"
					onFilesChange={(files) => console.log(files)}
				/>
			</div>
		</main>
	);
}
