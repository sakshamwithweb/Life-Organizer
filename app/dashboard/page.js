"use client"
import { redirect } from 'next/navigation'
import React, { useEffect, useState } from 'react'

const page = () => {
    const [email, setEmail] = useState('');
    useEffect(() => {
        (async () => {
            const req = await fetch("/api/getUserSession")
            const res = await req.json()
            console.log(res)
            if (!res.success) {
                redirect("/enter")
            } else {
                setEmail(res.email)
                console.log("hurray you are logged in")
            }
        })()
    }, [])

    return (
        <div>
            {email !== "" && <h1>hey</h1>}
        </div>
    )
}

export default page;