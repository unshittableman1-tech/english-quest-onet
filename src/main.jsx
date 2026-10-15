import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './styles/theme.css'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  retry = () => window.location.reload();
  goHome = () => { window.location.href = `${window.location.origin}${window.location.pathname}`; };
  render() {
    if (this.state.hasError) {
      return (
        <main className="app-error-page">
          <section className="app-error-card" role="alert">
            <span className="app-error-icon" aria-hidden="true">!</span>
            <p className="app-error-eyebrow">English Quest AI</p>
            <h1>หน้านี้สะดุดนิดหน่อย</h1>
            <p>ข้อมูลของนักเรียนยังอยู่ครบ ลองโหลดใหม่หรือกลับไปเริ่มจากหน้าแผนที่ได้เลย</p>
            <div><button className="eq-btn" onClick={this.retry}>ลองโหลดใหม่</button><button className="eq-btn ghost" onClick={this.goHome}>กลับหน้าหลัก</button></div>
            {import.meta.env.DEV && <details><summary>รายละเอียดสำหรับผู้พัฒนา</summary><pre>{this.state.error?.stack || this.state.error?.toString()}</pre></details>}
          </section>
        </main>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
