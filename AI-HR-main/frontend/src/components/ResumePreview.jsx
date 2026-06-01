import { Download, ExternalLink, FileText, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client.js";

async function readBlobError(blob) {
  try {
    const text = await blob.text();
    const json = JSON.parse(text);
    return json.message || "Could not load resume file.";
  } catch {
    return "Could not load resume file.";
  }
}

export default function ResumePreview({ candidateId, candidateName, resumeFile, resumeText }) {
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [isPdf, setIsPdf] = useState(false);
  const [error, setError] = useState(null);
  const blobRef = useRef(null);

  const hasFile = Boolean(resumeFile?.path);
  const hasText = Boolean(resumeText?.trim());

  useEffect(() => {
    if (!hasFile || !candidateId) {
      setLoading(false);
      setPreviewUrl(null);
      setDownloadUrl(null);
      setIsPdf(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    setPreviewUrl(null);
    setDownloadUrl(null);

    if (blobRef.current) {
      URL.revokeObjectURL(blobRef.current);
      blobRef.current = null;
    }

    (async () => {
      try {
        const { data, status, headers } = await api.get(`/candidates/${candidateId}/resume`, {
          responseType: "blob"
        });

        if (cancelled) return;

        if (status !== 200) {
          throw new Error(await readBlobError(data));
        }

        const contentType = headers["content-type"] || data.type || "";
        if (contentType.includes("application/json")) {
          throw new Error(await readBlobError(data));
        }

        const name = resumeFile.originalName || "";
        const pdf =
          contentType.includes("application/pdf") ||
          data.type === "application/pdf" ||
          name.toLowerCase().endsWith(".pdf");

        const blob = data.type ? data : new Blob([data], { type: pdf ? "application/pdf" : contentType || data.type });
        const blobUrl = URL.createObjectURL(blob);
        blobRef.current = blobUrl;
        setDownloadUrl(blobUrl);
        setIsPdf(pdf);
        setPreviewUrl(pdf ? blobUrl : null);
      } catch (err) {
        if (cancelled || err?.code === "ERR_CANCELED") return;
        setError(
          err?.response?.status === 404
            ? "Resume file not found. Re-upload the resume from the Upload page."
            : err?.message || "Could not load the original file. Try re-uploading the resume."
        );
        setPreviewUrl(null);
        setDownloadUrl(null);
        setIsPdf(false);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      if (blobRef.current) {
        URL.revokeObjectURL(blobRef.current);
        blobRef.current = null;
      }
    };
  }, [candidateId, hasFile, resumeFile?.path, resumeFile?.originalName]);

  return (
    <section className="card" id="resume-preview">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FileText size={20} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-text-primary">Resume Preview</h3>
            <p className="text-xs text-text-muted">
              {hasFile
                ? resumeFile.originalName || "Uploaded file"
                : hasText
                  ? "Extracted text (no file on record)"
                  : "No resume attached"}
            </p>
          </div>
        </div>
        {downloadUrl && (
          <a
            href={downloadUrl}
            download={resumeFile?.originalName || `${candidateName || "candidate"}_resume`}
            className="btn btn-secondary"
          >
            <Download size={18} />
            Download
          </a>
        )}
      </div>

      {loading && (
        <div className="rounded-xl border border-border bg-background/50 p-12 text-center text-text-muted text-sm animate-pulse">
          Loading resume preview...
        </div>
      )}

      {!loading && error && (
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-300">
          {error}
        </div>
      )}

      {!loading && !error && hasFile && isPdf && previewUrl && (
        <div className="rounded-2xl overflow-hidden border border-border bg-[#525659] h-[min(800px,75vh)] shadow-2xl">
          <object
            data={previewUrl}
            type="application/pdf"
            className="h-full w-full bg-white"
            title={`${candidateName || "Candidate"} resume preview`}
          >
            <iframe src={previewUrl} className="h-full w-full bg-white" title={`${candidateName || "Candidate"} resume preview`} />
          </object>
        </div>
      )}

      {!loading && !error && hasFile && !isPdf && downloadUrl && (
        <div className="rounded-xl border border-dashed border-border bg-background/50 p-10 text-center">
          <p className="text-text-secondary mb-4 max-w-lg mx-auto">
            This resume is a Word document. Browsers cannot embed DOCX files — download it to view in Word or another app.
          </p>
          <a
            href={downloadUrl}
            download={resumeFile.originalName || "resume.docx"}
            className="btn btn-primary inline-flex"
          >
            <ExternalLink size={18} /> Open / Download DOCX
          </a>
        </div>
      )}

      {!loading && !error && !hasFile && hasText && (
        <div className="rounded-2xl border border-border bg-background/40 overflow-hidden">
          <div className="border-b border-border bg-elevated/50 px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-text-muted">
            Parsed resume content
          </div>
          <pre className="max-h-[min(600px,60vh)] overflow-auto p-6 text-sm leading-relaxed text-text-secondary whitespace-pre-wrap font-sans">
            {resumeText.trim()}
          </pre>
        </div>
      )}

      {!loading && !error && !hasFile && !hasText && (
        <div className="rounded-xl border border-dashed border-border bg-background/30 p-10 text-center">
          <FileText className="mx-auto mb-4 text-text-muted" size={40} />
          <p className="text-text-secondary mb-6">
            No resume file or extracted text for {candidateName || "this candidate"} yet.
          </p>
          <Link to="/upload" className="btn btn-primary inline-flex">
            <Upload size={18} /> Upload Resume
          </Link>
        </div>
      )}
    </section>
  );
}
