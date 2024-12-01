"use client";

import React, { useEffect, useState } from "react";

const Modal = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-20"
        onClick={onClose}
        aria-label="Close Modal"
      ></div>

      <div
        className="fixed inset-0 flex items-center justify-center z-30 px-4"
        aria-modal="true"
        role="dialog"
      >
        <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 focus:outline-none"
            aria-label="Close"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h2 className="text-xl font-semibold mb-4">{title}</h2>
          <p className="text-gray-700 break-words">{children}</p>
        </div>
      </div>
    </>
  );
};

const DashboardPage = () => {
  const [email, setEmail] = useState("");
  const [dataHierarchy, setDataHierarchy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalText, setModalText] = useState("");

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

    data.forEach(({ date, conversation, summary }) => {
      const dateObj = new Date(date);
      const year = dateObj.getFullYear();
      const month = dateObj.toLocaleString("default", { month: "long" });
      const day = dateObj.getDate();

      if (!hierarchy[year]) hierarchy[year] = {};
      if (!hierarchy[year][month]) hierarchy[year][month] = {};
      if (!hierarchy[year][month][day]) {
        hierarchy[year][month][day] = {
          conversations: [],
          summary: summary || null,
        };
      }

      hierarchy[year][month][day].conversations.push(...conversation);
      if (summary && !hierarchy[year][month][day].summary) {
        hierarchy[year][month][day].summary = summary;
      }
    });

    return hierarchy;
  };

  const renderConversations = (conversations) => {
    return (
      <ul className="ml-6 space-y-2">
        {conversations.map((conversation, index) => (
          <li
            key={index}
            className="bg-white p-4 rounded shadow hover:bg-gray-50 transition"
          >
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

  const openModal = (text) => {
    setModalText(text);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalText("");
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
                        {Object.keys(hierarchy[year][month]).map((day) => {
                          const dayData = hierarchy[year][month][day];
                          return (
                            <li key={day} className="flex items-center justify-between">
                              <details className="bg-gray-50 p-2 rounded w-full">
                                <summary className="cursor-pointer text-blue-400 flex items-center justify-between">
                                  <span>Day {day}</span>
                                  {dayData.summary && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openModal(dayData.summary);
                                      }}
                                      className="ml-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                                      aria-label="View Summary"
                                    >
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                      >
                                        <path
                                          fillRule="evenodd"
                                          d="M18 10c0 4.418-3.582 8-8 8s-8-3.582-8-8 3.582-8 8-8 8 3.582 8 8zm-8-3a1 1 0 100 2 1 1 0 000-2zm1 4a1 1 0 00-2 0v3a1 1 0 102 0v-3z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                    </button>
                                  )}
                                </summary>
                                {renderConversations(dayData.conversations)}
                              </details>
                            </li>
                          );
                        })}
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

      <Modal isOpen={isModalOpen} onClose={closeModal} title="Summary">
        {modalText}
      </Modal>
    </div>
  );
};

export default DashboardPage;
