"use client";
import React, { useEffect, useState } from "react";

const DashboardPage = () => {
  const [email, setEmail] = useState("");
  const [dataHierarchy, setDataHierarchy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const req = await fetch("/api/getUserSession");
        const res = await req.json();
        console.log(res);
        if (!res.success) {
          window.location.href = "/enter";
        } else {
          setEmail(res.email);
          console.log("Hurray, you are logged in!");
        }
      } catch (err) {
        console.error("Error fetching user session:", err);
        setError("Failed to load session.");
      }
    })();
  }, []);

  useEffect(() => {
    if (email !== "") {
      (async () => {
        try {
          const req1 = await fetch("/api/dashboard_help", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: email,
            }),
          });
          const res1 = await req1.json();
          if (res1.message === "Help page") {
            const hierarchy = organizeDataHierarchy(res1.data);
            setDataHierarchy(hierarchy);
            setLoading(false);
          } else {
            setError("Failed to load dashboard data.");
            setLoading(false);
          }
        } catch (err) {
          console.error("Error fetching dashboard data:", err);
          setError("Failed to fetch dashboard data.");
          setLoading(false);
        }
      })();
    }
  }, [email]);

  const organizeDataHierarchy = (data) => {
    const hierarchy = {};

    data.forEach(({ date, conversation }) => {
      const dateObj = new Date(date);
      const year = dateObj.getFullYear();
      const month = dateObj.toLocaleString("default", { month: "long" });
      const day = dateObj.getDate();

      if (!hierarchy[year]) hierarchy[year] = {};
      if (!hierarchy[year][month]) hierarchy[year][month] = {};
      if (!hierarchy[year][month][day]) hierarchy[year][month][day] = [];

      hierarchy[year][month][day].push(...conversation);
    });

    return hierarchy;
  };

  const renderConversations = (conversations) => {
    return (
      <ul className="ml-6 space-y-2">
        {conversations.map((conversation, index) => (
          <li key={index} className="bg-white p-4 rounded shadow hover:bg-gray-50 transition">
            <p className="text-gray-800">
              <span className="font-semibold">Text:</span> {conversation.text}
            </p>
            <p className="text-gray-600">
              <span className="font-semibold">Speaker:</span> {conversation.speaker}
            </p>
          </li>
        ))}
      </ul>
    );
  };

  const renderHierarchy = (hierarchy) => {
    return (
      <ul className="space-y-4">
        {Object.keys(hierarchy).map((year) => (
          <li key={year}>
            <details className="bg-gray-100 p-4 rounded-md shadow-md">
              <summary className="cursor-pointer font-bold text-blue-600">
                {year}
              </summary>
              <ul className="mt-2 space-y-2">
                {Object.keys(hierarchy[year]).map((month) => (
                  <li key={month}>
                    <details className="bg-white p-3 rounded-md shadow-sm">
                      <summary className="cursor-pointer font-medium text-blue-500">
                        {month}
                      </summary>
                      <ul className="mt-1 space-y-1">
                        {Object.keys(hierarchy[year][month]).map((day) => (
                          <li key={day}>
                            <details className="bg-gray-50 p-2 rounded">
                              <summary className="cursor-pointer text-blue-400">
                                Day {day}
                              </summary>
                              {renderConversations(
                                hierarchy[year][month][day]
                              )}
                            </details>
                          </li>
                        ))}
                      </ul>
                    </details>
                  </li>
                ))}
              </ul>
            </details>
          </li>
        ))}
      </ul>
    );
  };

  if (loading) {
    return <p className="text-center text-gray-500">Loading...</p>;
  }

  if (error) {
    return (
      <div className="text-center text-red-500">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold text-center mb-6">
        Welcome, {email}
      </h1>
      {dataHierarchy ? (
        <div>{renderHierarchy(dataHierarchy)}</div>
      ) : (
        <p className="text-center text-gray-500">No data available.</p>
      )}
    </div>
  );
};

export default DashboardPage;
