

export interface GeneratedImage {
    data: string; // base64 encoded string
    mimeType: string;
}

export interface HistoryItem {
    id: string;
    prompt: string;
    thumbnail: GeneratedImage;
}