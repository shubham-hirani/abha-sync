import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { recordsApi } from "../services/api";

interface Record {
    id: string;
    file_name: string;
    content_type: string;
    file_size: number;
    record_type: string;
    notes: string | null;
    uploaded_at: string | null;
    preview_url: string;
    ai_analysis: string | null;
    analyzed_at: string | null;
}

type FilterType = "all" | "report" | "record";

export default function MyRecords() {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [records, setRecords] = useState<Record[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");
    const [filter, setFilter] = useState<FilterType>("all");
    const [dragOver, setDragOver] = useState(false);

    // Upload form state
    const [uploadType, setUploadType] = useState<"report" | "record">("record");
    const [uploadNotes, setUploadNotes] = useState("");

    // Preview modal
    const [previewRecord, setPreviewRecord] = useState<Record | null>(null);

    // Delete confirmation
    const [deleteTarget, setDeleteTarget] = useState<Record | null>(null);
    const [deleting, setDeleting] = useState(false);

    // AI Analysis
    const [analyzing, setAnalyzing] = useState(false);

    const loadRecords = useCallback(async () => {
        try {
            const res = await recordsApi.list();
            setRecords(res.data.records);
        } catch {
            setError("Failed to load records.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadRecords();
    }, [loadRecords]);

    const handleUpload = async (file: File) => {
        setError("");

        // Client-side validation
        const allowed = ["image/jpeg", "image/png", "application/pdf"];
        if (!allowed.includes(file.type)) {
            setError("Only JPEG, PNG, and PDF files are allowed.");
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            setError("File size must be under 10 MB.");
            return;
        }

        setUploading(true);
        try {
            await recordsApi.upload(file, uploadType, uploadNotes);
            setUploadNotes("");
            await loadRecords();
        } catch (err: any) {
            setError(err.response?.data?.detail || "Upload failed.");
        } finally {
            setUploading(false);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleUpload(file);
        e.target.value = "";
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleUpload(file);
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await recordsApi.delete(deleteTarget.id);
            setRecords((prev) => prev.filter((r) => r.id !== deleteTarget.id));
            setDeleteTarget(null);
        } catch {
            setError("Failed to delete record.");
        } finally {
            setDeleting(false);
        }
    };

    const filteredRecords =
        filter === "all" ? records : records.filter((r) => r.record_type === filter);

    const formatSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const formatDate = (iso: string | null) => {
        if (!iso) return "—";
        return new Date(iso).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    const getTypeIcon = (contentType: string) => {
        if (contentType === "application/pdf") return "📄";
        return "🖼️";
    };

    // Append auth token to preview URL so <img> tags can authenticate
    const getPreviewUrl = (previewUrl: string) => {
        const token = localStorage.getItem("access_token");
        if (!token) return previewUrl;
        const separator = previewUrl.includes("?") ? "&" : "?";
        return `${previewUrl}${separator}token=${encodeURIComponent(token)}`;
    };

    const handleAnalyze = async () => {
        if (!previewRecord) return;
        setAnalyzing(true);
        setError("");
        try {
            const res = await recordsApi.analyze(previewRecord.id);
            const updated = res.data;
            // Update record in list and in preview
            setRecords((prev) =>
                prev.map((r) => (r.id === updated.id ? updated : r))
            );
            setPreviewRecord(updated);
        } catch (err: any) {
            setError(err.response?.data?.detail || "AI analysis failed.");
        } finally {
            setAnalyzing(false);
        }
    };

    const renderAIInsights = (analysisJson: string) => {
        try {
            const data = JSON.parse(analysisJson);
            return (
                <div className="ai-insights">
                    <h4 className="ai-insights-title">🤖 AI Insights</h4>
                    {data.summary && <p className="ai-summary">{data.summary}</p>}

                    {/* Drug table for prescriptions */}
                    {data.drugs && data.drugs.length > 0 && (
                        <table className="ai-table">
                            <thead>
                                <tr>
                                    <th>Drug</th>
                                    <th>Dosage</th>
                                    <th>Frequency</th>
                                    <th>Instructions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.drugs.map((d: any, i: number) => (
                                    <tr key={i}>
                                        <td className="ai-drug-name">{d.name}</td>
                                        <td>{d.dosage}</td>
                                        <td>{d.frequency}</td>
                                        <td>{d.instructions || d.duration || "—"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {/* Parameter table for lab reports */}
                    {data.parameters && data.parameters.length > 0 && (
                        <table className="ai-table">
                            <thead>
                                <tr>
                                    <th>Parameter</th>
                                    <th>Value</th>
                                    <th>Reference</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.parameters.map((p: any, i: number) => (
                                    <tr key={i} className={p.status !== "normal" ? "ai-abnormal" : ""}>
                                        <td>{p.name}</td>
                                        <td className="ai-value">{p.value}</td>
                                        <td>{p.reference_range}</td>
                                        <td>
                                            <span className={`ai-status ai-status-${p.status}`}>
                                                {p.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {/* Recommendations */}
                    {data.recommendations && data.recommendations.length > 0 && (
                        <div className="ai-recommendations">
                            <h5>💡 Recommendations</h5>
                            <ul>
                                {data.recommendations.map((r: string, i: number) => (
                                    <li key={i}>{r}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            );
        } catch {
            return <p className="ai-error">Could not parse analysis results.</p>;
        }
    };

    return (
        <div className="dashboard-container">
            {/* Header */}
            <header className="dashboard-header">
                <div className="header-brand">
                    <button onClick={() => navigate("/dashboard")} className="btn-back" title="Back">
                        ←
                    </button>
                    <span className="brand-icon">📄</span>
                    <span className="brand-name">My Records</span>
                </div>
            </header>

            <main className="records-main">
                {/* Upload Zone */}
                <section className="upload-section">
                    <div
                        className={`upload-dropzone ${dragOver ? "drag-over" : ""} ${uploading ? "uploading" : ""}`}
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={handleDrop}
                        onClick={() => !uploading && fileInputRef.current?.click()}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".jpg,.jpeg,.png,.pdf"
                            onChange={handleFileSelect}
                            hidden
                        />
                        {uploading ? (
                            <>
                                <span className="spinner large" />
                                <p className="dropzone-text">Uploading…</p>
                            </>
                        ) : (
                            <>
                                <span className="dropzone-icon">☁️</span>
                                <p className="dropzone-text">
                                    Drag & drop a file here, or <span className="dropzone-link">browse</span>
                                </p>
                                <p className="dropzone-hint">JPEG, PNG, or PDF — max 10 MB</p>
                            </>
                        )}
                    </div>

                    <div className="upload-options">
                        <div className="upload-type-toggle">
                            <button
                                className={`toggle-btn ${uploadType === "record" ? "active" : ""}`}
                                onClick={() => setUploadType("record")}
                            >
                                📋 Record
                            </button>
                            <button
                                className={`toggle-btn ${uploadType === "report" ? "active" : ""}`}
                                onClick={() => setUploadType("report")}
                            >
                                📊 Report
                            </button>
                        </div>
                        <input
                            type="text"
                            className="text-input notes-input"
                            placeholder="Add notes (optional)"
                            value={uploadNotes}
                            onChange={(e) => setUploadNotes(e.target.value)}
                        />
                    </div>
                </section>

                {error && <div className="error-msg">{error}</div>}

                {/* Filter Tabs */}
                <div className="filter-tabs">
                    {(["all", "record", "report"] as FilterType[]).map((f) => (
                        <button
                            key={f}
                            className={`filter-tab ${filter === f ? "active" : ""}`}
                            onClick={() => setFilter(f)}
                        >
                            {f === "all" ? "All" : f === "record" ? "📋 Records" : "📊 Reports"}
                            {f === "all" && <span className="tab-count">{records.length}</span>}
                            {f !== "all" && (
                                <span className="tab-count">
                                    {records.filter((r) => r.record_type === f).length}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Records Grid */}
                {loading ? (
                    <div className="records-loading">
                        <span className="spinner large" />
                    </div>
                ) : filteredRecords.length === 0 ? (
                    <div className="records-empty">
                        <span className="empty-icon">📂</span>
                        <h3>No records yet</h3>
                        <p>Upload your medical records and reports above to get started.</p>
                    </div>
                ) : (
                    <div className="records-grid">
                        {filteredRecords.map((r) => (
                            <div
                                key={r.id}
                                className="record-card"
                                onClick={() => setPreviewRecord(r)}
                            >
                                <div className="record-thumbnail">
                                    {r.content_type.startsWith("image/") ? (
                                        <img src={getPreviewUrl(r.preview_url)} alt={r.file_name} loading="lazy" />
                                    ) : (
                                        <span className="pdf-icon">📄</span>
                                    )}
                                </div>
                                <div className="record-info">
                                    <p className="record-name" title={r.file_name}>
                                        {getTypeIcon(r.content_type)} {r.file_name}
                                    </p>
                                    <div className="record-meta">
                                        <span className={`type-badge ${r.record_type}`}>
                                            {r.record_type}
                                        </span>
                                        <span>{formatSize(r.file_size)}</span>
                                        <span>{formatDate(r.uploaded_at)}</span>
                                    </div>
                                    {r.notes && <p className="record-notes">{r.notes}</p>}
                                </div>
                                <button
                                    className="record-delete-btn"
                                    title="Delete"
                                    onClick={(e) => { e.stopPropagation(); setDeleteTarget(r); }}
                                >
                                    🗑️
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Preview Modal */}
            {previewRecord && (
                <div className="modal-overlay" onClick={() => setPreviewRecord(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{previewRecord.file_name}</h3>
                            <div className="modal-header-actions">
                                {!previewRecord.ai_analysis && (
                                    <button
                                        className="btn-analyze"
                                        onClick={handleAnalyze}
                                        disabled={analyzing}
                                    >
                                        {analyzing ? <><span className="spinner" /> Analyzing…</> : "🤖 Analyze"}
                                    </button>
                                )}
                                <button className="modal-close" onClick={() => setPreviewRecord(null)}>✕</button>
                            </div>
                        </div>
                        <div className="modal-body">
                            {previewRecord.content_type.startsWith("image/") ? (
                                <img
                                    src={getPreviewUrl(previewRecord.preview_url)}
                                    alt={previewRecord.file_name}
                                    className="preview-image"
                                />
                            ) : (
                                <div className="pdf-preview">
                                    <span className="pdf-big-icon">📄</span>
                                    <p>PDF files cannot be previewed inline.</p>
                                    <a
                                        href={getPreviewUrl(previewRecord.preview_url)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn-primary pdf-download-btn"
                                    >
                                        Open PDF ↗
                                    </a>
                                </div>
                            )}

                            {/* AI Insights */}
                            {previewRecord.ai_analysis && renderAIInsights(previewRecord.ai_analysis)}
                        </div>
                        <div className="modal-footer">
                            <span className={`type-badge ${previewRecord.record_type}`}>
                                {previewRecord.record_type}
                            </span>
                            <span>{formatSize(previewRecord.file_size)}</span>
                            <span>{formatDate(previewRecord.uploaded_at)}</span>
                            {previewRecord.analyzed_at && (
                                <span className="ai-badge">🤖 Analyzed {formatDate(previewRecord.analyzed_at)}</span>
                            )}
                            {previewRecord.notes && (
                                <p className="modal-notes">📝 {previewRecord.notes}</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteTarget && (
                <div className="modal-overlay" onClick={() => !deleting && setDeleteTarget(null)}>
                    <div className="modal-content modal-small" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Delete Record?</h3>
                        </div>
                        <div className="modal-body">
                            <p>
                                Are you sure you want to delete <strong>{deleteTarget.file_name}</strong>?
                                This action cannot be undone.
                            </p>
                        </div>
                        <div className="modal-actions">
                            <button
                                className="btn-outline"
                                onClick={() => setDeleteTarget(null)}
                                disabled={deleting}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn-danger"
                                onClick={handleDelete}
                                disabled={deleting}
                            >
                                {deleting ? <span className="spinner" /> : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
