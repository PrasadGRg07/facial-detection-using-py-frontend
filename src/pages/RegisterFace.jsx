import { useState, useRef } from 'react';
import { registerFace } from '../api';

export default function RegisterFace({ onSuccess, addToast }) {
  const [name, setName] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragover, setDragover] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (file) => {
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragover(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) handleFileChange(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) { addToast('Please enter a name.', 'error'); return; }
    if (!imageFile)   { addToast('Please select a photo.', 'error'); return; }

    setLoading(true);
    try {
      const res = await registerFace(name.trim(), imageFile);
      addToast(res.message || `'${name}' registered!`, 'success');
      setName('');
      setImageFile(null);
      setPreview(null);
      onSuccess();
    } catch (err) {
      addToast(err.message || 'Registration failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setImageFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div>
      <div className="page-header">
        <h2>Register a New Face</h2>
        <p>Upload a clear photo and give the person a name</p>
      </div>

      <div style={{ maxWidth: 540 }}>
        <div className="card">
          <form onSubmit={handleSubmit}>
            {/* Name Input */}
            <div className="form-group">
              <label className="form-label" htmlFor="face-name">Full Name</label>
              <input
                id="face-name"
                className="form-input"
                type="text"
                placeholder="e.g. John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Upload Zone */}
            <div className="form-group">
              <label className="form-label">Photo</label>

              {!preview ? (
                <div
                  className={`upload-zone ${dragover ? 'dragover' : ''}`}
                  onDragOver={(e) => { e.preventDefault(); setDragover(true); }}
                  onDragLeave={() => setDragover(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => handleFileChange(e.target.files[0])}
                  />
                  <div className="upload-icon">🖼️</div>
                  <div className="upload-text">Click or drag & drop a photo</div>
                  <div className="upload-subtext">JPG, PNG · Best results with a clear, front-facing photo</div>
                </div>
              ) : (
                <div>
                  <img src={preview} alt="Preview" className="preview-img" />
                  <div style={{ marginTop: 10 }}>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={reset}>
                      🔄 Change Photo
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              id="register-submit-btn"
              type="submit"
              className="btn btn-primary w-full"
              disabled={loading}
              style={{ marginTop: 8 }}
            >
              {loading ? (
                <>
                  <span className="spinner" />
                  Processing...
                </>
              ) : (
                <>➕ Register Face</>
              )}
            </button>
          </form>

          {/* Tips */}
          <div style={{
            marginTop: 24,
            padding: '14px 16px',
            background: 'var(--accent-dim)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border)',
          }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              📸 Tips for best results
            </div>
            <ul style={{ fontSize: 12.5, color: 'var(--text-secondary)', paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <li>Use a well-lit, front-facing photo</li>
              <li>One face per image for accuracy</li>
              <li>Avoid sunglasses or heavy accessories</li>
              <li>Higher resolution photos work better</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
