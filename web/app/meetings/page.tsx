import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CreateMeetingButton } from './create-button'

export default async function MeetingsPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return redirect('/login')
    }

    const { data: meetings } = await supabase
        .from('meetings')
        .select('*')
        .order('created_at', { ascending: false })

    return (
        <div className="container">
            <header className="flex items-center justify-between mb-8">
                <h1 className="text-2xl">Meetings</h1>
                <CreateMeetingButton userId={user.id} />
            </header>

            <div className="card glass">
                {meetings && meetings.length > 0 ? (
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {meetings.map((meeting: any) => (
                                <tr key={meeting.id}>
                                    <td>
                                        <Link href={`/meetings/${meeting.id}`} className="font-medium hover:underline">
                                            {meeting.title || 'Untitled Meeting'}
                                        </Link>
                                    </td>
                                    <td>
                                        <span className="badge">{meeting.status}</span>
                                    </td>
                                    <td className="text-muted text-sm">
                                        {new Date(meeting.created_at).toLocaleDateString()}
                                    </td>
                                    <td>
                                        <Link href={`/meetings/${meeting.id}`} className="text-sm btn" style={{ padding: '0.25rem 0.5rem' }}>
                                            View
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="text-center py-12 text-muted">
                        No meetings found. Create one to get started.
                    </div>
                )}
            </div>
        </div>
    )
}
