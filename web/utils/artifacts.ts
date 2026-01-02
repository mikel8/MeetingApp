
export type Artifact = {
    id: string
    meeting_id: string
    owner_id: string
    kind: string
    storage_bucket: string
    storage_path: string
    mime_type: string
    bytes: number
    created_at: string
    signedUrl?: string | null
}

export function generateArtifactId(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID()
    }
    // Fallback for environments without crypto.randomUUID
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export function inferExtension(fileName: string, mimeType: string): string {
    if (fileName.includes('.')) {
        return fileName.split('.').pop() || 'dat'
    }
    // Basic mime inference if extension missing
    if (mimeType.includes('video')) return 'webm'
    if (mimeType.includes('audio')) return 'mp3'
    if (mimeType.includes('image')) return 'png'
    return 'dat'
}

export function buildStoragePath(userId: string, meetingId: string, artifactId: string, extension: string): string {
    return `${userId}/${meetingId}/${artifactId}.${extension}`
}

export function deriveKind(mimeType: string): 'video' | 'audio' | 'image' | 'file' {
    if (mimeType.startsWith('video/')) return 'video'
    if (mimeType.startsWith('audio/')) return 'audio'
    if (mimeType.startsWith('image/')) return 'image'
    return 'file'
}

export function getArtifactPreviewType({ mime_type, storage_path }: { mime_type: string, storage_path: string }): 'video' | 'audio' | 'image' | 'none' {
    // Prefer mime_type if valid
    if (mime_type) {
        if (mime_type.startsWith('video/') || mime_type === 'video/webm' || mime_type === 'video/mp4') return 'video'
        if (mime_type.startsWith('audio/') || mime_type === 'audio/mpeg' || mime_type === 'audio/wav' || mime_type === 'audio/mp4') return 'audio'
        if (mime_type.startsWith('image/') || mime_type === 'image/png' || mime_type === 'image/jpeg' || mime_type === 'image/gif' || mime_type === 'image/webp') return 'image'
    }

    // Fallback to extension
    const ext = storage_path.split('.').pop()?.toLowerCase() || ''
    if (['webm', 'mp4', 'mov', 'mkv'].includes(ext)) return 'video'
    if (['mp3', 'wav', 'm4a', 'aac', 'ogg'].includes(ext)) return 'audio'
    if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)) return 'image'

    return 'none'
}
