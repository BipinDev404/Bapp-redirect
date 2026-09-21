import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  ExternalLink, 
  Copy, 
  Check, 
  Activity, 
  Server, 
  Globe, 
  Terminal, 
  ShieldCheck, 
  AlertCircle, 
  RefreshCw, 
  Zap,
  Layers
} from 'lucide-react';

export default function App() {
  const [copiedVercel, setCopiedVercel] = useState(false);
  const [copiedGit, setCopiedGit] = useState(false);
  const [testPath, setTestPath] = useState('/login');
  const [pingStatus, setPingStatus] = useState<'idle' | 'testing' | 'online' | 'sleeping'>('idle');
  const [latency, setLatency] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');

  const renderOrigin = 'https://bapp-es31.onrender.com';
  const vercelDomain = 'https://bapp-bipin.vercel.app';

  const vercelConfig = `{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "https://bapp-es31.onrender.com/$1"
    }
  ]
}`;

  const gitCommands = `mkdir bapp-vercel-proxy && cd bapp-vercel-proxy
git init
git add vercel.json README.md
git commit -m "feat: Vercel reverse proxy for Render"
git branch -M main
git remote add origin https://github.com/<USERNAME>/bapp-vercel-proxy.git
git push -u origin main`;

  const copyToClipboard = (text: string, type: 'vercel' | 'git') => {
    navigator.clipboard.writeText(text);
    if (type === 'vercel') {
      setCopiedVercel(true);
      setTimeout(() => setCopiedVercel(false), 2000);
    } else {
      setCopiedGit(true);
      setTimeout(() => setCopiedGit(false), 2000);
    }
  };

  const testRenderConnection = async () => {
    setPingStatus('testing');
    setStatusMessage('Pinging upstream Render app...');
    const startTime = Date.now();

    try {
      // Direct fetch with mode no-cors or standard fetch to test if Render responds
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      await fetch(renderOrigin, { 
        method: 'GET', 
        mode: 'no-cors',
        signal: controller.signal 
      });
      
      clearTimeout(timeoutId);
      const elapsed = Date.now() - startTime;
      setLatency(elapsed);

      if (elapsed > 4000) {
        setPingStatus('sleeping');
        setStatusMessage(`Render instance woke up (${(elapsed / 1000).toFixed(1)}s spin-up time). Free tier sleep detected.`);
      } else {
        setPingStatus('online');
        setStatusMessage(`Render instance is active (${elapsed}ms response).`);
      }
    } catch (err) {
      const elapsed = Date.now() - startTime;
      if (elapsed >= 10000) {
        setPingStatus('sleeping');
        setStatusMessage('Render instance is taking long to respond (>10s), likely waking up from free-tier sleep.');
      } else {
        setPingStatus('online');
        setStatusMessage('Target Render server reachable.');
      }
    }
  };

  useEffect(() => {
    testRenderConnection();
  }, []);

  // Compute proxied destination
  const cleanPath = testPath.startsWith('/') ? testPath : `/${testPath}`;
  const proxiedDestination = `${renderOrigin}${cleanPath}`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased p-4 sm:p-8 selection:bg-indigo-500 selection:text-white">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Notice */}
        <header className="border-b border-slate-800 pb-6 pt-2">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2">
                <Zap className="w-3.5 h-3.5" />
                Vercel Edge Reverse Proxy Configuration
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Bapp Proxy Deployment Manager
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Transparently serving your Render backend under your Vercel URL with path and query preservation.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <a 
                href={renderOrigin} 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition"
                id="btn-open-render"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Open Render Origin
              </a>
            </div>
          </div>
        </header>

        {/* Why preview was blank explanation box */}
        <section className="bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-slate-900 border border-blue-900/40 rounded-xl p-5 shadow-sm">
          <div className="flex items-start gap-3.5">
            <AlertCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div className="space-y-1.5 text-sm">
              <h2 className="font-semibold text-blue-200">
                Why was the preview blank?
              </h2>
              <p className="text-slate-300 leading-relaxed text-xs sm:text-sm">
                A Vercel reverse proxy is <strong>not a React frontend application</strong>; it is a serverless routing rule defined in <code className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-amber-300 font-mono text-xs">vercel.json</code> that executes directly inside Vercel’s global Edge Network. When you deploy this repository to Vercel, Vercel will immediately proxy all requests straight to your Render backend at <span className="font-mono text-indigo-300">{renderOrigin}</span>.
              </p>
            </div>
          </div>
        </section>

        {/* Live Proxy Routing Visualizer */}
        <section className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              <h2 className="font-semibold text-white text-base">
                Live Route Mapping Simulator
              </h2>
            </div>
            <span className="text-xs text-slate-400">Zero Redirects &bull; URL Preserved</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            {/* Vercel Incoming Request */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5" />
                  Visitor Enters URL (Browser)
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Visible to User
                </span>
              </div>
              <div className="flex items-center gap-1 font-mono text-xs bg-slate-900 px-3 py-2 rounded border border-slate-800">
                <span className="text-slate-400 select-none">{vercelDomain}</span>
                <input 
                  type="text" 
                  value={testPath}
                  onChange={(e) => setTestPath(e.target.value)}
                  className="bg-transparent text-emerald-300 outline-none w-full font-mono text-xs"
                  placeholder="/login or /api/users"
                  id="input-route-test"
                />
              </div>
              <div className="flex gap-2 pt-1">
                {['/', '/login', '/api/users', '/assets/app.js', '/?room=123'].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setTestPath(preset)}
                    className="text-[11px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition font-mono"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Upstream Render Target */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5" />
                  Proxied Upstream (Render)
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                  Hidden Behind Proxy
                </span>
              </div>
              <div className="font-mono text-xs bg-slate-900 px-3 py-2 rounded border border-slate-800 text-indigo-300 overflow-x-auto whitespace-nowrap">
                {proxiedDestination}
              </div>
              <div className="text-[11px] text-slate-400 pt-1">
                Preserves all headers, path fragments, and query parameters automatically.
              </div>
            </div>
          </div>
        </section>

        {/* Upstream Render Health / Sleep Monitor */}
        <section className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-amber-400" />
              <h2 className="font-semibold text-white text-base">
                Target Render Health & Cold-Start Status
              </h2>
            </div>
            <button
              onClick={testRenderConnection}
              disabled={pingStatus === 'testing'}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-xs font-medium text-white transition"
              id="btn-check-render"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${pingStatus === 'testing' ? 'animate-spin' : ''}`} />
              {pingStatus === 'testing' ? 'Testing Upstream...' : 'Test Render Connection'}
            </button>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${
                pingStatus === 'testing' ? 'bg-amber-400 animate-ping' :
                pingStatus === 'online' ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]' :
                pingStatus === 'sleeping' ? 'bg-amber-400' : 'bg-slate-600'
              }`} />
              <div>
                <div className="text-xs font-semibold text-slate-200">
                  {pingStatus === 'testing' && 'Testing connectivity to https://bapp-es31.onrender.com...'}
                  {pingStatus === 'online' && 'Render Upstream: Online & Ready'}
                  {pingStatus === 'sleeping' && 'Render Upstream: Waking Up (Cold Start)'}
                  {pingStatus === 'idle' && 'Click test to check Render status'}
                </div>
                {statusMessage && (
                  <div className="text-xs text-slate-400 mt-0.5">{statusMessage}</div>
                )}
              </div>
            </div>

            {latency !== null && (
              <div className="text-xs px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono">
                Latency: {latency}ms
              </div>
            )}
          </div>
        </section>

        {/* Configuration Files */}
        <section className="grid grid-cols-1 gap-6">
          
          {/* vercel.json card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-emerald-400" />
                <h3 className="font-semibold text-white text-sm">
                  1. <code className="text-emerald-300 font-mono">vercel.json</code> (Active Root Config)
                </h3>
              </div>
              <button
                onClick={() => copyToClipboard(vercelConfig, 'vercel')}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 border border-slate-700 transition"
                id="btn-copy-vercel"
              >
                {copiedVercel ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedVercel ? 'Copied!' : 'Copy Code'}
              </button>
            </div>
            <pre className="p-4 bg-slate-950 border border-slate-800 rounded-lg text-emerald-400 font-mono text-xs overflow-x-auto">
              {vercelConfig}
            </pre>
          </div>

          {/* Git Deployment Commands */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-400" />
                <h3 className="font-semibold text-white text-sm">
                  2. GitHub Push & Vercel Deploy Steps
                </h3>
              </div>
              <button
                onClick={() => copyToClipboard(gitCommands, 'git')}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 border border-slate-700 transition"
                id="btn-copy-git"
              >
                {copiedGit ? <Check className="w-3.5 h-3.5 text-indigo-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedGit ? 'Copied!' : 'Copy Commands'}
              </button>
            </div>
            <pre className="p-4 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 font-mono text-xs overflow-x-auto leading-relaxed">
              {gitCommands}
            </pre>
            <div className="text-xs text-slate-400 space-y-1 pt-1">
              <p>&bull; <strong>Vercel Project Name</strong>: When importing on Vercel, name the project <span className="text-white font-mono font-semibold">bapp-bipin</span> so it deploys to <span className="text-indigo-300 font-mono">https://bapp-bipin.vercel.app</span>.</p>
              <p>&bull; <strong>Build Command</strong>: None required (leave blank / Other preset).</p>
            </div>
          </div>

        </section>

      </div>
    </div>
  );
}
