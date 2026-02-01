import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Download file
 */
export async function downloadFile(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to download file: ${response.statusText}`);

    const fileName = `resume_${Date.now()}.pdf`;
    const filePath = path.join(__dirname, "../../uploads/temp", fileName);

    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const buffer = Buffer.from(await response.arrayBuffer());
    fs.writeFileSync(filePath, buffer);

    return { filePath, fileName };
}

/**
 * Extract PDF text (text-based only)
 */
export async function extractTextFromPDF(filePath) {
    try {
        const { PDFExtract } = await import("pdf.js-extract");
        const extractor = new PDFExtract();

        const result = await extractor.extract(filePath, {});
        let text = "";

        result.pages.forEach(page =>
            page.content.forEach(item => {
                if (item.str) text += item.str + " ";
            })
        );

        return text.trim() || "No text detected (PDF may be scanned image)";
    } catch (err) {
        console.error("PDF extraction error:", err);
        return "Unable to extract text from PDF.";
    }
}

/**
 * Extract DOCX text
 */
export async function extractTextFromDocx(filePath) {
    try {
        const mammoth = await import("mammoth");
        const result = await mammoth.extractRawText({ path: filePath });
        return result.value || "";
    } catch (err) {
        console.error("DOCX extraction error:", err);
        return "";
    }
}

/**
 * Detect file type and extract
 */
export async function extractTextFromDocument(filePath) {
    const ext = path.extname(filePath).toLowerCase();

    if (ext === ".pdf") return extractTextFromPDF(filePath);
    if (ext === ".docx") return extractTextFromDocx(filePath);

    return "Unsupported document type.";
}

/**
 * Cleanup temp file
 */
export function cleanupTempFile(filePath) {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
}

/**
 * Download → Extract → Cleanup
 */
export async function extractResumeTextFromURL(url) {
    let tempPath = null;

    try {
        const { filePath } = await downloadFile(url);
        tempPath = filePath;

        const text = await extractTextFromDocument(filePath);
        return text;
    } catch (err) {
        console.error("Extraction error:", err);
        return "Could not extract resume text.";
    } finally {
        if (tempPath) cleanupTempFile(tempPath);
    }
}
