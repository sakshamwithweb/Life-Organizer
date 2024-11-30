"use client";

import Link from "next/link";
import { redirect } from "next/navigation";
import React, { useEffect, useState } from "react";

const Page = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("")
    const [omi_userid, setOmiUserid] = useState("")
    const [otpSent, setOtpSent] = useState(false)
    const [otp, setOtp] = useState(0)
    const [uid, setUid] = useState(null)
    const [wait, setWait] = useState(false)
    const toggleForm = () => {
        setIsLogin(!isLogin);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isLogin) {
            if (email.trim() === "" || password.trim() === "") {
                alert("fill form")
                return
            }
            setWait(true)
            const req = await fetch("/api/enter/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            })
            const res = await req.json()
            if (res.success) {
                redirect("/dashboard")
            } else {
                setWait(false)
                alert(res.message)
            }
            return
        }
        if (name.trim() === "" || omi_userid.trim() === "" || email.trim() === "" || password.trim() === "") {
            alert("fill form")
            return
        }
        setWait(true)
        const req = await fetch("/api/enter/checkUser", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
            })
        })
        const res = await req.json()
        if (res.success) {
            setUid(res.uid)
            setOtpSent(true)
        } else {
            setWait(false)
            alert(res.message)
        }
    };

    useEffect(() => {
        if (otpSent) {
            alert("Otp sent successfully")
        }
    }, [otpSent, uid])

    useEffect(() => {
        (async () => {
            const req = await fetch("/api/getUserSession")
            const res = await req.json()
            console.log(res)
            if (res.success) {
                redirect("/dashboard")
            }
        })()
    }, [])

    const handleSubmitOtp = async (e) => {
        e.preventDefault()
        if (otp !== 0 && otpSent && uid) {
            const req = await fetch("/api/enter/check_otp", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    uid: uid,
                    otp: otp,
                    email: email,
                    password: password,
                    name: name,
                    omi_userid: omi_userid
                })
            })
            const res = await req.json()
            if (res.success) {
                alert("User registered successfully! Now login please")
                window.location.reload()
            } else {
                alert(res.message)
            }
        } else {
            LazyResult("Unable to verify otp")
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 py-8">
            <div className="w-full max-w-lg sm:max-w-md bg-white p-8 rounded shadow-lg">
                <h2 className="text-2xl font-bold mb-6 text-center">
                    {isLogin ? "Login to Life Organizer" : "Sign up for Life Organizer"}
                </h2>

                <form>
                    {!isLogin && (
                        <>
                            <div className="mb-4">
                                <label
                                    htmlFor="name"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="John Doe"
                                />
                            </div>

                            <div className="mb-4">
                                <label
                                    htmlFor="omi-user-id"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    OMI User ID
                                </label>
                                <input
                                    type="text"
                                    value={omi_userid}
                                    onChange={(e) => setOmiUserid(e.target.value)}
                                    id="omi-user-id"
                                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter your OMI User ID"
                                />
                            </div>
                        </>
                    )}

                    <div className="mb-4">
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Email Address
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div className="mb-6">
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            id="password"
                            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your password"
                        />
                    </div>

                    {otpSent && (
                        <div className="mb-6">
                            <label
                                htmlFor="otp"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                OTP
                            </label>
                            <input
                                type="number"
                                id="otp"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                                placeholder="Enter your OTP"
                            />
                            <button
                                onClick={handleSubmitOtp}
                                className="mt-4 w-full bg-blue-600 text-white font-semibold py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-blue-700 transition duration-200"
                            >
                                Submit OTP
                            </button>
                        </div>
                    )}


                    <button
                        type="submit"
                        onClick={handleSubmit}
                        disabled={wait}
                        className={`w-full bg-blue-500 ${wait && "pointer-events-none opacity-50"} text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-300`}
                    >
                        {isLogin ? "Login" : "Sign Up"}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-500">
                        {isLogin ? "New to Life Organizer?" : "Already have an account?"}{" "}
                        <button
                            type="button"
                            onClick={toggleForm}
                            className='text-blue-600 font-medium hover:underline focus:outline-none'
                        >
                            {isLogin ? "Sign up" : "Login"}
                        </button>
                    </p>
                    <Link
                        href="/enter/forget_password"
                        className="mt-2 inline-block text-sm text-blue-600 font-medium hover:underline"
                    >
                        Forget Password?
                    </Link>
                </div>

            </div>
        </div>
    );
};

export default Page;
