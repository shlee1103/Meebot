import apiClient from "./apiClient"

export interface StartPresentationRequest {
    presentation_teams_num: number;
    presentation_time: number;
    question_time: number;
}

export interface StartPresentationResponse {
    message: string;
}

export interface NextPresentationRequest {
    presenter: {
        presentation_order: number;
        presenter: string;
    };
}

export interface NextPresentationResponse {
    message: string;
}

export interface InterimSummarizeRequest {
    presenter: string;
    presentation_order: number;
    roomCode: string;
    startTime: string;
    endTime: string;
    transcripts: string;
}

export interface InterimSummarizeResponse {
    summation: {
        text: string;   
        question: string;
        presenter: string;
    };
}

// 발표회 시작 API 호출 함수
export const startPresentation = async (
    request: StartPresentationRequest
): Promise<StartPresentationResponse> => {
    const response = await apiClient.post<StartPresentationResponse>(
        '/api/chatgpt/start-presentation',
        request,
        {
            headers: {
                'Content-Type': 'application/json',
            },
        }
    );
    return response.data;
};

// 발표 시작 API 호출 함수 추가
export const nextPresentation = async (
    request: NextPresentationRequest
): Promise<NextPresentationResponse> => {
    const response = await apiClient.post<NextPresentationResponse>(
        '/api/chatgpt/next-presentation',
        request,
        {
            headers: {
                'Content-Type': 'application/json',
            },
        }
    );
    return response.data;
};

// 중간 요약 API 호출 함수
export const interimSummarize = async (
    request: InterimSummarizeRequest
): Promise<InterimSummarizeResponse> => {
    const response = await apiClient.post<InterimSummarizeResponse>(
        '/api/chatgpt/interim-summarize',
        request,
        {
            headers: {
                'Content-Type': 'application/json',
            },
        }
    );
    return response.data;
};