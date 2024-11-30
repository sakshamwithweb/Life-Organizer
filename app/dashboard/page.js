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

    useEffect(() => {
        if (email !== "") {
            (async () => {
                const req1 = await fetch("/api/dashboard_help", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email: email
                    })
                })
                const res1 = await req1.json()
                console.log(res1)
            })()
        }
    }, [email])

    return (
        <div>
            {email !== "" && <h1>hey</h1>}
        </div>
    )
}

export default page;