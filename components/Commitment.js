import React, { useEffect, useState } from 'react'

const Commitment = ({ uid }) => {
    const [commitments, setCommitments] = useState([])
    const [ready, setReady] = useState(false)
    useEffect(() => {
        (async () => {
            const req = await fetch("/api/getCommitment", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ uid: uid })
            })
            const res = await req.json()
            if (res.success) setCommitments(res.commitments)
        })()
    }, [])


    useEffect(() => {
        if (commitments.length !== 0) setReady(true)
    }, [commitments])
    return (
        <div>
            {ready ? commitments.map((commitment, index) => {
                return (
                    <div key={index}>
                        <p>{commitment.title}</p>
                        <p>{commitment.dueOn}</p>
                    </div>
                )
            }) : <p>No commitments found.</p>}
        </div>
    )
}

export default Commitment