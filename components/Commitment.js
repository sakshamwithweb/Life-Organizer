import React, { useEffect, useState } from "react";

const Commitment = ({ uid }) => {
  const [commitments, setCommitments] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const req = await fetch("/api/getCommitment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-gray-50 shadow-lg rounded-lg">
      {ready ? (
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            Your Commitments
          </h1>
          {commitments.map((commitment, index) => (
            <div
              key={index}
              className="bg-white shadow-md rounded-lg p-6 mb-4 border border-gray-200 hover:shadow-lg transition duration-200"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                {commitment.title}
              </h2>
              <p className="text-gray-600 text-sm">
                <span className="font-medium text-gray-700">Due on:</span>{" "}
                {commitment.dueOn}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center mt-20">
          <p className="text-gray-500 text-lg">
            No commitments found.
          </p>
          <svg
            className="w-16 h-16 mx-auto mt-6 text-gray-300"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m2 0a2 2 0 100-4H7a2 2 0 100 4zm-4 4h4m-4 0a2 2 0 100 4h4a2 2 0 100-4h-4z"
            />
          </svg>
        </div>
      )}
    </div>
  );
};

export default Commitment;
