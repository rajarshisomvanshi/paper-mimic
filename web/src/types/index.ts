export type ProgressStage = 'parsing' | 'extracting' | 'generating';
export type ProgressStatus = 'running' | 'complete' | 'failed';

export interface ProgressUpdate {
    type: 'progress';
    stage: ProgressStage;
    status: ProgressStatus;
    message: string;
    current?: number;
    total?: number;
}

export interface QuestionUpdate {
    type: 'question_update';
    question_id: string;
    status: 'generating' | 'completed' | 'failed';
    reference_number: string;
}

export interface GeneratedQuestion {
    question: string;
    type: string;
    options?: string[];
    answer?: string;
    explanation?: string;
    [key: string]: any;
}

export interface ResultUpdate {
    type: 'result';
    question_id: string;
    success: boolean;
    question: GeneratedQuestion;
    validation: any;
    reference_number?: string;
    reference_question?: string;
    current?: number;
    total?: number;
}

export interface SummaryUpdate {
    type: 'summary';
    total_reference: number;
    successful: number;
    failed: number;
    output_file: string;
}

export type WebSocketMessage =
    | ProgressUpdate
    | QuestionUpdate
    | ResultUpdate
    | SummaryUpdate
    | { type: 'log'; content: string }
    | { type: 'error'; content: string }
    | { type: 'complete' };

export interface UploadRequest {
    mode: 'upload';
    pdf_data: string;
    pdf_name: string;
    kb_name: string;
    max_questions: number;
}
