import { useEffect, useState } from "react";
import { auth, db } from "../../../firebase/firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

export default function MarkAttendance() {
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const getTodayKey = () => {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const loadTodayAttendance = async () => {
    try {
      const user = auth.currentUser;

      if (!user) {
        alert("Please login first.");
        return;
      }

      const todayKey = getTodayKey();
      const attendanceId = `${user.uid}_${todayKey}`;

      const attendanceRef = doc(db, "attendance", attendanceId);
      const attendanceSnap = await getDoc(attendanceRef);

      if (attendanceSnap.exists()) {
        setAttendance(attendanceSnap.data());
      } else {
        setAttendance(null);
      }
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTodayAttendance();
  }, []);

  const handleCheckIn = async () => {
    try {
      setActionLoading(true);

      const user = auth.currentUser;

      if (!user) {
        alert("Please login first.");
        return;
      }

      if (attendance?.checkIn) {
        alert("You have already checked in today.");
        return;
      }

      const todayKey = getTodayKey();
      const attendanceId = `${user.uid}_${todayKey}`;

      const attendanceRef = doc(db, "attendance", attendanceId);

      const attendanceData = {
        employeeId: user.uid,
        employeeEmail: user.email,
        date: todayKey,
        status: "Present",
        checkIn: serverTimestamp(),
        checkOut: null,
        createdAt: serverTimestamp(),
      };

      await setDoc(attendanceRef, attendanceData);

      alert("Check In Successful!");

      await loadTodayAttendance();
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setActionLoading(true);

      const user = auth.currentUser;

      if (!user) {
        alert("Please login first.");
        return;
      }

      if (!attendance?.checkIn) {
        alert("Please check in first.");
        return;
      }

      if (attendance?.checkOut) {
        alert("You have already checked out today.");
        return;
      }

      const todayKey = getTodayKey();
      const attendanceId = `${user.uid}_${todayKey}`;

      const attendanceRef = doc(db, "attendance", attendanceId);

      await updateDoc(attendanceRef, {
        checkOut: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      alert("Check Out Successful!");

      await loadTodayAttendance();
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "Not marked";

    return timestamp.toDate().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  if (loading) {
    return <h2>Loading attendance...</h2>;
  }

  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "0 auto",
      }}
    >
      <h1
        style={{
          marginBottom: "10px",
          color: "#0f172a",
        }}
      >
        My Attendance
      </h1>

      <p
        style={{
          color: "#64748b",
          marginBottom: "25px",
        }}
      >
        Date: {getTodayKey()}
      </p>

      <div
        style={{
          background: "#ffffff",
          padding: "25px",
          borderRadius: "14px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
          marginBottom: "25px",
        }}
      >
        <h2
          style={{
            marginBottom: "20px",
          }}
        >
          Today&apos;s Status
        </h2>

        <p>
          <strong>Status:</strong>{" "}
          {attendance?.status || "Not Checked In"}
        </p>

        <p>
          <strong>Check In:</strong>{" "}
          {formatTime(attendance?.checkIn)}
        </p>

        <p>
          <strong>Check Out:</strong>{" "}
          {formatTime(attendance?.checkOut)}
        </p>
      </div>

      <div
        style={{
          display: "flex",
          gap: "15px",
        }}
      >
        <button
          onClick={handleCheckIn}
          disabled={actionLoading || Boolean(attendance?.checkIn)}
          style={{
            flex: 1,
            padding: "14px",
            border: "none",
            borderRadius: "10px",
            background: attendance?.checkIn ? "#94a3b8" : "#16a34a",
            color: "#ffffff",
            cursor: attendance?.checkIn ? "not-allowed" : "pointer",
            fontWeight: "bold",
            fontSize: "16px",
          }}
        >
          {attendance?.checkIn ? "Checked In" : "Check In"}
        </button>

        <button
          onClick={handleCheckOut}
          disabled={
            actionLoading ||
            !attendance?.checkIn ||
            Boolean(attendance?.checkOut)
          }
          style={{
            flex: 1,
            padding: "14px",
            border: "none",
            borderRadius: "10px",
            background:
              !attendance?.checkIn || attendance?.checkOut
                ? "#94a3b8"
                : "#dc2626",
            color: "#ffffff",
            cursor:
              !attendance?.checkIn || attendance?.checkOut
                ? "not-allowed"
                : "pointer",
            fontWeight: "bold",
            fontSize: "16px",
          }}
        >
          {attendance?.checkOut ? "Checked Out" : "Check Out"}
        </button>
      </div>
    </div>
  );
}