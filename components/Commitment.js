import React, { useEffect, useState } from 'react';

const Commitment = ({ uid }) => {
    const [commitments, setCommitments] = useState([]);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        (async () => {
            const req = await fetch('/api/getCommitment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ uid: uid }),
            });
            const res = await req.json();
            if (res.success) setCommitments(res.commitments);
        })();
    }, [uid]);

    useEffect(() => {
        if (commitments.length !== 0) setReady(true);
    }, [commitments]);

    return (
        <div className="max-w-lg mx-auto mt-10 p-4">
            {ready ? (
                commitments.map((commitment, index) => (
                    <div
                        key={index}
                        className="bg-white shadow-md rounded-lg p-4 mb-4 border border-gray-200"
                    >
                        <p className="text-lg font-semibold text-gray-800">
                            {commitment.title}
                        </p>
                        <p className="text-sm text-gray-600">
                            Due on: {commitment.dueOn}
                        </p>
                    </div>
                ))
            ) : (
                <p className="text-center text-gray-500 text-lg mt-8">
                    No commitments found.
                </p>
            )}
        </div>
    );
};

export default Commitment;
