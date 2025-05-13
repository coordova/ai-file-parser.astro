"use server";
// import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { createGoogleGenerativeAI } from '@ai-sdk/google';

const googleGenerativeAI = createGoogleGenerativeAI({
	apiKey: import.meta.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

// Función para convertir ArrayBuffer a base64 sin Buffer
const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
	const bytes = new Uint8Array(buffer);
	let binary = "";
	for (const byte of bytes) {
	  binary += String.fromCharCode(byte);
	}
	return btoa(binary);
};

// creamos una funcion de sincronizacion para leer el archivo
export const getAiResult = async (prompt: string, file: File) => {
	// leemos el archivo
	/* const arrayBuffer = await file.arrayBuffer();
	const base64string = Buffer.from(arrayBuffer).toString("base64"); */
	// console.log(base64string);

	const arrayBuffer = await file.arrayBuffer();
	const base64string = arrayBufferToBase64(arrayBuffer); // Usamos la nueva función

	const result = await generateText({
		model: googleGenerativeAI("gemini-1.5-flash"),
		messages: [
			{
				role: "user",
				content: [
					{
						type: "text",
						text: prompt,
					},
					{
						type: "file",
						data: base64string,
						mimeType: file.type,
					},
				],
			},
		],
	});

	// console.log(result);
	return result.steps[0].text;
};
