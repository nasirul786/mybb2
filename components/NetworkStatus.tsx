"use client"

import { useState, useEffect } from "react"
import Lottie from "lottie-react"

export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true)
  const [modalDismissed, setModalDismissed] = useState(false)
  const [showReconnectBanner, setShowReconnectBanner] = useState(false)
  const [offlineAnim, setOfflineAnim] = useState<any>(null)

  useEffect(() => {
    fetch("/lottie/offline.json")
      .then((res) => res.json())
      .then((data) => setOfflineAnim(data))
      .catch(() => console.error("Failed to load offline.json"))
  }, [])

  useEffect(() => {
    setIsOnline(navigator.onLine)

    const handleOffline = () => {
      setIsOnline(false)
      setModalDismissed(false)
      setShowReconnectBanner(false)
    }

    const handleOnline = () => {
      setIsOnline(true)
      setModalDismissed(true)
      setShowReconnectBanner(true)
      setTimeout(() => setShowReconnectBanner(false), 3000)
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  const handleModalDismiss = () => {
    setModalDismissed(true)
  }

  const bannerStyle: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    padding: "12px 20px",
    color: "white",
    textAlign: "center",
    zIndex: 2000,
    fontSize: "14px",
    fontWeight: 500,
  }

  const modalOverlayStyle: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1999,
    color: "#fff",
    textAlign: "center",
    padding: "20px",
  }

  const modalButtonStyle: React.CSSProperties = {
    backgroundColor: "#e53e3e",
    color: "white",
    border: "none",
    borderRadius: "6px",
    padding: "10px 24px",
    fontSize: "16px",
    fontWeight: 600,
    cursor: "pointer",
    marginTop: "24px",
  }

  return (
    <>
      {!isOnline && !modalDismissed && offlineAnim && (
        <div style={modalOverlayStyle}>
          <div style={{ width: "150px", height: "150px" }}>
            <Lottie animationData={offlineAnim} loop autoplay />
          </div>
          <h2 style={{ fontSize: "24px", fontWeight: 700, marginTop: "16px" }}>
            No Internet Connection
          </h2>
          <p style={{ fontSize: "16px", color: "#aaa", marginTop: "8px", maxWidth: "400px" }}>
            Please check your network connection and try again. Some
            features may not be available.
          </p>
          <button style={modalButtonStyle} onClick={handleModalDismiss}>
            I Understand
          </button>
        </div>
      )}

      {!isOnline && (
        <div style={{ ...bannerStyle, backgroundColor: "#e53e3e" }}>
          You are currently offline. Some features may not work.
        </div>
      )}

      {isOnline && showReconnectBanner && (
        <div style={{ ...bannerStyle, backgroundColor: "#38a169" }}>
          Connection back
        </div>
      )}
    </>
  )
}