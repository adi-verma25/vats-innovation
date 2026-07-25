import { useEffect, useMemo, useState } from "react";
import imageCompression from "browser-image-compression";
import {
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import {
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import { db } from "../../firebase/firebase";
import { uploadWorkOrderImage } from "../../services/storageService";

function UpdateProgress() {
  const navigate = useNavigate();
  const location = useLocation();
  const { workOrderId } = useParams();

  const passedWorkOrder = location.state?.workOrder || null;

  const [workOrder, setWorkOrder] = useState(passedWorkOrder);
  const [progress, setProgress] = useState(
    Number(passedWorkOrder?.progress) || 0
  );
  const [status, setStatus] = useState(
    passedWorkOrder?.status || "Pending"
  );
  const [remarks, setRemarks] = useState(
    passedWorkOrder?.remarks || ""
  );

  const [beforeFiles, setBeforeFiles] = useState([]);
  const [afterFiles, setAfterFiles] = useState([]);

  const [loading, setLoading] = useState(!passedWorkOrder);
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [savingMessage, setSavingMessage] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchWorkOrder = async () => {
      if (!workOrderId) {
        setError("Work order ID is missing.");
        setLoading(false);
        return;
      }

      if (passedWorkOrder) {
        return;
      }

      try {
        setLoading(true);
        setError("");

        const workOrderRef = doc(
          db,
          "workOrders",
          workOrderId
        );

        const snapshot = await getDoc(workOrderRef);

        if (!snapshot.exists()) {
          setError("Work order not found.");
          return;
        }

        const workOrderData = {
          id: snapshot.id,
          ...snapshot.data(),
        };

        setWorkOrder(workOrderData);
        setProgress(Number(workOrderData.progress) || 0);
        setStatus(workOrderData.status || "Pending");
        setRemarks(workOrderData.remarks || "");
      } catch (fetchError) {
        console.error(
          "Error fetching work order:",
          fetchError
        );

        setError(
          "Unable to load the work order. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchWorkOrder();
  }, [passedWorkOrder, workOrderId]);

  const beforePreviews = useMemo(() => {
    return beforeFiles.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
  }, [beforeFiles]);

  const afterPreviews = useMemo(() => {
    return afterFiles.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
  }, [afterFiles]);

  useEffect(() => {
    return () => {
      beforePreviews.forEach((preview) =>
        URL.revokeObjectURL(preview.url)
      );

      afterPreviews.forEach((preview) =>
        URL.revokeObjectURL(preview.url)
      );
    };
  }, [beforePreviews, afterPreviews]);

  const validateFiles = (files) => {
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    const maximumOriginalSize = 15 * 1024 * 1024;
    const maximumFiles = 5;

    if (files.length > maximumFiles) {
      return `You can upload a maximum of ${maximumFiles} images at one time.`;
    }

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        return `${file.name} is not a supported image.`;
      }

      if (file.size > maximumOriginalSize) {
        return `${file.name} is larger than 15 MB.`;
      }
    }

    return "";
  };

  const handleBeforeFiles = (event) => {
    const selectedFiles = Array.from(
      event.target.files || []
    );

    const validationError =
      validateFiles(selectedFiles);

    if (validationError) {
      setError(validationError);
      event.target.value = "";
      return;
    }

    setError("");
    setBeforeFiles(selectedFiles);
  };

  const handleAfterFiles = (event) => {
    const selectedFiles = Array.from(
      event.target.files || []
    );

    const validationError =
      validateFiles(selectedFiles);

    if (validationError) {
      setError(validationError);
      event.target.value = "";
      return;
    }

    setError("");
    setAfterFiles(selectedFiles);
  };

  const removeBeforeFile = (indexToRemove) => {
    setBeforeFiles((currentFiles) =>
      currentFiles.filter(
        (_, index) => index !== indexToRemove
      )
    );
  };

  const removeAfterFile = (indexToRemove) => {
    setAfterFiles((currentFiles) =>
      currentFiles.filter(
        (_, index) => index !== indexToRemove
      )
    );
  };

  const compressImage = async (file) => {
    const options = {
      maxSizeMB: 0.65,
      maxWidthOrHeight: 1400,
      useWebWorker: true,
      initialQuality: 0.75,
    };

    try {
      return await imageCompression(file, options);
    } catch (compressionError) {
      console.warn(
        `Compression failed for ${file.name}; uploading the original file.`,
        compressionError
      );

      return file;
    }
  };

  const uploadFiles = async (
    files,
    workOrderNumber,
    photoType,
    onFileUploaded
  ) => {
    if (!files.length) {
      return [];
    }

    const uploadPromises = files.map(async (file) => {
      const compressedFile = await compressImage(file);

      const imageUrl = await uploadWorkOrderImage(
        compressedFile,
        workOrderNumber,
        photoType
      );

      onFileUploaded();

      return imageUrl || null;
    });

    const uploadedUrls = await Promise.all(uploadPromises);

    return uploadedUrls.filter(Boolean);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!workOrderId) {
      setError("Work order ID is missing.");
      return;
    }

    const progressValue = Number(progress);

    if (
      Number.isNaN(progressValue) ||
      progressValue < 0 ||
      progressValue > 100
    ) {
      setError(
        "Progress must be between 0 and 100."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const workOrderNumber =
        workOrder?.workOrderNumber || workOrderId;

      const totalFiles =
        beforeFiles.length + afterFiles.length;

      let completedFiles = 0;

      setUploadProgress(totalFiles > 0 ? 1 : 100);
      setSavingMessage(
        totalFiles > 0
          ? "Compressing and uploading images..."
          : "Saving progress..."
      );

      const handleFileUploaded = () => {
        completedFiles += 1;

        const percentage =
          totalFiles > 0
            ? Math.round((completedFiles / totalFiles) * 90)
            : 90;

        setUploadProgress(Math.max(1, percentage));
      };

      const [
        uploadedBeforePhotos,
        uploadedAfterPhotos,
      ] = await Promise.all([
        uploadFiles(
          beforeFiles,
          workOrderNumber,
          "before",
          handleFileUploaded
        ),
        uploadFiles(
          afterFiles,
          workOrderNumber,
          "after",
          handleFileUploaded
        ),
      ]);

      setUploadProgress(95);
      setSavingMessage("Saving progress details...");

      const existingBeforePhotos = Array.isArray(
        workOrder?.beforePhotos
      )
        ? workOrder.beforePhotos
        : [];

      const existingAfterPhotos = Array.isArray(
        workOrder?.afterPhotos
      )
        ? workOrder.afterPhotos
        : [];

      let finalStatus = status;

      if (progressValue === 100) {
        finalStatus = "Completed";
      } else if (
        progressValue > 0 &&
        finalStatus === "Pending"
      ) {
        finalStatus = "In Progress";
      }

      const updateData = {
        progress: progressValue,
        status: finalStatus,
        remarks: remarks.trim(),
        beforePhotos: [
          ...existingBeforePhotos,
          ...uploadedBeforePhotos,
        ],
        afterPhotos: [
          ...existingAfterPhotos,
          ...uploadedAfterPhotos,
        ],
        progressUpdatedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const workOrderRef = doc(
        db,
        "workOrders",
        workOrderId
      );

      await updateDoc(workOrderRef, updateData);

      setUploadProgress(100);
      setSavingMessage("Update saved successfully.");

      setWorkOrder((currentWorkOrder) => ({
        ...currentWorkOrder,
        ...updateData,
      }));

      setStatus(finalStatus);
      setBeforeFiles([]);
      setAfterFiles([]);

      setSuccess(
        "Work progress and photos were updated successfully."
      );
    } catch (saveError) {
      console.error(
        "Error updating work progress:",
        saveError
      );

      setError(
        "Unable to update progress. Check Firebase Storage and Firestore permissions."
      );
    } finally {
      setSaving(false);
      setTimeout(() => {
        setUploadProgress(0);
        setSavingMessage("");
      }, 500);
    }
  };

  if (loading) {
    return (
      <div style={styles.centerContainer}>
        <div style={styles.loader}></div>
        <p style={styles.loadingText}>
          Loading work order...
        </p>
      </div>
    );
  }

  if (!workOrder) {
    return (
      <div style={styles.centerContainer}>
        <h2 style={styles.errorTitle}>
          Work Order Not Found
        </h2>

        <p style={styles.loadingText}>
          {error ||
            "The requested work order is unavailable."}
        </p>

        <button
          type="button"
          style={styles.backButton}
          onClick={() =>
            navigate("/employee/work-orders")
          }
        >
          Back to My Work Orders
        </button>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <button
          type="button"
          style={styles.backButton}
          onClick={() =>
            navigate(
              `/employee/work-orders/${workOrderId}`,
              {
                state: { workOrder },
              }
            )
          }
        >
          ← Back to Details
        </button>

        <div style={styles.headerText}>
          <p style={styles.smallTitle}>
            EMPLOYEE PORTAL
          </p>

          <h1 style={styles.title}>
            Update Work Progress
          </h1>

          <p style={styles.subtitle}>
            Update progress, status, remarks and site
            photos.
          </p>
        </div>
      </div>

      <div style={styles.workOrderSummary}>
        <div>
          <span style={styles.summaryLabel}>
            Work Order
          </span>

          <strong style={styles.summaryValue}>
            {workOrder.workOrderNumber ||
              "Not available"}
          </strong>
        </div>

        <div>
          <span style={styles.summaryLabel}>
            Project
          </span>

          <strong style={styles.summaryValue}>
            {workOrder.projectName ||
              "Untitled Project"}
          </strong>
        </div>

        <div>
          <span style={styles.summaryLabel}>
            Hospital
          </span>

          <strong style={styles.summaryValue}>
            {workOrder.hospitalName ||
              "Not available"}
          </strong>
        </div>
      </div>

      {error && (
        <div style={styles.errorBox}>{error}</div>
      )}

      {success && (
        <div style={styles.successBox}>{success}</div>
      )}

      <form
        onSubmit={handleSubmit}
        style={styles.formCard}
      >
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>
            Progress and Status
          </h2>

          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>
                Work Progress
              </label>

              <div style={styles.progressValueRow}>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progress}
                  onChange={(event) =>
                    setProgress(event.target.value)
                  }
                  style={styles.rangeInput}
                />

                <strong style={styles.percentage}>
                  {progress}%
                </strong>
              </div>

              <div style={styles.progressTrack}>
                <div
                  style={{
                    ...styles.progressBar,
                    width: `${progress}%`,
                  }}
                ></div>
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                Work Status
              </label>

              <select
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value)
                }
                style={styles.input}
              >
                <option value="Pending">
                  Pending
                </option>

                <option value="In Progress">
                  In Progress
                </option>

                <option value="Completed">
                  Completed
                </option>

                <option value="On Hold">
                  On Hold
                </option>
              </select>
            </div>
          </div>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>
            Work Remarks
          </h2>

          <div style={styles.formGroup}>
            <label style={styles.label}>
              Describe the work completed
            </label>

            <textarea
              rows="5"
              value={remarks}
              onChange={(event) =>
                setRemarks(event.target.value)
              }
              placeholder="Example: Banner frame installation completed. Final printing work is pending."
              style={styles.textarea}
            />
          </div>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>
            Before Work Photos
          </h2>

          <p style={styles.helpText}>
            Upload up to 5 JPG, PNG or WebP images. Images
            are compressed automatically before uploading.
          </p>

          <label style={styles.uploadBox}>
            <span style={styles.uploadIcon}>📷</span>
            <strong>Select Before Photos</strong>
            <span style={styles.uploadText}>
              You can select multiple images
            </span>

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={handleBeforeFiles}
              style={styles.hiddenInput}
            />
          </label>

          {beforePreviews.length > 0 && (
            <div style={styles.photoGrid}>
              {beforePreviews.map(
                (preview, index) => (
                  <div
                    key={`${preview.file.name}-${index}`}
                    style={styles.photoCard}
                  >
                    <img
                      src={preview.url}
                      alt={`Before work ${index + 1}`}
                      style={styles.photo}
                    />

                    <button
                      type="button"
                      style={styles.removeButton}
                      onClick={() =>
                        removeBeforeFile(index)
                      }
                    >
                      Remove
                    </button>
                  </div>
                )
              )}
            </div>
          )}
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>
            After Work Photos
          </h2>

          <p style={styles.helpText}>
            Upload photos showing completed or current
            work progress.
          </p>

          <label style={styles.uploadBox}>
            <span style={styles.uploadIcon}>✅</span>
            <strong>Select After Photos</strong>
            <span style={styles.uploadText}>
              You can select multiple images
            </span>

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={handleAfterFiles}
              style={styles.hiddenInput}
            />
          </label>

          {afterPreviews.length > 0 && (
            <div style={styles.photoGrid}>
              {afterPreviews.map(
                (preview, index) => (
                  <div
                    key={`${preview.file.name}-${index}`}
                    style={styles.photoCard}
                  >
                    <img
                      src={preview.url}
                      alt={`After work ${index + 1}`}
                      style={styles.photo}
                    />

                    <button
                      type="button"
                      style={styles.removeButton}
                      onClick={() =>
                        removeAfterFile(index)
                      }
                    >
                      Remove
                    </button>
                  </div>
                )
              )}
            </div>
          )}
        </section>

        {saving && (
          <div style={styles.uploadProgressBox}>
            <div style={styles.uploadProgressHeader}>
              <strong>{savingMessage || "Processing..."}</strong>
              <span>{uploadProgress}%</span>
            </div>

            <div style={styles.uploadProgressTrack}>
              <div
                style={{
                  ...styles.uploadProgressBar,
                  width: `${uploadProgress}%`,
                }}
              ></div>
            </div>

            <p style={styles.uploadProgressHelp}>
              Please keep this page open until saving is complete.
            </p>
          </div>
        )}

        <div style={styles.footer}>
          <button
            type="button"
            style={styles.cancelButton}
            disabled={saving}
            onClick={() =>
              navigate(
                `/employee/work-orders/${workOrderId}`,
                {
                  state: { workOrder },
                }
              )
            }
          >
            Cancel
          </button>

          <button
            type="submit"
            style={{
              ...styles.saveButton,
              opacity: saving ? 0.7 : 1,
              cursor: saving
                ? "not-allowed"
                : "pointer",
            }}
            disabled={saving}
          >
            {saving
              ? `Saving ${uploadProgress}%`
              : "Save Progress Update"}
          </button>
        </div>
      </form>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100%",
    padding: "30px",
    background: "#f5f7fb",
    fontFamily:
      "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },

  header: {
    marginBottom: "24px",
  },

  headerText: {
    marginTop: "22px",
  },

  smallTitle: {
    margin: "0 0 8px",
    fontSize: "12px",
    fontWeight: "800",
    letterSpacing: "1.5px",
    color: "#2563eb",
  },

  title: {
    margin: 0,
    fontSize: "32px",
    color: "#111827",
  },

  subtitle: {
    margin: "8px 0 0",
    color: "#6b7280",
  },

  backButton: {
    padding: "10px 16px",
    border: "none",
    borderRadius: "10px",
    background: "#111827",
    color: "#ffffff",
    fontWeight: "700",
    cursor: "pointer",
  },

  workOrderSummary: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(210px, 1fr))",
    gap: "16px",
    marginBottom: "22px",
    padding: "20px",
    borderRadius: "16px",
    background: "#111827",
    color: "#ffffff",
  },

  summaryLabel: {
    display: "block",
    marginBottom: "6px",
    color: "#9ca3af",
    fontSize: "12px",
  },

  summaryValue: {
    fontSize: "15px",
  },

  errorBox: {
    marginBottom: "18px",
    padding: "15px",
    borderRadius: "10px",
    border: "1px solid #fecaca",
    background: "#fef2f2",
    color: "#991b1b",
  },

  successBox: {
    marginBottom: "18px",
    padding: "15px",
    borderRadius: "10px",
    border: "1px solid #bbf7d0",
    background: "#f0fdf4",
    color: "#166534",
  },

  formCard: {
    padding: "28px",
    borderRadius: "18px",
    background: "#ffffff",
    boxShadow:
      "0 8px 25px rgba(15, 23, 42, 0.06)",
  },

  section: {
    paddingBottom: "28px",
    marginBottom: "28px",
    borderBottom: "1px solid #e5e7eb",
  },

  sectionTitle: {
    margin: "0 0 18px",
    fontSize: "20px",
    color: "#111827",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "20px",
  },

  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "9px",
  },

  label: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#374151",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 14px",
    border: "1px solid #d1d5db",
    borderRadius: "10px",
    background: "#f9fafb",
    fontSize: "14px",
    outline: "none",
  },

  textarea: {
    width: "100%",
    boxSizing: "border-box",
    padding: "14px",
    border: "1px solid #d1d5db",
    borderRadius: "10px",
    background: "#f9fafb",
    fontFamily: "inherit",
    fontSize: "14px",
    resize: "vertical",
    outline: "none",
  },

  progressValueRow: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },

  rangeInput: {
    flex: 1,
    cursor: "pointer",
  },

  percentage: {
    minWidth: "50px",
    color: "#2563eb",
    fontSize: "18px",
  },

  progressTrack: {
    height: "9px",
    borderRadius: "999px",
    background: "#e5e7eb",
    overflow: "hidden",
  },

  progressBar: {
    height: "100%",
    borderRadius: "999px",
    background:
      "linear-gradient(90deg, #2563eb, #06b6d4)",
    transition: "width 0.25s ease",
  },

  helpText: {
    margin: "-8px 0 16px",
    color: "#6b7280",
    fontSize: "13px",
  },

  uploadBox: {
    minHeight: "150px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: "8px",
    padding: "20px",
    border: "2px dashed #93c5fd",
    borderRadius: "14px",
    background: "#eff6ff",
    color: "#1e3a8a",
    cursor: "pointer",
    textAlign: "center",
  },

  uploadIcon: {
    fontSize: "34px",
  },

  uploadText: {
    color: "#64748b",
    fontSize: "13px",
  },

  hiddenInput: {
    display: "none",
  },

  photoGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fill, minmax(170px, 1fr))",
    gap: "15px",
    marginTop: "18px",
  },

  photoCard: {
    padding: "10px",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    background: "#f9fafb",
  },

  photo: {
    width: "100%",
    height: "145px",
    objectFit: "cover",
    borderRadius: "9px",
  },

  removeButton: {
    width: "100%",
    marginTop: "8px",
    padding: "8px",
    border: "none",
    borderRadius: "8px",
    background: "#fee2e2",
    color: "#b91c1c",
    fontWeight: "700",
    cursor: "pointer",
  },

  uploadProgressBox: {
    marginBottom: "22px",
    padding: "16px",
    border: "1px solid #bfdbfe",
    borderRadius: "12px",
    background: "#eff6ff",
  },

  uploadProgressHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    marginBottom: "10px",
    color: "#1e3a8a",
    fontSize: "14px",
  },

  uploadProgressTrack: {
    width: "100%",
    height: "11px",
    overflow: "hidden",
    borderRadius: "999px",
    background: "#dbeafe",
  },

  uploadProgressBar: {
    height: "100%",
    borderRadius: "999px",
    background:
      "linear-gradient(90deg, #2563eb, #06b6d4)",
    transition: "width 0.2s ease",
  },

  uploadProgressHelp: {
    margin: "9px 0 0",
    color: "#475569",
    fontSize: "12px",
  },

  footer: {
    display: "flex",
    justifyContent: "flex-end",
    flexWrap: "wrap",
    gap: "12px",
  },

  cancelButton: {
    padding: "12px 20px",
    border: "1px solid #d1d5db",
    borderRadius: "10px",
    background: "#ffffff",
    color: "#374151",
    fontWeight: "700",
    cursor: "pointer",
  },

  saveButton: {
    padding: "12px 22px",
    border: "none",
    borderRadius: "10px",
    background: "#2563eb",
    color: "#ffffff",
    fontWeight: "800",
  },

  centerContainer: {
    minHeight: "70vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: "16px",
    padding: "30px",
    textAlign: "center",
    background: "#f5f7fb",
  },

  loader: {
    width: "42px",
    height: "42px",
    border: "4px solid #dbeafe",
    borderTop: "4px solid #2563eb",
    borderRadius: "50%",
  },

  loadingText: {
    color: "#6b7280",
  },

  errorTitle: {
    margin: 0,
    color: "#991b1b",
  },
};

export default UpdateProgress;