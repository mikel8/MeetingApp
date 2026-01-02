import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import MeetingArtifacts from '@/components/MeetingArtifacts'

export default async function MeetingDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient()
    const { id } = await params

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return redirect('/login')

    const { data: meeting } = await supabase
        .from('meetings')
        .select('*')
        .eq('id', id)
        .single()

    if (!meeting) {
        return (
            <div className="container flex flex-col gap-4">
                <Link href="/meetings" className="inline-flex items-center text-muted hover:text-white mb-6">
                    <ChevronLeft size={16} className="mr-1" /> Back to Meetings
                </Link>
                <div className="text-xl">Meeting not found</div>
            </div>
        )
    }

    const { data: artifactsData } = await supabase
        .from('meeting_artifacts')
        .select('*')
        .eq('meeting_id', id)
        .order('created_at', { ascending: false })

    const artifacts = artifactsData || []

    return (
        <div className="container">
            <Link href="/meetings" className="inline-flex items-center text-muted hover:text-white mb-6">
                <ChevronLeft size={16} className="mr-1" /> Back to Meetings
            </Link>

            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl">{meeting.title || 'Untitled Meeting'}</h1>
                    <span className="badge">{meeting.status}</span>
                </div>

                <div className="card glass">
                    <h2 className="text-lg mb-4">Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <label className="text-muted block mb-1">ID</label>
                            {meeting.id}
                        </div>
                        <div>
                            <label className="text-muted block mb-1">Created At</label>
                            {new Date(meeting.created_at).toLocaleString()}
                        </div>
                        {meeting.summary && (
                            <div className="col-span-2">
                                <label className="text-muted block mb-1">Summary</label>
                                <p className="p-2 rounded bg-black/20">{meeting.summary}</p>
                            </div>
                        )}
                        {meeting.transcript && (
                            <div className="col-span-2">
                                <label className="text-muted block mb-1">Transcript Preview</label>
                                <p className="line-clamp-3 opacity-80 p-2 rounded bg-black/20 font-mono text-xs">{meeting.transcript}</p>
                            </div>
                        )}
                    </div>
                </div>

                <MeetingArtifacts
                    meetingId={meeting.id}
                    userId={user.id}
                    initialArtifacts={artifacts}
                />
            </div>
        </div>
    )
}
