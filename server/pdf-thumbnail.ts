import { createCanvas } from "canvas";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

(pdfjsLib as any).GlobalWorkerOptions.workerSrc = "";

export async function generateThumbnailFromPdf(
  pdfBuffer: Buffer,
  width: number = 300
): Promise<Buffer> {
  try {
    const pdfData = new Uint8Array(pdfBuffer);
    const loadingTask = pdfjsLib.getDocument({ data: pdfData });
    const pdfDocument = await loadingTask.promise;

    const page = await pdfDocument.getPage(1);
    const viewport = page.getViewport({ scale: 1.0 });

    const scale = width / viewport.width;
    const scaledViewport = page.getViewport({ scale });

    const canvas = createCanvas(scaledViewport.width, scaledViewport.height);
    const context = canvas.getContext("2d");

    context.fillStyle = "white";
    context.fillRect(0, 0, scaledViewport.width, scaledViewport.height);

    await page.render({
      canvasContext: context as any,
      viewport: scaledViewport,
      canvas: canvas as any,
    }).promise;

    return canvas.toBuffer("image/png");
  } catch (error) {
    console.error("Failed to generate PDF thumbnail:", error);
    throw error;
  }
}
