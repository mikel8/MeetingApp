'use client'

import { useState, useRef, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { generateArtifactId, inferExtension, buildStoragePath, deriveKind } from '@/utils/artifacts'
import type { Artifact } from '@/utils/artifacts'
import { Upload, Loader2, XCircle } from 'lucide-react'
import ArtifactItem from './ArtifactItem'

interface MeetingArtifactsProps {
    meetingId: string
    userId: string
    initialArtifacts: Artifact[]
}

export default function MeetingArtifacts({ meetingId, userId, initialArtifacts }: MeetingArtifactsProps) {
    const [artifacts, setArtifacts] = useState<Artifact[]>(initialArtifacts)
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [file, setFile] = useState<File | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const supabase = createClient()

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0])
            setError(null)
        }
    }

    const handleUpload = async () => {
        if (!file) return
        setUploading(true)
        setError(null)

        try {
            const artifactId = generateArtifactId()
            const extension = inferExtension(file.name, file.type)
            const path = buildStoragePath(userId, meetingId, artifactId, extension)

            // 1. Upload file to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('meeting-media')
                .upload(path, file)

            if (uploadError) throw uploadError

            const kind = deriveKind(file.type)

            // 2. Insert record into DB
            const { data: insertedData, error: insertError } = await supabase
                .from('meeting_artifacts')
                .insert({
                    id: artifactId,
                    meeting_id: meetingId,
                    owner_id: userId,
                    kind: kind,
                    storage_bucket: 'meeting-media',
                    storage_path: path,
                    mime_type: file.type,
                    bytes: file.size,
                })
                .select()
                .single()

            if (insertError) throw insertError

            // 3. Generate signed URL for immediate use
            const { data: signedData, error: signedError } = await supabase.storage
                .from('meeting-media')
                .createSignedUrl(path, 60 * 10) // 10 minutes

            if (signedError) console.error('Error generating signed URL:', signedError)

            const newArtifact: Artifact = {
                ...insertedData,
                signedUrl: signedData?.signedUrl
            }

            // 4. Update UI
            setArtifacts((prev) => [newArtifact, ...prev])
            setFile(null)
            if (fileInputRef.current) fileInputRef.current.value = ''

            // Refresh server cache
            startTransition(() => {
                router.refresh()
            })

        } catch (err: any) {
            console.error('Upload failed:', err)
            setError(err.message || 'Upload failed')
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="card glass">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg">Artifacts ({artifacts.length})</h2>
            </div>

            {/* Upload Section */}
            <div className="mb-6 p-4 rounded bg-white/5 border border-white/10">
                <label className="block text-sm font-medium text-muted mb-2">Upload Media</label>
                <div className="flex gap-2 items-center">
                    <input
                        ref={fileInputRef}
                        type="file"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-slate-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-violet-50 file:text-violet-700
                hover:file:bg-violet-100
                cursor-pointer"
                        disabled={uploading}
                    />
                    {file && (
                        <button
                            onClick={handleUpload}
                            disabled={uploading}
                            className="btn bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded flex items-center gap-2 whitespace-nowrap"
                        >
                            {uploading ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
                            {uploading ? 'Uploading...' : 'Upload'}
                        </button>
                    )}
                </div>
                {error && (
                    <div className="mt-2 text-red-400 text-sm flex items-center gap-1">
                        <XCircle size={14} />
                        {error}
                    </div>
                )}
            </div>

            {/* List Section */}
            {artifacts.length > 0 ? (
                <ul className="flex flex-col gap-2">
                    {artifacts.map((art) => (
                        <ArtifactItem key={art.id} artifact={art} initialSignedUrl={art.signedUrl} />
                    ))}
                </ul>
            ) : (
                <div className="text-center py-8 text-muted text-sm border-2 border-dashed border-zinc-800 rounded">
                    No artifacts uploaded yet.
                </div>
            )}
        </div>
    )
}
