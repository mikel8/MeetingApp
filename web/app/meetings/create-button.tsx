'use client'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { useState } from 'react'

export function CreateMeetingButton({ userId }: { userId: string }) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleCreate = async () => {
        setLoading(true)
        const { error } = await supabase.from('meetings').insert({
            owner_id: userId,
            title: 'New Meeting',
            status: 'created',
        })

        if (error) {
            alert('Error creating meeting: ' + error.message)
            console.error(error)
            setLoading(false)
        } else {
            router.refresh()
            setLoading(false)
        }
    }

    return (
        <button onClick={handleCreate} disabled={loading} className="btn btn-primary">
            <div className="flex items-center gap-2">
                <Plus size={16} />
                <span>{loading ? 'Creating...' : 'New Meeting'}</span>
            </div>
        </button>
    )
}
