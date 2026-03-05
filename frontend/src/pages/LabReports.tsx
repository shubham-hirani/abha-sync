import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { recordsApi } from "../services/api";

interface LabRecord {
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

export default function LabReports() {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [records, setRecords] = useState<LabRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");
    const [dragOver, setDragOver] = useState(false);
    const [uploadNotes, setUploadNotes] = useState("");

    // Preview modal
    const [previewRecord, setPreviewRecord] = useState<LabRecord | null>(null);

    // Delete confirmation
    const [deleteTarget, setDeleteTarget] = useState<LabRecord | null>(null);
    const [deleting, setDeleting] = useState(false);

    // AI Analysis
    const [analyzing, setAnalyzing] = useState(false);

    const loadRecords = useCallback(async () => {
        try {
            const res = await recordsApi.list();
            // Filter only lab_report type
            const labReports = res.data.records.filter(
                (r: LabRecord) => r.record_type === "lab_report"
            );
            setRecords(labReports);
        } catch {
            setError("Failed to load lab reports.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadRecords();
    }, [loadRecords]);

    const handleUpload = async (file: File) => {
        setError("");
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
            await recordsApi.upload(file, "lab_report", uploadNotes);
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
            setError("Failed to delete lab report.");
        } finally {
            setDeleting(false);
        }
    };

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

    const urgencyColor: { [key: string]: string } = {
        routine: "#22c55e", soon: "#f59e0b", urgent: "#ef4444",
        not_needed: "#22c55e", routine_checkup: "#22c55e",
        within_a_week: "#f59e0b", see_doctor_soon: "#ef4444", emergency: "#dc2626",
    };
    const urgencyLabel: { [key: string]: string } = {
        routine: "🟢 Routine follow-up", soon: "🟡 See doctor soon", urgent: "🔴 Urgent — see doctor",
        not_needed: "🟢 No doctor visit needed", routine_checkup: "🟢 Routine checkup recommended",
        within_a_week: "🟡 Visit within a week", see_doctor_soon: "🔴 See doctor soon", emergency: "🚨 Emergency — go now",
    };
    const verdictStyle: { [key: string]: { color: string; label: string } } = {
        good: { color: "#22c55e", label: "✅ Overall Health: Good" },
        attention_needed: { color: "#f59e0b", label: "⚠️ Overall Health: Needs Attention" },
        action_required: { color: "#ef4444", label: "❗ Overall Health: Action Required" },
    };

    const renderAIInsights = (analysisJson: string) => {
        try {
            const data = JSON.parse(analysisJson);
            const isPrescription = data.analysis_type === "prescription";
            const isLabReport = data.analysis_type === "lab_report";
            const isGeneric = data.analysis_type === "medical_document";

            return (
                <div className="ai-insights">
                    <h4 className="ai-insights-title">🤖 AI Health Insights</h4>

                    {/* Test name header */}
                    {isLabReport && data.test_name && (
                        <div className="ai-test-name">🧪 {data.test_name}</div>
                    )}

                    {/* Prescription: Doctor & Date */}
                    {isPrescription && (data.doctor_name || data.date) && (
                        <div className="ai-meta-row">
                            {data.doctor_name && data.doctor_name !== "Not specified" && (
                                <span className="ai-meta-item">👨‍⚕️ <strong>Doctor:</strong> {data.doctor_name}</span>
                            )}
                            {data.date && data.date !== "Not specified" && (
                                <span className="ai-meta-item">📅 <strong>Date:</strong> {data.date}</span>
                            )}
                        </div>
                    )}

                    {data.summary && <p className="ai-summary">{data.summary}</p>}

                    {/* Generic: What this means */}
                    {isGeneric && data.what_this_means_for_you && (
                        <div className="ai-means-for-you">
                            <strong>💡 What this means for you:</strong>
                            <p>{data.what_this_means_for_you}</p>
                        </div>
                    )}

                    {/* Verdict */}
                    {isLabReport && data.overall_health_verdict && verdictStyle[data.overall_health_verdict] && (
                        <div className="ai-verdict" style={{ color: verdictStyle[data.overall_health_verdict].color }}>
                            {verdictStyle[data.overall_health_verdict].label}
                        </div>
                    )}

                    {/* Lab parameters */}
                    {isLabReport && data.parameters?.length > 0 && (
                        <div className="ai-section">
                            <h5>🔬 Test Results Explained</h5>
                            {data.parameters.map((p: any, i: number) => (
                                <div key={i} className={`ai-param-card ai-param-${p.status}`}>
                                    <div className="ai-param-header">
                                        <span className="ai-param-name">{p.name}</span>
                                        <span className={`ai-status ai-status-${p.status}`}>{p.status?.toUpperCase()}</span>
                                    </div>
                                    <div className="ai-param-values">
                                        <span>Your value: <strong>{p.value}</strong></span>
                                        <span>Healthy range: {p.reference_range}</span>
                                    </div>
                                    {p.plain_meaning && <p className="ai-param-meaning">{p.plain_meaning}</p>}
                                    {p.what_to_do && p.what_to_do !== "Not specified" && (
                                        <p className="ai-param-action">✅ {p.what_to_do}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Prescription drugs */}
                    {isPrescription && data.drugs?.length > 0 && (
                        <div className="ai-section">
                            <h5>💊 Your Medicines</h5>
                            {data.drugs.map((d: any, i: number) => (
                                <div key={i} className="ai-drug-card">
                                    <div className="ai-drug-header">
                                        <strong>{d.name}</strong>
                                        {(d.dosage || d.frequency) && (
                                            <span className="ai-drug-dose">
                                                {[d.dosage, d.frequency].filter(Boolean).join(" · ")}
                                            </span>
                                        )}
                                    </div>
                                    {d.what_it_is && d.what_it_is !== "Not specified" && (
                                        <p className="ai-drug-desc">{d.what_it_is}</p>
                                    )}
                                    <div className="ai-drug-grid">
                                        {d.when_to_take && d.when_to_take !== "Not specified" && (
                                            <div><span>⏰ When:</span> {d.when_to_take}</div>
                                        )}
                                        {d.duration && d.duration !== "Not specified" && (
                                            <div><span>📅 Duration:</span> {d.duration}</div>
                                        )}
                                        {d.food_interactions && d.food_interactions !== "Not specified" && (
                                            <div className="ai-drug-grid-full"><span>🍽️ Food & drink:</span> {d.food_interactions}</div>
                                        )}
                                        {d.instructions && d.instructions !== "Not specified" && (
                                            <div className="ai-drug-grid-full"><span>📝 Special instructions:</span> {d.instructions}</div>
                                        )}
                                    </div>
                                    {d.side_effects?.length > 0 && (
                                        <div className="ai-drug-side-effects">
                                            <div className="ai-side-effects-title">⚠️ Possible side effects</div>
                                            <ul>{d.side_effects.map((s: string, j: number) => <li key={j}>{s}</li>)}</ul>
                                        </div>
                                    )}
                                    {d.warnings?.length > 0 && (
                                        <div className="ai-warnings">
                                            {d.warnings.map((w: string, j: number) => (
                                                <span key={j} className="ai-warning-badge">⛔ {w}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Generic: Key findings */}
                    {isGeneric && data.key_findings?.length > 0 && (
                        <div className="ai-section">
                            <h5>📋 Key Findings</h5>
                            <ul className="ai-list">
                                {data.key_findings.map((f: string, i: number) => <li key={i}>{f}</li>)}
                            </ul>
                        </div>
                    )}

                    {/* Abnormal findings */}
                    {data.abnormal_findings?.length > 0 && (
                        <div className="ai-section">
                            <h5>⚠️ Things to Pay Attention To</h5>
                            {data.abnormal_findings.map((f: any, i: number) => (
                                <div key={i} className={`ai-finding ai-finding-${f.severity || "mild"}`}>
                                    <strong>{typeof f === "string" ? f : f.parameter}</strong>
                                    {f.concern && <p>{f.concern}</p>}
                                    {f.severity && (
                                        <span className={`ai-severity-badge ai-severity-${f.severity}`}>
                                            {f.severity.charAt(0).toUpperCase() + f.severity.slice(1)}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Diet & Lifestyle */}
                    {isLabReport && data.diet_and_lifestyle?.length > 0 && (
                        <div className="ai-section">
                            <h5>🥗 Diet & Lifestyle Tips</h5>
                            <ul className="ai-list">
                                {data.diet_and_lifestyle.map((tip: string, i: number) => <li key={i}>{tip}</li>)}
                            </ul>
                        </div>
                    )}

                    {/* Supplements */}
                    {isLabReport && data.medicines_and_supplements?.length > 0 && (
                        <div className="ai-section">
                            <h5>💊 Supplements That May Help</h5>
                            {data.medicines_and_supplements.map((s: any, i: number) => (
                                <div key={i} className="ai-supplement">
                                    <div className="ai-supplement-name"><strong>{s.name}</strong></div>
                                    {s.reason && <p className="ai-supplement-reason">{s.reason}</p>}
                                    {s.caution && <p className="ai-supplement-caution">⚠️ {s.caution}</p>}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Prescription: General Precautions */}
                    {isPrescription && data.general_precautions?.length > 0 && (
                        <div className="ai-section">
                            <h5>📋 General Precautions</h5>
                            <ul className="ai-list">
                                {data.general_precautions.map((p: string, i: number) => <li key={i}>{p}</li>)}
                            </ul>
                        </div>
                    )}

                    {/* Recommendations */}
                    {data.recommendations?.length > 0 && (
                        <div className="ai-section ai-recommendations">
                            <h5>💡 Recommendations</h5>
                            <ol className="ai-rec-list">
                                {data.recommendations.map((r: string, i: number) => <li key={i}>{r}</li>)}
                            </ol>
                        </div>
                    )}

                    {/* When to see doctor */}
                    {data.when_to_see_doctor && (
                        <div className="ai-doctor-advice" style={{ borderColor: urgencyColor[data.when_to_see_doctor.urgency] ?? "#64748b" }}>
                            <div className="ai-doctor-urgency" style={{ color: urgencyColor[data.when_to_see_doctor.urgency] ?? "#64748b" }}>
                                {urgencyLabel[data.when_to_see_doctor.urgency] ?? "🩺 Doctor Advice"}
                            </div>
                            {(data.when_to_see_doctor.plain_recommendation || data.when_to_see_doctor.reason) && (
                                <p>{data.when_to_see_doctor.plain_recommendation || data.when_to_see_doctor.reason}</p>
                            )}
                            {data.when_to_see_doctor.red_flags?.length > 0 && (
                                <div className="ai-red-flags">
                                    <strong>🚨 Go to the hospital immediately if:</strong>
                                    <ul>{data.when_to_see_doctor.red_flags.map((f: string, i: number) => <li key={i}>{f}</li>)}</ul>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Reassurance (prescription only) */}
                    {isPrescription && data.reassurance && data.reassurance !== "Not specified" && (
                        <div className="ai-reassurance">💙 {data.reassurance}</div>
                    )}
                </div>
            );
        } catch {
            return <p className="ai-error">Could not parse analysis results.</p>;
        }
    };



    return (

        <div className="dashboard-container">
            <header className="dashboard-header">
                <div className="header-brand">
                    <button onClick={() => navigate("/dashboard")} className="btn-back" title="Back">
                        ←
                    </button>
                    <span className="brand-icon">🔬</span>
                    <span className="brand-name">Lab Reports</span>
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
                                <span className="dropzone-icon">🧪</span>
                                <p className="dropzone-text">
                                    Drag & drop a lab report here, or <span className="dropzone-link">browse</span>
                                </p>
                                <p className="dropzone-hint">JPEG, PNG, or PDF — max 10 MB</p>
                            </>
                        )}
                    </div>

                    <div className="upload-options">
                        <input
                            type="text"
                            className="text-input notes-input"
                            placeholder="Add notes — e.g. Blood test, CBC (optional)"
                            value={uploadNotes}
                            onChange={(e) => setUploadNotes(e.target.value)}
                            style={{ flex: 1 }}
                        />
                    </div>
                </section>

                {error && <div className="error-msg">{error}</div>}

                {/* Records Grid */}
                {loading ? (
                    <div className="records-loading">
                        <span className="spinner large" />
                    </div>
                ) : records.length === 0 ? (
                    <div className="records-empty">
                        <span className="empty-icon">🧬</span>
                        <h3>No lab reports yet</h3>
                        <p>Upload your blood tests, X-rays, and other lab reports above.</p>
                    </div>
                ) : (
                    <div className="records-grid">
                        {records.map((r) => (
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
                                        🔬 {r.file_name}
                                    </p>
                                    <div className="record-meta">
                                        <span className="type-badge lab_report">lab report</span>
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
                            <span className="type-badge lab_report">lab report</span>
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
                            <h3>Delete Lab Report?</h3>
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
