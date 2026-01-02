'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { getArtifactPreviewType } from '@/utils/artifacts'
import { Play, Download, RefreshCw, FileText, Video, Music, Image as ImageIcon, AlertCircle } from 'lucide-react'
import type { Artifact } from '@/utils/artifacts'

interface ArtifactItemProps {
    artifact: Artifact
    initialSignedUrl?: string | null
}

export default function ArtifactItem({ artifact, initialSignedUrl }: ArtifactItemProps) {
    const [signedUrl, setSignedUrl] = useState<string | null>(initialSignedUrl || null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const previewType = getArtifactPreviewType({ mime_type: artifact.mime_type, storage_path: artifact.storage_path })
    const supabase = createClient()

    useEffect(() => {
        // If we don't have an initial URL, or if we want to ensure freshness on mount (though prompt said cache in state),
        // we can fetch one. Current logic: if provided initially, use it. If not, fetch.
        if (!signedUrl) {
            refreshUrl()
        }
    }, [])

    const refreshUrl = async () => {
        setIsLoading(true)
        setError(null)
        try {
            const { data, error } = await supabase.storage
                .from('meeting-media')
                .createSignedUrl(artifact.storage_path, 60 * 10) // 10 minutes

            if (error) throw error
            if (data?.signedUrl) {
                setSignedUrl(data.signedUrl)
            } else {
                throw new Error('No signed URL returned')
            }
        } catch (err: any) {
            console.error('Error refreshing URL:', err)
            setError(err.message || 'Failed to refresh URL')
        } finally {
            setIsLoading(false)
        }
    }

    const renderPreview = () => {
        if (!signedUrl) return null

        switch (previewType) {
            case 'video':
                return (
                    <video controls className="w-full max-h-[300px] rounded bg-black/50 mt-2">
                        <source src={signedUrl} type={artifact.mime_type || 'video/webm'} />
                        Your browser does not support the video tag.
                    </video>
                )
            case 'audio':
                return (
                    <audio controls className="w-full mt-2">
                        <source src={signedUrl} type={artifact.mime_type || 'audio/mpeg'} />
                        Your browser does not support the audio tag.
                    </audio>
                )
            case 'image':
                return (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={signedUrl}
                        alt="Artifact preview"
                        className="max-h-[300px] rounded object-contain bg-black/20 mt-2 border border-white/5"
                    />
                )
            default:
                return (
                    <div className="mt-2 p-4 bg-black/20 rounded text-sm text-muted">
                        No preview available.
                    </div>
                )
        }
    }

    const renderIcon = () => {
        switch (artifact.kind) {
            case 'video': return <Video size={18} className="text-blue-400" />
            case 'audio': return <Music size={18} className="text-pink-400" />
            case 'image': return <ImageIcon size={18} className="text-green-400" />
            default: return <FileText size={18} className="text-gray-400" />
        }
    }

    const fileName = artifact.storage_path.split('/').pop() || 'file'

    return (
        <li className="flex flex-col p-4 border border-zinc-800 rounded bg-black/20 hover:bg-black/30 transition-colors gap-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 overflow-hidden">
                    {renderIcon()}
                    <div className="flex flex-col overflow-hidden">
                        <span className="truncate max-w-[200px] md:max-w-md text-sm font-medium" title={fileName}>
                            {fileName}
                        </span>
                        <span className="text-xs text-muted">
                            {(artifact.bytes / 1024 / 1024).toFixed(2)} MB • {new Date(artifact.created_at).toLocaleString()}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={refreshUrl}
                        disabled={isLoading}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors text-zinc-400 hover:text-white"
                        title="Refresh Link"
                    >
                        <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                    </button>

                    {signedUrl ? (
                        <a
                            href={signedUrl}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 hover:bg-white/10 rounded-full transition-colors text-blue-400"
                            title="Download"
                        >
                            <Download size={16} />
                        </a>
                    ) : (
                        <button disabled className="p-2 text-zinc-600 cursor-not-allowed">
                            <Download size={16} />
                        </button>
                    )}
                </div>
            </div>

            {error && (
                <div className="text-xs text-red-400 flex items-center gap-1">
                    <AlertCircle size={12} />
                    {error}
                </div>
            )}

            {signedUrl ? renderPreview() : (
                !isLoading && !error && <div className="text-xs text-zinc-500">Loading preview...</div>
            )}
        </li>
    )
}
