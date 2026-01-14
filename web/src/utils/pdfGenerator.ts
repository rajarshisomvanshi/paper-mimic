import jsPDF from 'jspdf';
import { ResultUpdate } from '@/types';

// --- Constants & Config ---
const PAGE_FORMAT = 'a4';
const ORIENTATION = 'portrait';
const UNIT = 'mm';

// Dimensions (A4: 210 x 297 mm)
const PAGE_HEIGHT = 297;
const PAGE_WIDTH = 210;

// Region Heights
const HEADER_HEIGHT = 15; // 1.5 cm
const FOOTER_HEIGHT = 18; // 1.8 cm

// Body System Margins
const MARGIN_LEFT = 20;
const MARGIN_RIGHT = 20;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;

// Vertical Flow Constraints
const BODY_TOP_MARGIN = 10;
const BODY_BOTTOM_MARGIN = 10;

const BODY_START_Y = HEADER_HEIGHT + BODY_TOP_MARGIN; // 25mm
const BODY_END_Y = PAGE_HEIGHT - FOOTER_HEIGHT - BODY_BOTTOM_MARGIN; // 269mm
const SAFE_BODY_HEIGHT = BODY_END_Y - BODY_START_Y;

// Fonts
const FONT_MAIN = 'times';
const FONT_BOLD = 'bold';
const FONT_NORMAL = 'normal';
const FONT_ITALIC = 'italic';

// Font Sizes (pt)
const SIZE_HEADING = 12;
const SIZE_BODY = 11;
const SIZE_FOOTER = 9;
const SIZE_CODE = 10;

// Conversions & Spacing
const PT_TO_MM = 0.352778;
const LINE_SPACING = 1.3;

// Helper: Convert pt to mm
const pt2mm = (pt: number) => pt * PT_TO_MM;

type TextToken = {
    text: string;
    fontStyle: 'normal' | 'bold' | 'italic' | 'bolditalic';
};

export const generateExamPDF = (results: ResultUpdate[]) => {
    const doc = new jsPDF({
        orientation: ORIENTATION,
        unit: UNIT,
        format: PAGE_FORMAT
    });

    let cursorY = BODY_START_Y;
    let pageNumber = 1;

    // --- Core Render Helpers ---

    const renderHeaderFooter = (pageIndex: number, totalPages: number) => {
        doc.setPage(pageIndex);
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;

        // --- Footer Region ---
        const footerCenterY = pageHeight - (FOOTER_HEIGHT / 2);

        doc.setFont(FONT_MAIN, FONT_NORMAL);
        doc.setFontSize(SIZE_FOOTER);
        doc.setTextColor(102, 102, 102);

        // Left: Generated on {{date}}
        const dateStr = `Generated on ${new Date().toLocaleDateString()}`;
        doc.text(dateStr, MARGIN_LEFT, footerCenterY);

        // Right: Page X of Y
        const pageStr = `Page ${pageIndex} of ${totalPages}`;
        doc.text(pageStr, pageWidth - MARGIN_RIGHT, footerCenterY, { align: 'right' });
    };

    const addNewPage = () => {
        doc.addPage();
        pageNumber++;
        cursorY = BODY_START_Y;
    };

    // --- Markdown / Text Processing ---

    /**
     * Parse text for simple markdown bold (**text**)
     */
    const parseMarkdown = (text: string): TextToken[] => {
        const parts: TextToken[] = [];
        const regex = /\*\*(.*?)\*\*/g;
        let lastIndex = 0;
        let match;

        while ((match = regex.exec(text)) !== null) {
            if (match.index > lastIndex) {
                parts.push({ text: text.slice(lastIndex, match.index), fontStyle: 'normal' });
            }
            parts.push({ text: match[1], fontStyle: 'bold' });
            lastIndex = regex.lastIndex;
        }

        if (lastIndex < text.length) {
            parts.push({ text: text.slice(lastIndex), fontStyle: 'normal' });
        }

        return parts;
    };

    /**
     * Sanitizes text to prevent accidental mid-sentence breaks.
     * Replaces single newlines with spaces, keeps double newlines as paragraph breaks.
     */
    const sanitizeText = (text: string): string => {
        if (!text) return "";
        // 1. Unify newlines
        let clean = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
        // 2. Remove multiple spaces
        clean = clean.replace(/ +/g, ' ');
        // 3. Keep double newlines (paragraphs), replace single newlines with space
        // logic: split by \n\n, then join internal \n with space
        return clean.split('\n\n').map(p => p.replace(/\n/g, ' ')).join('\n\n');
    };

    /**
     * Measures height of a multi-styled text block.
     * Simplified: assumes bold and normal same width for Times New Roman (approx).
     */
    const measureRichTextHeight = (tokens: TextToken[], fontSize: number, width: number) => {
        doc.setFontSize(fontSize);
        doc.setFont(FONT_MAIN, FONT_NORMAL);

        // Reconstruct full string for wrapping calculation 
        // (jsPDF splitTextToSize handles plain text, not mixed styles perfect without extensive logic.
        // For approximation, we use the full plain text. 
        // Ideally we would measure token by token, but that's complex. 
        // Given Times font, Bold is slightly wider, but we have margins.)

        const fullText = tokens.map(t => t.text).join("");
        const lines = doc.splitTextToSize(fullText, width);
        return lines.length * (fontSize * PT_TO_MM * LINE_SPACING);
    };

    /**
     * Renders multi-styled text. 
     * Complex: Needs to track X position for inline styles.
     * Fallback for MVP: Render plain text but switch font if entire block is bold? 
     * Promoting "Sentence Integrity" > "Rich Text" for now, but enabled bold support.
     */
    const renderRichText = (tokens: TextToken[], x: number, y: number, fontSize: number, width: number, align: 'left' | 'justify' = 'justify') => {
        doc.setFontSize(fontSize);
        doc.setTextColor(0, 0, 0);

        // Advanced: Tokenize and wrap
        // To ensure "Sentence Integrity", we rely on jsPDF's splitTextToSize on the FULL plain text
        // to determine line breaks. Then we render word-by-word matching the lines.
        // This is very heavy.

        // MVP Approach: Just render plain text for body to ensure alignment.
        // Bold support only for headers or specific short segments.
        // OR: Use HTML rendering? No, inconsistent.

        // Let's stick to: If any token is bold, try to respect it, but if it causes layout issues, fallback to plain.
        // actually, most exam text is plain. Bold is usually entire label "Part A".

        // Let's just render sanitized plain text for the body to ensure clean justification.
        // The prompt says "Verbs and objects remain in same logical block".
        // Justification does this well.

        const fullText = tokens.map(t => t.text).join("");
        doc.setFont(FONT_MAIN, FONT_NORMAL);

        if (tokens.some(t => t.fontStyle === 'bold')) {
            // If mixed content, we can't easily justify AND bold inline without custom engine.
            // We will render as plain text for stability unless the *whole* string is bold.
            if (tokens.length === 1 && tokens[0].fontStyle === 'bold') {
                doc.setFont(FONT_MAIN, FONT_BOLD);
            }
        }

        const lines = doc.splitTextToSize(fullText, width);
        const lineHeight = fontSize * PT_TO_MM * LINE_SPACING;

        doc.text(lines, x, y, { align, maxWidth: width });

        return lines.length * lineHeight;
    };


    // --- Block Renderer ---

    const processQuestionBlock = (item: ResultUpdate, index: number) => {
        const qNum = `Q${index + 1}.`;
        // Sanitize Question Text
        const qText = sanitizeText(item.question.question);
        const options = item.question.options || [];

        // 1. Measure Block
        const hGapBefore = pt2mm(12);

        const qNumHeight = measureRichTextHeight([{ text: qNum, fontStyle: 'bold' }], SIZE_HEADING, CONTENT_WIDTH);
        const qNumGap = pt2mm(4);

        const qTextTokens = parseMarkdown(qText);
        const qTextHeight = measureRichTextHeight(qTextTokens, SIZE_BODY, CONTENT_WIDTH);
        const qTextGap = pt2mm(8);

        // Options
        const optIndent = 12; // mm
        let optionsTotalHeight = 0;
        const processedOptions = options.map((opt, i) => {
            const label = `(${String.fromCharCode(65 + i)})`; // (A)
            const optText = sanitizeText(opt);
            const optWidth = CONTENT_WIDTH - optIndent;

            // Measure
            doc.setFontSize(SIZE_BODY);
            doc.setFont(FONT_MAIN, FONT_NORMAL);
            const lines = doc.splitTextToSize(optText, optWidth);
            const h = lines.length * (SIZE_BODY * PT_TO_MM * LINE_SPACING);

            return { label, text: optText, lines, h };
        });

        if (processedOptions.length > 0) {
            optionsTotalHeight = processedOptions.reduce((sum, opt) => sum + opt.h + 2, 0); // +2mm padding
        }

        const totalBlockHeight = hGapBefore + qNumHeight + qNumGap + qTextHeight + qTextGap + optionsTotalHeight;

        // 2. Page Break Check
        if (cursorY + totalBlockHeight > BODY_END_Y) {
            addNewPage();
        } else {
            // Only add gap if not fresh page
            if (cursorY > BODY_START_Y) {
                cursorY += hGapBefore;
            }
        }

        // 3. Render
        // Q Number (Header)
        doc.setFont(FONT_MAIN, FONT_BOLD);
        doc.setFontSize(SIZE_HEADING);
        doc.text(qNum, MARGIN_LEFT, cursorY);
        cursorY += qNumHeight + qNumGap;

        // Q Text
        // Check for "Table-like" content (simple heuristic: contains pipes |)
        if (qText.includes('|') && qText.includes('\n')) {
            // Render as monospace block for now to preserve structure
            doc.setFont('courier', 'normal');
            doc.setFontSize(SIZE_CODE);
            const lines = doc.splitTextToSize(qText, CONTENT_WIDTH);
            doc.text(lines, MARGIN_LEFT, cursorY);
            cursorY += lines.length * (SIZE_CODE * PT_TO_MM * LINE_SPACING);
            // Revert font
            doc.setFont(FONT_MAIN, FONT_NORMAL);
        } else {
            // Normal Text
            const h = renderRichText(qTextTokens, MARGIN_LEFT, cursorY, SIZE_BODY, CONTENT_WIDTH, 'justify');
            cursorY += h;
        }

        cursorY += qTextGap;

        // Options
        processedOptions.forEach(opt => {
            // Draw Label
            doc.setFont(FONT_MAIN, FONT_BOLD);
            doc.setFontSize(SIZE_BODY);
            doc.text(opt.label, MARGIN_LEFT, cursorY);

            // Draw Text (Hanging Indent)
            doc.setFont(FONT_MAIN, FONT_NORMAL);
            doc.text(opt.lines, MARGIN_LEFT + optIndent, cursorY);

            cursorY += opt.h + 2;
        });
    };

    // --- Main Loop ---

    results.forEach((result, index) => {
        processQuestionBlock(result, index);
    });

    // --- Post-Processing: Header/Footer ---
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        renderHeaderFooter(i, totalPages);
    }

    // Save
    doc.save(`exam-paper-v2-${new Date().toISOString().slice(0, 10)}.pdf`);
};
